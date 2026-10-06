// Extra details for each title: when the next season is coming, where it streams,
// and similar titles. These are SAMPLE values for the demo catalog — once a TMDB
// key is set, useTitleExtras() replaces them with live data from TMDB.
import type { Show } from "./types";
import type { Provider } from "./providers";
import { PROVIDERS } from "./providers";

export type NextSeason =
  | { kind: "airing"; season: number } // a season is airing right now
  | { kind: "date"; season: number; date: string } // premiere date announced
  | { kind: "renewed"; season: number } // renewed, no date yet
  | { kind: "ended" }
  | { kind: "canceled" }
  | { kind: "unknown" }; // returning series, no news yet

export interface TitleExtras {
  next?: NextSeason;
  providers: Provider[];
  similarTmdbIds?: number[];
  source: "sample" | "tmdb";
}

const p = PROVIDERS;

export const sampleShowExtras: Record<string, Omit<TitleExtras, "source">> = {
  s1: { next: { kind: "ended" }, providers: [p.netflix, p.amc] }, // Breaking Bad
  s2: { next: { kind: "renewed", season: 4 }, providers: [p.hulu, p.disney] }, // The Bear
  s3: { next: { kind: "ended" }, providers: [p.max] }, // Succession
  s4: { next: { kind: "renewed", season: 3 }, providers: [p.apple] }, // Severance
  s5: { next: { kind: "date", season: 3, date: "2027-04-12" }, providers: [p.max] }, // The Last of Us
  s6: { next: { kind: "airing", season: 3 }, providers: [p.max] }, // Euphoria
  s7: { next: { kind: "ended" }, providers: [p.max] }, // Chernobyl
  s8: { next: { kind: "ended" }, providers: [p.max] }, // Barry
  s9: { next: { kind: "ended" }, providers: [p.hulu] }, // Atlanta
  s10: { next: { kind: "ended" }, providers: [p.netflix, p.amc] }, // Better Call Saul
  s11: { next: { kind: "date", season: 4, date: "2027-02-14" }, providers: [p.max] }, // The White Lotus
  s12: { next: { kind: "ended" }, providers: [p.disney] }, // Andor
  s13: { next: { kind: "date", season: 3, date: "2026-11-15" }, providers: [p.max] }, // House of the Dragon
  s14: { next: { kind: "renewed", season: 3 }, providers: [p.apple] }, // Silo
  s15: { next: { kind: "date", season: 5, date: "2026-10-24" }, providers: [p.apple] }, // Slow Horses
};

export function sampleExtras(id: string, show?: Show): TitleExtras {
  const base = sampleShowExtras[id];
  if (base) return { ...base, source: "sample" };
  const next: NextSeason =
    show?.status === "ended" ? { kind: "ended" } : show?.status === "cancelled" ? { kind: "canceled" } : { kind: "unknown" };
  return { next, providers: [], source: "sample" };
}

// ─── Display helpers ─────────────────────────────────────────────────────────

export function formatPremiere(date: string): string {
  const d = new Date(date + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function daysUntil(date: string, now = new Date()): number {
  const d = new Date(date + "T12:00:00");
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
}

export function nextSeasonLabel(next: NextSeason | undefined): { title: string; detail?: string; tone: "good" | "neutral" | "muted" } {
  if (!next) return { title: "No news yet", tone: "muted" };
  switch (next.kind) {
    case "airing":
      return { title: `Season ${next.season} is airing now`, tone: "good" };
    case "date": {
      const days = daysUntil(next.date);
      const detail = days > 0 ? `in ${days} day${days === 1 ? "" : "s"}` : days === 0 ? "today" : "out now";
      return { title: `Season ${next.season} premieres ${formatPremiere(next.date)}`, detail, tone: "good" };
    }
    case "renewed":
      return { title: `Renewed for Season ${next.season}`, detail: "No premiere date yet", tone: "neutral" };
    case "ended":
      return { title: "Series ended", tone: "muted" };
    case "canceled":
      return { title: "Canceled", tone: "muted" };
    default:
      return { title: "No news on the next season yet", tone: "muted" };
  }
}

/** Sort key for "Coming Back": dated premieres first (soonest first), then renewed, airing on top. */
export function comingBackRank(next: NextSeason | undefined): number | null {
  if (!next) return null;
  if (next.kind === "airing") return -1;
  if (next.kind === "date") return Math.max(0, daysUntil(next.date));
  if (next.kind === "renewed") return 100000;
  return null;
}
