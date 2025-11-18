// app/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../lib/supabase-server';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const slug = params.slug;
  if (!slug) return NextResponse.redirect('/');

  // get url
  const { data, error } = await supabaseServer
    .from('links')
    .select('url, clicks')
    .eq('slug', slug)
    .limit(1)
    .single();

  if (error || !data) {
    // slug not found -> show 404; redirect to homepage
    return NextResponse.redirect('/');
  }

  // increment clicks (fire-and-forget)
  supabaseServer
    .from('links')
    .update({ clicks: (data.clicks ?? 0) + 1 })
    .eq('slug', slug)
    .then(() => {})
    .catch(() => {});

  return NextResponse.redirect(data.url);
}
