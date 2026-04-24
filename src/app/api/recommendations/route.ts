import { NextResponse } from 'next/server';
import { getAllRecommendations, addRecommendation } from '@/lib/supabase';

export async function GET(): Promise<NextResponse> {
  try {
    const recs = await getAllRecommendations();
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
    if (typeof poster_path !== 'string' || !poster_path.trim()) {
      return NextResponse.json(
        { error: 'poster_path is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const noteValue: string | null =
      typeof note === 'string' && note.trim() ? note.trim() : null;

    const created = await addRecommendation({
      tmdb_id,
      title: title.trim(),
      poster_path: poster_path.trim(),
      note: noteValue,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error('POST /api/recommendations error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
