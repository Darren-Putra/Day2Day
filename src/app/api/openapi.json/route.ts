import { NextResponse } from 'next/server';

export async function GET() {
  const res = await fetch('http://localhost:3000/api/docs?format=json');
  if (res.ok) {
    const json = await res.json();
    return NextResponse.json(json);
  }
  return NextResponse.json({ error: 'Failed to retrieve OpenAPI schema' }, { status: 500 });
}
