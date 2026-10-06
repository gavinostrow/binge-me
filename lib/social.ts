// Social math: friend ratings, app-wide ratings, "people who liked this also liked",
// taste match, and who has already watched what.
import type { MovieRating, ShowRating } from "./types";
import { communityMovies, communityShows, friendsMovieRatings, friendsShowRatings, tasteMatchPercentages } from "./mockData";
import { friendRatingLog, friendWatchlists, type UserRating } from "./socialData";

export const MIN_BINGE_RATINGS = 10; // hide the app-wide score until a title has this many ratings

export type Kind = "movie" | "show";

export function myRatingRows(userId: string, movieRatings: MovieRating[], showRatings: ShowRating[]): UserRating[] {
  return [
    ...movieRatings.map((r) => ({ userId, type: "movie" as const, id: r.movie.id, rating: r.rating, review: r.review })),
    ...showRatings.map((r) => ({
      userId,
      type: "show" as const,
      id: r.show.id,
      rating: r.overallRating,
      review: r.review,
      seasons: r.seasonRatings.map((s) => ({ season: s.season ?? s.seasonNumber ?? 0, rating: s.rating })),
    })),
  ];
}

let friendRowsCache: UserRating[] | null = null;

/** Every rating by every friend, merged from the sample sources (one row per person per title). */
export function allFriendRatings(): UserRating[] {
  if (friendRowsCache) return friendRowsCache;
  const map = new Map<string, UserRating>();
  const add = (r: UserRating) => map.set(`${r.userId}|${r.type}|${r.id}`, r);
  Object.entries(friendsMovieRatings).forEach(([id, list]) => list.forEach((r) => add({ ...r, type: "movie", id })));
  Object.entries(friendsShowRatings).forEach(([id, list]) => list.forEach((r) => add({ ...r, type: "show", id })));
  friendRatingLog.forEach(add);
  friendRowsCache = Array.from(map.values());
  return friendRowsCache;
}

export function ratingsByUser(userId: string): UserRating[] {
  return allFriendRatings().filter((r) => r.userId === userId);
}

export function friendRatingsFor(type: Kind, id: string, followingIds: string[]): UserRating[] {
  return allFriendRatings()
    .filter((r) => r.type === type && r.id === id && followingIds.includes(r.userId))
    .sort((a, b) => b.rating - a.rating);
}

export function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** App-wide Binge rating. Uses the community table when we have it, otherwise everyone we know about. */
export function bingeRating(type: Kind, id: string, mine: UserRating[] = []): { avg: number; count: number } | null {
  const community = (type === "movie" ? communityMovies : communityShows).find((c) =>
    type === "movie" ? c.movie?.id === id : c.show?.id === id,
  );
  if (community) return { avg: community.averageRating, count: community.ratingCount };
  const rows = [...allFriendRatings(), ...mine].filter((r) => r.type === type && r.id === id);
  const avg = average(rows.map((r) => r.rating));
  return avg == null ? null : { avg, count: rows.length };
}

/** "People who liked this also liked": titles rated 8+ by people who rated this 8+. */
export function alsoLiked(type: Kind, id: string, mine: UserRating[]): { type: Kind; id: string; fans: number }[] {
  const everyone = [...allFriendRatings(), ...mine];
  const fans = new Set(everyone.filter((r) => r.type === type && r.id === id && r.rating >= 8).map((r) => r.userId));
  const counts = new Map<string, { type: Kind; id: string; fans: number; score: number }>();
  everyone.forEach((r) => {
    if (!fans.has(r.userId) || r.rating < 8 || (r.type === type && r.id === id)) return;
    const k = `${r.type}:${r.id}`;
    const cur = counts.get(k) ?? { type: r.type, id: r.id, fans: 0, score: 0 };
    cur.fans += 1;
    cur.score += r.rating;
    counts.set(k, cur);
  });
  return Array.from(counts.values())
    .sort((a, b) => b.fans - a.fans || b.score - a.score)
    .map(({ type: t, id: i, fans: f }) => ({ type: t, id: i, fans: f }));
}

/** Taste match: how closely two people rate the same titles (0–100). */
export function tasteMatch(mine: UserRating[], friendId: string): { pct: number; overlap: number } {
  const theirs = new Map(ratingsByUser(friendId).map((r) => [`${r.type}:${r.id}`, r.rating]));
  const diffs: number[] = [];
  mine.forEach((r) => {
    const t = theirs.get(`${r.type}:${r.id}`);
    if (t != null) diffs.push(Math.abs(t - r.rating));
  });
  if (diffs.length < 3) {
    // Not enough overlap to measure honestly — blend in the sample estimate.
    const est = tasteMatchPercentages[friendId] ?? 60;
    if (diffs.length === 0) return { pct: est, overlap: 0 };
    const measured = 100 - (average(diffs)! / 4) * 100;
    return { pct: Math.round((est + measured) / 2), overlap: diffs.length };
  }
  const pct = Math.max(0, Math.min(100, Math.round(100 - (average(diffs)! / 4) * 100)));
  return { pct, overlap: diffs.length };
}

/** Has this friend watched it (rated it), or is it on their watchlist? */
export function friendStatus(friendId: string, type: Kind, id: string): { watched?: number; onWatchlist: boolean } {
  const r = allFriendRatings().find((x) => x.userId === friendId && x.type === type && x.id === id);
  return {
    watched: r?.rating,
    onWatchlist: (friendWatchlists[friendId] ?? []).includes(`${type}:${id}`),
  };
}
