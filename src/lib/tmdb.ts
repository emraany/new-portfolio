const BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p';

/**
 * Server-only. This was NEXT_PUBLIC_TMDB_API_KEY, which compiled the key into
 * the client bundle and put it in request URLs; the browser now goes through
 * /api/tmdb-search instead. TMDB_API_KEY is read here and never leaves the
 * server.
 */
const API_KEY = process.env.TMDB_API_KEY ?? '';

/** Every upstream call is bounded, so a slow TMDB cannot hold a page open. */
const TIMEOUT_MS = 6000;

export function tmdbPosterUrl(
  posterPath: string,
  size: 'w342' | 'w500' | 'original' = 'w342'
): string {
  if (!posterPath) return '';
  const path = posterPath.startsWith('/') ? posterPath : `/${posterPath}`;
  return `${IMG}/${size}${path}`;
}

export interface TMDBFilm {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

export interface TMDBFilmDetail extends TMDBFilm {
  overview: string;
}

async function search(title: string): Promise<TMDBFilm[]> {
  if (!API_KEY) return [];
  try {
    const url = `${BASE}/search/movie?query=${encodeURIComponent(title)}&api_key=${API_KEY}`;
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { results: TMDBFilm[] };
    return data.results ?? [];
  } catch {
    return [];
  }
}

/** Best single match — used to attach posters to Letterboxd diary entries. */
export async function searchFilm(title: string): Promise<TMDBFilm | null> {
  return (await search(title))[0] ?? null;
}

/** Top matches — used by the recommendation form's search box. */
export async function searchFilms(title: string, limit: number): Promise<TMDBFilm[]> {
  return (await search(title)).slice(0, limit);
}

export async function getFilmById(tmdbId: number): Promise<TMDBFilmDetail | null> {
  if (!API_KEY) return null;
  try {
    const url = `${BASE}/movie/${tmdbId}?api_key=${API_KEY}`;
    const res = await fetch(url, {
      cache: 'force-cache',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as TMDBFilmDetail;
    return data;
  } catch {
    return null;
  }
}
