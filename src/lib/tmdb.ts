const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

export async function searchFilms(query: string) { return []; }
export async function getFilmById(id: number) { return null; }
export function getPosterUrl(path: string, size = 'w500') {
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
