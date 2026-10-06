// Binge Wrapped — a recap of what you watched in a year or a quarter.
import type { Show, ShowRating } from "./types";
import { bingeRating, tasteMatch } from "./social";
import type { UserRating } from "./socialData";
import { knownExtras } from "./useTitleExtras";

export interface Period {
  key: string; // "2026" or "2026-Q3"
  label: string; // "2026" or "Q3 2026"
  short: string; // "Year" or "Q3"
  start: Date;
  end: Date; // exclusive
  inProgress: boolean;
}

export function periodsFor(year: number, now = new Date()): Period[] {
  const periods: Period[] = [
    {
      key: `${year}`,
      label: `${year}`,
      short: "Year",
      start: new Date(year, 0, 1),
      end: new Date(year + 1, 0, 1),
      inProgress: now < new Date(year + 1, 0, 1),
    },
  ];
  for (let q = 1; q <= 4; q++) {
    const start = new Date(year, (q - 1) * 3, 1);
    const end = new Date(year, q * 3, 1);
    if (start > now) break; // only quarters that have started
    periods.push({ key: `${year}-Q${q}`, label: `Q${q} ${year}`, short: `Q${q}`, start, end, inProgress: now < end });
  }
  return periods;
}

export function currentQuarterKey(now = new Date()) {
  return `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;
}

/** Most recent finished quarter (what a "your quarter is ready" card points to). */
export function lastFinishedQuarter(now = new Date()): Period | null {
  const all = periodsFor(now.getFullYear(), now).filter((p) => p.short !== "Year" && !p.inProgress);
  if (all.length) return all[all.length - 1];
  const prev = periodsFor(now.getFullYear() - 1, now).filter((p) => p.short === "Q4");
  return prev[0] ?? null;
}

interface Logged {
  item: Show;
  rating: number;
  date: Date;
  seasons: number;
}

function dateOf(r: { dateWatched?: string; createdAt?: string; timestamp?: string }): Date | null {
  const raw = r.dateWatched ?? r.createdAt ?? r.timestamp;
  if (!raw) return null;
  const d = new Date(raw.length === 10 ? raw + "T12:00:00" : raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export interface WrappedData {
  period: Period;
  shows: number;
  seasons: number;
  episodes: number;
  hours: number;
  avg: number;
  topGenre?: { name: string; count: number; share: number };
  topShows: { item: Show; rating: number }[];
  hotTake?: { item: Show; mine: number; binge: number };
  topPlatform?: { name: string; count: number };
  tasteTwin?: { userId: string; pct: number };
  persona: { title: string; line: string };
  months: { label: string; count: number }[];
}

// Estimate when we don't have episode data: ~8 episodes a season, ~50 minutes each.
const EPISODES_PER_SEASON = 8;
const MINUTES_PER_EPISODE = 50;

export function computeWrapped(
  period: Period,
  showRatings: ShowRating[],
  myRows: UserRating[],
  friendIds: string[],
): WrappedData | null {
  const logged: Logged[] = [];
  showRatings.forEach((r) => {
    const d = dateOf(r);
    if (d && d >= period.start && d < period.end)
      logged.push({ item: r.show, rating: r.overallRating, date: d, seasons: Math.max(1, r.seasonRatings.length) });
  });
  if (logged.length === 0) return null;

  const seasons = logged.reduce((s, l) => s + l.seasons, 0);
  const episodes = seasons * EPISODES_PER_SEASON;
  const hours = Math.round((episodes * MINUTES_PER_EPISODE) / 60);
  const avg = logged.reduce((s, l) => s + l.rating, 0) / logged.length;

  const genreCounts = new Map<string, number>();
  logged.forEach((l) => l.item.genre.forEach((g: string) => genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1)));
  const [gName, gCount] = Array.from(genreCounts.entries()).sort((a, b) => b[1] - a[1])[0] ?? [];
  const topGenre = gName ? { name: gName, count: gCount!, share: Math.round((gCount! / logged.length) * 100) } : undefined;

  const topShows = [...logged].sort((a, b) => b.rating - a.rating).slice(0, 3).map((l) => ({ item: l.item, rating: l.rating }));

  let hotTake: WrappedData["hotTake"];
  logged.forEach((l) => {
    const b = bingeRating(l.item.id);
    if (!b || b.count < 10) return;
    const diff = Math.abs(l.rating - b.avg);
    if (diff >= 1 && (!hotTake || diff > Math.abs(hotTake.mine - hotTake.binge))) {
      hotTake = { item: l.item, mine: l.rating, binge: b.avg };
    }
  });

  const platformCounts = new Map<string, number>();
  logged.forEach((l) => {
    const p = knownExtras(l.item).providers[0];
    if (p) platformCounts.set(p.name, (platformCounts.get(p.name) ?? 0) + 1);
  });
  const [pName, pCount] = Array.from(platformCounts.entries()).sort((a, b) => b[1] - a[1])[0] ?? [];

  const twin = friendIds
    .map((id) => ({ userId: id, ...tasteMatch(myRows, id) }))
    .sort((a, b) => b.pct - a.pct)[0];

  const monthMap = new Map<string, number>();
  for (let d = new Date(period.start); d < period.end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    monthMap.set(d.toLocaleDateString("en-US", { month: "short" }), 0);
  }
  logged.forEach((l) => {
    const k = l.date.toLocaleDateString("en-US", { month: "short" });
    if (monthMap.has(k)) monthMap.set(k, monthMap.get(k)! + 1);
  });

  const persona =
    avg >= 9
      ? { title: "The Hype Machine", line: "You love what you love — loudly." }
      : avg < 7.5
        ? { title: "The Tough Critic", line: "Your 9s mean something." }
        : seasons / logged.length >= 2.5
          ? { title: "The Binger", line: "One more episode was never one more episode." }
          : { title: "The Connoisseur", line: "High standards, great taste." };

  return {
    period,
    shows: logged.length,
    seasons,
    episodes,
    hours,
    avg,
    topGenre,
    topShows,
    hotTake,
    topPlatform: pName ? { name: pName, count: pCount! } : undefined,
    tasteTwin: twin ? { userId: twin.userId, pct: twin.pct } : undefined,
    persona,
    months: Array.from(monthMap.entries()).map(([label, count]) => ({ label, count })),
  };
}
