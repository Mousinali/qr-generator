// app/api/qrcode/route.ts
import { NextRequest, NextResponse } from 'next/server';
import qrcode from 'qrcode';

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 });

  try {
    const dataUrl = await qrcode.toDataURL(text, { margin: 1 });
    return NextResponse.json({ dataUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
