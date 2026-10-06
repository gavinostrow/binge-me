// SAMPLE social data for the demo: friends' ratings, watchlists, what they're
// watching, open "looking for something" requests, and prediction questions.
// Supabase tables in supabase/schema.sql hold the real versions of each.
import type { User } from "./types";

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600000).toISOString();
const hoursFromNow = (h: number) => new Date(now + h * 3600000).toISOString();

export interface UserRating {
  userId: string;
  type: "show";
  id: string;
  rating: number;
  review?: string;
  seasons?: { season: number; rating: number }[];
}

/** Everything friends have rated (beyond the per-title samples in mockData). */
export const friendRatingLog: UserRating[] = [
  // Emma
  { userId: "u2", type: "show", id: "s4", rating: 9.4, review: "The finale of S2. That's all I'll say." },
  { userId: "u2", type: "show", id: "s11", rating: 8.8 },
  { userId: "u2", type: "show", id: "s6", rating: 8.1 },
  { userId: "u2", type: "show", id: "s14", rating: 8.3 },
  // Marcus
  { userId: "u3", type: "show", id: "s10", rating: 9.6 },
  { userId: "u3", type: "show", id: "s13", rating: 7.4 },
  { userId: "u3", type: "show", id: "s15", rating: 9.0 },
  { userId: "u3", type: "show", id: "s4", rating: 8.9 },
  // Sofia
  { userId: "u4", type: "show", id: "s11", rating: 9.2, review: "Every season is a vacation I'd never take." },
  { userId: "u4", type: "show", id: "s9", rating: 9.0 },
  { userId: "u4", type: "show", id: "s3", rating: 9.1 },
  // Jake
  { userId: "u5", type: "show", id: "s5", rating: 8.6 },
  { userId: "u5", type: "show", id: "s14", rating: 8.9 },
  { userId: "u5", type: "show", id: "s7", rating: 9.7 },
  // Michael
  { userId: "u6", type: "show", id: "s1", rating: 9.7, review: "Walter White is the GOAT. Not close." },
  { userId: "u6", type: "show", id: "s10", rating: 9.4 },
  { userId: "u6", type: "show", id: "s2", rating: 8.8 },
  { userId: "u6", type: "show", id: "s8", rating: 8.5 },
  { userId: "u6", type: "show", id: "s9", rating: 9.1, review: "Funniest show ever made, and somehow also the weirdest." },
  { userId: "u6", type: "show", id: "s3", rating: 9.0 },
];

/** Friends' watchlists, as item keys ("show:s4"). */
export const friendWatchlists: Record<string, string[]> = {
  u2: ["show:s12"],
  u3: ["show:s9"],
  u4: ["show:s4", "show:s15"],
  u5: ["show:s11"],
  u6: ["show:s4", "show:s15"],
};

export interface CurrentlyWatchingEntry {
  userId: string;
  showId: string;
  season: number;
  startedAt: string;
}

export const friendsCurrentlyWatching: CurrentlyWatchingEntry[] = [
  { userId: "u2", showId: "s12", season: 2, startedAt: hoursAgo(20) },
  { userId: "u2", showId: "s6", season: 3, startedAt: hoursAgo(70) },
  { userId: "u3", showId: "s15", season: 4, startedAt: hoursAgo(30) },
  { userId: "u4", showId: "s2", season: 3, startedAt: hoursAgo(6) },
  { userId: "u5", showId: "s14", season: 2, startedAt: hoursAgo(50) },
  { userId: "u6", showId: "s13", season: 2, startedAt: hoursAgo(90) },
];

/** People you could add (not followed yet). */
export const suggestedUsers: User[] = [
  { id: "u7", name: "Ava Goldberg", username: "avag", favoriteGenres: ["Drama", "Romance"] },
  { id: "u8", name: "Daniel Reyes", username: "dreyes", favoriteGenres: ["Crime", "Thriller"] },
  { id: "u9", name: "Priya Shah", username: "priya.s", favoriteGenres: ["Comedy", "Sci-Fi"] },
  { id: "u10", name: "Chris Lee", username: "chrislee", favoriteGenres: ["Action", "Sci-Fi"] },
];

export interface RecReply {
  id: string;
  fromUserId: string;
  type: "show";
  itemId: string;
  note?: string;
  createdAt: string;
}

export interface RecRequest {
  id: string;
  userId: string;
  kind: "show";
  note?: string;
  createdAt: string;
  expiresAt: string;
  replies: RecReply[];
}

export const initialRecRequests: RecRequest[] = [
  {
    id: "rq_michael",
    userId: "u6",
    kind: "show",
    note: "Just finished Atlanta. Need something funny or a good crime show",
    createdAt: hoursAgo(2),
    expiresAt: hoursFromNow(46),
    replies: [{ id: "rr1", fromUserId: "u3", type: "show", itemId: "s15", note: "Slow Horses. Trust.", createdAt: hoursAgo(1) }],
  },
];

// ─── Predictions (scripted shows) ────────────────────────────────────────────

export interface PredictionOption {
  id: string;
  label: string;
}

export interface PredictionQuestion {
  id: string;
  showId: string;
  season: number;
  label: string; // "Season 3 · Episode 6" or "Before the premiere"
  question: string;
  options: PredictionOption[];
  locksAt: string;
  answer?: string; // option id once it's happened
}

export const initialPredictionQuestions: PredictionQuestion[] = [
  {
    id: "pq1",
    showId: "s13",
    season: 3,
    label: "Before the Season 3 premiere",
    question: "Who sits on the Iron Throne at the end of Season 3?",
    options: [
      { id: "a", label: "Rhaenyra" },
      { id: "b", label: "Aegon II" },
      { id: "c", label: "Aemond" },
      { id: "d", label: "Nobody — it's empty" },
    ],
    locksAt: hoursFromNow(24 * 40),
  },
  {
    id: "pq2",
    showId: "s13",
    season: 3,
    label: "Before the Season 3 premiere",
    question: "Does a dragon die in the premiere?",
    options: [
      { id: "a", label: "Yes" },
      { id: "b", label: "No" },
    ],
    locksAt: hoursFromNow(24 * 40),
  },
  {
    id: "pq3",
    showId: "s11",
    season: 4,
    label: "Before the Season 4 premiere",
    question: "How many guests does the opening body count reveal?",
    options: [
      { id: "a", label: "One" },
      { id: "b", label: "Two" },
      { id: "c", label: "Three or more" },
    ],
    locksAt: hoursFromNow(24 * 130),
  },
  {
    id: "pq4",
    showId: "s6",
    season: 3,
    label: "Season 3 · Episode 6",
    question: "Do Maddy and Cassie make up this episode?",
    options: [
      { id: "a", label: "Yes" },
      { id: "b", label: "No" },
    ],
    locksAt: hoursFromNow(52),
  },
  {
    id: "pq5",
    showId: "s6",
    season: 3,
    label: "Season 3 · Episode 5",
    question: "Who shows up at the end of the episode?",
    options: [
      { id: "a", label: "Fezco" },
      { id: "b", label: "Nate" },
      { id: "c", label: "Jules" },
    ],
    locksAt: hoursAgo(120),
    answer: "c",
  },
  {
    id: "pq6",
    showId: "s15",
    season: 5,
    label: "Before the Season 5 premiere",
    question: "Does Lamb survive Season 5?",
    options: [
      { id: "a", label: "Obviously" },
      { id: "b", label: "No way" },
    ],
    locksAt: hoursFromNow(24 * 17),
  },
];

/** Friends' picks: questionId → userId → optionId. Hidden until a question locks. */
export const initialFriendPicks: Record<string, Record<string, string>> = {
  pq1: { u3: "b", u2: "a", u6: "d" },
  pq2: { u3: "a", u5: "a", u6: "b" },
  pq3: { u4: "b", u2: "c" },
  pq4: { u2: "b", u5: "a" },
  pq5: { u2: "c", u5: "a", u4: "c", u1: "b" },
  pq6: { u3: "a", u6: "a" },
};

// Season-long prediction record before this season (for the leaderboard).
export const pastPredictionRecord: Record<string, { right: number; total: number }> = {
  u1: { right: 7, total: 12 },
  u2: { right: 9, total: 13 },
  u3: { right: 6, total: 11 },
  u4: { right: 5, total: 7 },
  u5: { right: 4, total: 10 },
  u6: { right: 8, total: 12 },
};
