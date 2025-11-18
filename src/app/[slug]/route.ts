import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "../../lib/supabase-server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  if (!slug) return NextResponse.redirect("/");

  // fetch URL
  const { data, error } = await supabaseServer
    .from("links")
    .select("url, clicks")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return NextResponse.redirect("/");
  }

  // increment clicks (no wait)
  supabaseServer
    .from("links")
    .update({ clicks: (data.clicks || 0) + 1 })
    .eq("slug", slug)
    .then(() => {});

  return NextResponse.redirect(data.url);
}
