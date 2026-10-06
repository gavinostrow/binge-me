// Client helpers for live TMDB data (through /api/tmdb). Every function returns
// null when TMDB isn't configured, so the app quietly keeps using sample data.
import type { Show } from "./types";
import { findByTmdb, registerShow } from "./catalog";
import { providerFromTmdb } from "./providers";
import type { NextSeason, TitleExtras } from "./showExtras";

const GENRES: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime", 99: "Documentary",
  18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 53: "Thriller", 10752: "War", 37: "Western",
  10759: "Action", 10762: "Kids", 10763: "News", 10764: "Reality", 10765: "Sci-Fi", 10766: "Soap",
  10767: "Talk", 10768: "War",
};

let available: boolean | null = null; // remembered after the first call

async function tmdb<T>(path: string, params: Record<string, string> = {}): Promise<T | null> {
  if (available === false) return null;
  try {
    const qs = new URLSearchParams({ language: "en-US", ...params }).toString();
    const res = await fetch(`/api/tmdb/${path}?${qs}`);
    if (res.status === 503) {
      available = false;
      return null;
    }
    if (!res.ok) return null;
    available = true;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function tmdbKnownUnavailable() {
  return available === false;
}

// ─── Mapping ─────────────────────────────────────────────────────────────────

interface TmdbItem {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  overview?: string;
  popularity?: number;
}

function genresOf(item: TmdbItem): string[] {
  const ids = item.genre_ids ?? item.genres?.map((g) => g.id) ?? [];
  return Array.from(new Set(ids.map((id) => GENRES[id]).filter(Boolean)));
}

export function mapShow(item: TmdbItem & { number_of_seasons?: number; status?: string; networks?: { name: string }[] }): Show {
  const existing = findByTmdb(item.id);
  const status: Show["status"] =
    item.status === "Ended" ? "ended" : item.status === "Canceled" ? "cancelled" : item.status ? "ongoing" : existing?.status;
  const show: Show = {
    ...(existing ?? {}),
    id: existing?.id ?? `tmdb-tv-${item.id}`,
    tmdbId: item.id,
    title: item.name ?? existing?.title ?? "Untitled",
    year: Number((item.first_air_date ?? "").slice(0, 4)) || existing?.year || 0,
    genre: existing?.genre ?? genresOf(item),
    posterPath: item.poster_path ?? existing?.posterPath,
    description: item.overview || existing?.description,
    seasons: item.number_of_seasons ?? existing?.seasons ?? 1,
    network: item.networks?.[0]?.name ?? existing?.network,
    status,
  };
  registerShow(show);
  return show;
}

// ─── Search ──────────────────────────────────────────────────────────────────

export async function searchShows(query: string): Promise<Show[] | null> {
  const data = await tmdb<{ results: TmdbItem[] }>("search/tv", { query, include_adult: "false" });
  if (!data) return null;
  return data.results.map(mapShow);
}

// ─── Details: next season, providers, similar ────────────────────────────────

interface TvDetails extends TmdbItem {
  status: string;
  number_of_seasons: number;
  networks?: { name: string }[];
  next_episode_to_air?: { air_date: string; season_number: number; episode_number: number } | null;
  last_episode_to_air?: { air_date: string; season_number: number; episode_number: number } | null;
  seasons?: { season_number: number; air_date: string | null; episode_count: number }[];
  "watch/providers"?: { results?: Record<string, { flatrate?: { provider_id: number; provider_name: string }[] }> };
  recommendations?: { results: TmdbItem[] };
}

export function nextSeasonFromTmdb(d: TvDetails): NextSeason {
  const today = new Date().toISOString().slice(0, 10);
  const lastSeason = d.last_episode_to_air?.season_number ?? 0;
  const ne = d.next_episode_to_air;
  if (ne) {
    const isPremiere = ne.season_number > lastSeason || ne.episode_number === 1;
    return isPremiere ? { kind: "date", season: ne.season_number, date: ne.air_date } : { kind: "airing", season: ne.season_number };
  }
  if (d.status === "Ended") return { kind: "ended" };
  if (d.status === "Canceled") return { kind: "canceled" };
  const upcoming = (d.seasons ?? [])
    .filter((s) => s.season_number > lastSeason && s.season_number > 0)
    .sort((a, b) => a.season_number - b.season_number)[0];
  if (upcoming) {
    if (upcoming.air_date && upcoming.air_date >= today) {
      return { kind: "date", season: upcoming.season_number, date: upcoming.air_date };
    }
    return { kind: "renewed", season: upcoming.season_number };
  }
  return { kind: "unknown" };
}

export async function fetchShowExtras(tmdbId: number, region = "US"): Promise<(TitleExtras & { similar: Show[] }) | null> {
  const d = await tmdb<TvDetails>(`tv/${tmdbId}`, { append_to_response: "watch/providers,recommendations" });
  if (!d) return null;
  mapShow(d);
  const flat = d["watch/providers"]?.results?.[region]?.flatrate ?? [];
  return {
    next: nextSeasonFromTmdb(d),
    providers: flat.map((f) => providerFromTmdb(f.provider_id, f.provider_name)),
    similar: (d.recommendations?.results ?? []).slice(0, 10).map(mapShow),
    source: "tmdb",
  };
}
