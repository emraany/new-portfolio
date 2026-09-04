import { NextResponse } from 'next/server';

/**
 * Guards for the public API routes.
 *
 * `POST /api/recommendations` writes to a real, public TMDB list under the
 * owner's account, and it takes that write from anyone on the internet with
 * no auth. Nothing here makes it authenticated — it is a "recommend me a
 * film" box and it is supposed to be open — but an open endpoint still needs
 * to bound what a single caller can do with it.
 */

/* ----------------------------------------------------------------
   Rate limiting
   ---------------------------------------------------------------- */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * In-memory, and therefore per-instance: on a serverless platform this bounds
 * a caller per warm lambda rather than globally. That is a real limitation and
 * worth stating plainly — but the thing being prevented is someone looping a
 * script against the endpoint, and this stops that without introducing a
 * datastore to a site that otherwise has none.
 */
export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  existing.count++;
  return {
    allowed: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  };
}

/**
 * Best-effort client identity.
 *
 * Spoofable — `x-forwarded-for` is caller-supplied unless a trusted proxy
 * overwrites it — so this is a speed bump for casual abuse, not an identity.
 */
export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  return `${scope}:${ip}`;
}

export function rateLimitResponse(resetAt: number): NextResponse {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return NextResponse.json(
    { error: 'Too many requests. Try again shortly.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}

/* ----------------------------------------------------------------
   Input validation
   ---------------------------------------------------------------- */

/** A non-empty string within a length bound. */
export function isBoundedString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

/**
 * A plausible TMDB id.
 *
 * `typeof x === 'number'` was the whole check, which accepts 0, negatives,
 * floats and absurd magnitudes — each of which becomes a request to TMDB on
 * the owner's write quota.
 */
export function isTmdbId(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value > 0 &&
    value < 100_000_000
  );
}

/**
 * Read a JSON body, refusing one that is implausibly large.
 *
 * `request.json()` has no size bound of its own, so a huge body is parsed in
 * process before anything gets to reject it.
 */
export async function readJsonBody(
  request: Request,
  maxBytes = 8 * 1024
): Promise<Record<string, unknown> | null> {
  const declared = request.headers.get('content-length');
  if (declared && Number(declared) > maxBytes) return null;

  const text = await request.text();
  if (text.length > maxBytes) return null;

  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/* ----------------------------------------------------------------
   Errors
   ---------------------------------------------------------------- */

/**
 * Never let an upstream error body reach the client.
 *
 * The dev-only passthrough this replaces returned TMDB's own response text,
 * which is exactly the kind of thing that is fine until the day NODE_ENV is
 * not what someone assumed.
 */
export function sanitizeError(error: unknown, context: string): NextResponse {
  console.error(`${context}:`, error);
  return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
}
