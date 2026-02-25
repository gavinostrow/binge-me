import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get("query")?.trim();
  const type = searchParams.get("type") === "show" ? "tv" : "movie";

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const token = process.env.TMDB_API_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "TMDB token not configured" }, { status: 500 });
  }

  const url = `${TMDB_BASE}/search/${type}?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "TMDB request failed" }, { status: res.status });
  }

  const data = await res.json();

  // Normalize TMDB response to our Movie/Show shape
  const results = (data.results ?? []).slice(0, 20).map((item: Record<string, unknown>) => {
    if (type === "movie") {
      const releaseYear = item.release_date
        ? parseInt((item.release_date as string).slice(0, 4), 10)
        : null;
      return {
        id: `tmdb-m-${item.id}`,
        title: item.title as string,
        year: releaseYear,
        genre: (item.genre_ids as number[] | undefined)?.[0]?.toString() ?? "",
        posterPath: item.poster_path as string | null,
        tmdbId: item.id as number,
      };
    } else {
      const firstAirYear = item.first_air_date
        ? parseInt((item.first_air_date as string).slice(0, 4), 10)
        : null;
      return {
        id: `tmdb-s-${item.id}`,
        title: item.name as string,
        year: firstAirYear,
        genre: (item.genre_ids as number[] | undefined)?.[0]?.toString() ?? "",
        posterPath: item.poster_path as string | null,
        tmdbId: item.id as number,
        seasons: 1, // TMDB search doesn't return season count; detail call needed
      };
    }
  });

  return NextResponse.json({ results });
}
