import { NextResponse } from 'next/server';

// This endpoint is deprecated - use /api/auth/login instead
export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Use /api/auth/login instead.' },
    { status: 410 }
  );
}
