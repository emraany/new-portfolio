import { NextResponse } from 'next/server';
import {
  addRecommendationToTmdbList,
  getRecommendationsFromTmdbList,
} from '@/lib/tmdb-list';
import {
  checkRateLimit,
  clientKey,
  isBoundedString,
  isTmdbId,
  rateLimitResponse,
  readJsonBody,
  sanitizeError,
} from '@/lib/api-guards';

/** Matches the cap TMDB itself applies to a list item comment. */
export const MAX_NOTE_LENGTH = 500;

export async function GET(): Promise<NextResponse> {
  try {
    const recs = await getRecommendationsFromTmdbList();
    return NextResponse.json(recs, { status: 200 });
  } catch (err) {
    return sanitizeError(err, 'GET /api/recommendations');
  }
}

/**
 * Accept a film recommendation from a visitor.
 *
 * Deliberately unauthenticated — it is a "recommend me something" box on a
 * portfolio. But it writes to a real public TMDB list under the owner's
 * account and spends the owner's write quota, so every field is bounded and
 * a single caller is capped.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const { allowed, resetAt } = checkRateLimit(clientKey(request, 'recommend'), {
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!allowed) return rateLimitResponse(resetAt);

  try {
    const body = await readJsonBody(request);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { tmdb_id, title, note } = body;

    if (!isTmdbId(tmdb_id)) {
      return NextResponse.json(
        { error: 'tmdb_id must be a positive integer.' },
        { status: 400 }
      );
    }
    if (!isBoundedString(title, 200)) {
      return NextResponse.json(
        { error: 'title is required and must be 200 characters or fewer.' },
        { status: 400 }
      );
    }
    if (note !== undefined && note !== null && !isBoundedString(note, MAX_NOTE_LENGTH)) {
      return NextResponse.json(
        { error: `note must be ${MAX_NOTE_LENGTH} characters or fewer.` },
        { status: 400 }
      );
    }

    const noteValue = typeof note === 'string' && note.trim() ? note.trim() : null;

    const added = await addRecommendationToTmdbList(tmdb_id, noteValue);
    if (!added) {
      /* The list credentials are missing, so nothing was written. This used to
         answer 201 anyway: the visitor got a thank-you for a recommendation
         that went nowhere, and nobody found out. */
      return NextResponse.json(
        { error: 'Recommendations are unavailable right now.' },
        { status: 503 }
      );
    }

    /* Acknowledge, but do not echo the caller's own strings back — there is
       no reason for this endpoint to be a reflector for arbitrary input. */
    return NextResponse.json({ ok: true, tmdb_id }, { status: 201 });
  } catch (err) {
    return sanitizeError(err, 'POST /api/recommendations');
  }
}
