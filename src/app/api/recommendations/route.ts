import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([]);
}

export async function POST(req: Request) {
  return NextResponse.json({ success: true }, { status: 201 });
}
