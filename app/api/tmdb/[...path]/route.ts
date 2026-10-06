// Server-side proxy to TMDB so the API key never ships to the browser.
// Set TMDB_READ_TOKEN (the "API Read Access Token") or TMDB_API_KEY in .env.local.
import { NextRequest, NextResponse } from "next/server";

const ALLOWED = /^(search\/tv|tv\/\d+(\/season\/\d+)?|trending\/tv\/(day|week)|configuration)$/;

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const token = process.env.TMDB_READ_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;
  if (!token && !apiKey) {
    return NextResponse.json({ error: "tmdb_not_configured" }, { status: 503 });
  }

  const path = params.path.join("/");
  if (!ALLOWED.test(path)) {
    return NextResponse.json({ error: "path_not_allowed" }, { status: 400 });
  }

  const url = new URL(`https://api.themoviedb.org/3/${path}`);
  req.nextUrl.searchParams.forEach((v, k) => {
    if (k !== "api_key") url.searchParams.set(k, v);
  });
  if (!token && apiKey) url.searchParams.set("api_key", apiKey);

  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}`, accept: "application/json" } : { accept: "application/json" },
    next: { revalidate: 60 * 60 * 6 },
  });
  const body = await res.json().catch(() => ({}));
  return NextResponse.json(body, {
    status: res.status,
    headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" },
  });
}
