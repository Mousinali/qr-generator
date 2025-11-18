// app/api/shorten/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabase-server';

function makeSlug(len = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function POST(req: NextRequest) {
  try {
    const { url, customSlug } = await req.json();

    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

    // validate URL basic
    try { new URL(url); } catch (_) { return NextResponse.json({ error: 'Invalid url' }, { status: 400 }); }

    let slug = customSlug?.trim() || makeSlug(6);

    // ensure uniqueness (retry a few times)
    for (let i = 0; i < 5; i++) {
      const { data, error } = await supabaseServer
        .from('links')
        .select('id')
        .eq('slug', slug)
        .limit(1);

      if (error) throw error;
      if (data?.length === 0) break;
      slug = makeSlug(6 + i); // try again
    }

    // insert
    const { data, error } = await supabaseServer
      .from('links')
      .insert([{ slug, url }])
      .select()
      .single();

    if (error) {
      // conflict (unique) or other -> try again or return error
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ slug: data.slug, url: data.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
