import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "../../lib/supabase-server";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;

  if (!slug) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const { data, error } = await supabaseServer
    .from("links")
    .select("url, clicks")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // fire-and-forget click increment
  supabaseServer
    .from("links")
    .update({ clicks: (data.clicks ?? 0) + 1 })
    .eq("slug", slug)
    .then(() => {})
    .catch(() => {});

  return NextResponse.redirect(data.url);
}
