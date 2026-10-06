// Social math: friend ratings, app-wide ratings, "people who liked this also liked",
// taste match, and who has already watched what.
import type { ShowRating } from "./types";
import { communityShows, friendsShowRatings, tasteMatchPercentages } from "./mockData";
import { friendRatingLog, friendWatchlists, type UserRating } from "./socialData";

export const MIN_BINGE_RATINGS = 10; // hide the app-wide score until a show has this many ratings

export function myRatingRows(userId: string, showRatings: ShowRating[]): UserRating[] {
  return showRatings.map((r) => ({
    userId,
    type: "show" as const,
    id: r.show.id,
    rating: r.overallRating,
    review: r.review,
    seasons: r.seasonRatings.map((s) => ({ season: s.season ?? s.seasonNumber ?? 0, rating: s.rating })),
  }));
}

let friendRowsCache: UserRating[] | null = null;

/** Every rating by every friend, merged from the sample sources (one row per person per show). */
export function allFriendRatings(): UserRating[] {
  if (friendRowsCache) return friendRowsCache;
  const map = new Map<string, UserRating>();
  const add = (r: UserRating) => map.set(`${r.userId}|${r.id}`, r);
  Object.entries(friendsShowRatings).forEach(([id, list]) => list.forEach((r) => add({ ...r, type: "show", id })));
  friendRatingLog.forEach(add);
  friendRowsCache = Array.from(map.values());
  return friendRowsCache;
}

export function ratingsByUser(userId: string): UserRating[] {
  return allFriendRatings().filter((r) => r.userId === userId);
}

export function friendRatingsFor(id: string, followingIds: string[]): UserRating[] {
  return allFriendRatings()
    .filter((r) => r.id === id && followingIds.includes(r.userId))
    .sort((a, b) => b.rating - a.rating);
}

export function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** App-wide Binge rating. Uses the community table when we have it, otherwise everyone we know about. */
export function bingeRating(id: string, mine: UserRating[] = []): { avg: number; count: number } | null {
  const community = communityShows.find((c) => c.show?.id === id);
  if (community) return { avg: community.averageRating, count: community.ratingCount };
  const rows = [...allFriendRatings(), ...mine].filter((r) => r.id === id);
  const avg = average(rows.map((r) => r.rating));
  return avg == null ? null : { avg, count: rows.length };
}

/** "People who liked this also liked": shows rated 8+ by people who rated this 8+. */
export function alsoLiked(id: string, mine: UserRating[]): { id: string; fans: number }[] {
  const everyone = [...allFriendRatings(), ...mine];
  const fans = new Set(everyone.filter((r) => r.id === id && r.rating >= 8).map((r) => r.userId));
  const counts = new Map<string, { id: string; fans: number; score: number }>();
  everyone.forEach((r) => {
    if (!fans.has(r.userId) || r.rating < 8 || r.id === id) return;
    const cur = counts.get(r.id) ?? { id: r.id, fans: 0, score: 0 };
    cur.fans += 1;
    cur.score += r.rating;
    counts.set(r.id, cur);
  });
  return Array.from(counts.values())
    .sort((a, b) => b.fans - a.fans || b.score - a.score)
    .map(({ id: i, fans: f }) => ({ id: i, fans: f }));
}

/** Taste match: how closely two people rate the same shows (0–100). */
export function tasteMatch(mine: UserRating[], friendId: string): { pct: number; overlap: number } {
  const theirs = new Map(ratingsByUser(friendId).map((r) => [r.id, r.rating]));
  const diffs: number[] = [];
  mine.forEach((r) => {
    const t = theirs.get(r.id);
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
export function friendStatus(friendId: string, id: string): { watched?: number; onWatchlist: boolean } {
  const r = allFriendRatings().find((x) => x.userId === friendId && x.id === id);
  return {
    watched: r?.rating,
    onWatchlist: (friendWatchlists[friendId] ?? []).includes(`show:${id}`),
  };
}
