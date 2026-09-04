import { NextResponse } from 'next/server';
import { searchFilms } from '@/lib/tmdb';
import {
  checkRateLimit,
  clientKey,
  rateLimitResponse,
  sanitizeError,
} from '@/lib/api-guards';

/**
 * Film search, proxied.
 *
 * The recommendation form used to call TMDB straight from the browser with
 * `NEXT_PUBLIC_TMDB_API_KEY`, appended as a query parameter — so the key was
 * compiled into the client bundle and travelled in URLs that end up in
 * referrers and logs. A key prefixed NEXT_PUBLIC_ is a published key, and
 * this one is not meant to be.
 *
 * Going through the server also means the response is cached once for
 * everyone rather than re-fetched per visitor per keystroke.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { allowed, resetAt } = checkRateLimit(clientKey(request, 'tmdb-search'), {
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (!allowed) return rateLimitResponse(resetAt);

  const query = new URL(request.url).searchParams.get('q')?.trim() ?? '';
  if (!query || query.length > 100) {
    return NextResponse.json({ results: [] }, { status: 200 });
  }

  try {
    const results = await searchFilms(query, 5);
    return NextResponse.json({ results }, { status: 200 });
  } catch (err) {
    return sanitizeError(err, 'GET /api/tmdb-search');
  }
}
