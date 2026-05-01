const V4_BASE = 'https://api.themoviedb.org/4';

const TOKEN = process.env.TMDB_V4_TOKEN ?? '';
const LIST_ID = process.env.TMDB_LIST_ID ?? '';

export interface Recommendation {
  id?: number;
  tmdb_id: number;
  title: string;
  poster_path: string;
  note: string | null;
  created_at?: string;
}

interface TmdbListItem {
  id: number;
  media_type: string;
  title?: string;
  name?: string;
  poster_path: string | null;
}

interface TmdbListResponse {
  results?: TmdbListItem[];
  comments?: Record<string, string | null>;
  total_pages?: number;
}

export async function addRecommendationToTmdbList(
  tmdbId: number,
  comment: string | null
): Promise<void> {
  if (!TOKEN || !LIST_ID) {
    console.warn('[tmdb-list] TMDB_V4_TOKEN or TMDB_LIST_ID not set; skipping');
    return;
  }

  const item: Record<string, unknown> = {
    media_type: 'movie',
    media_id: tmdbId,
  };
  if (comment && comment.trim()) {
    item.comment = comment.trim().slice(0, 500);
  }

  const res = await fetch(`${V4_BASE}/list/${LIST_ID}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ items: [item] }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`TMDB list add failed: ${res.status} ${text}`);
  }
}

export async function getRecommendationsFromTmdbList(): Promise<Recommendation[]> {
  if (!TOKEN || !LIST_ID) return [];

  const all: Recommendation[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const res = await fetch(
      `${V4_BASE}/list/${LIST_ID}?page=${page}&sort_by=original_order.desc`,
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      console.error('[tmdb-list] list fetch failed:', res.status);
      break;
    }

    const data = (await res.json()) as TmdbListResponse;
    const comments = data.comments ?? {};
    totalPages = data.total_pages ?? 1;

    for (const item of data.results ?? []) {
      if (item.media_type !== 'movie') continue;
      const commentKey = `movie:${item.id}`;
      const note = comments[commentKey];
      all.push({
        tmdb_id: item.id,
        title: item.title ?? item.name ?? '',
        poster_path: item.poster_path ?? '',
        note: note && note.trim() ? note : null,
      });
    }

    page += 1;
  } while (page <= totalPages && page <= 10);

  return all;
}
