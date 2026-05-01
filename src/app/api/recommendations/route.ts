import { NextResponse } from 'next/server';
import {
  addRecommendationToTmdbList,
  getRecommendationsFromTmdbList,
} from '@/lib/tmdb-list';

export async function GET(): Promise<NextResponse> {
  try {
    const recs = await getRecommendationsFromTmdbList();
    return NextResponse.json(recs, { status: 200 });
  } catch (err) {
    console.error('GET /api/recommendations error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const { tmdb_id, title, poster_path, note } = body;

    if (typeof tmdb_id !== 'number') {
      return NextResponse.json(
        { error: 'tmdb_id is required and must be a number' },
        { status: 400 }
      );
    }
    if (typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { error: 'title is required and must be a non-empty string' },
        { status: 400 }
      );
    }
    if (typeof poster_path !== 'string') {
      return NextResponse.json(
        { error: 'poster_path is required and must be a string' },
        { status: 400 }
      );
    }

    const noteValue: string | null =
      typeof note === 'string' && note.trim() ? note.trim() : null;

    await addRecommendationToTmdbList(tmdb_id, noteValue);

    return NextResponse.json(
      {
        tmdb_id,
        title: title.trim(),
        poster_path: poster_path.trim(),
        note: noteValue,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('POST /api/recommendations error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'development' ? message : 'Internal server error' },
      { status: 500 }
    );
  }
}
