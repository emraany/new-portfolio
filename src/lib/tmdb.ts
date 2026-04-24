const BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY ?? '';

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

export async function searchFilm(title: string): Promise<TMDBFilm | null> {
  if (!API_KEY) return null;
  try {
    const url = `${BASE}/search/movie?query=${encodeURIComponent(title)}&api_key=${API_KEY}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as { results: TMDBFilm[] };
    return data.results?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function getFilmById(tmdbId: number): Promise<TMDBFilmDetail | null> {
  if (!API_KEY) return null;
  try {
    const url = `${BASE}/movie/${tmdbId}?api_key=${API_KEY}`;
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) return null;
    const data = (await res.json()) as TMDBFilmDetail;
    return data;
  } catch {
    return null;
  }
}
