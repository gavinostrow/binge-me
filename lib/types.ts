// ─── Core Entities ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  displayName?: string;
  username: string;
  bio?: string;
  favoriteGenres?: string[];
  avatarColor?: string;
  avatarUrl?: string;
}

export interface Show {
  id: string;
  tmdbId?: number;
  posterPath?: string;
  title: string;
  year: number;
  genre: string[];
  seasons: number;
  totalSeasons?: number;
  description?: string;
  cast?: string[];
  network?: string;
  status?: "ongoing" | "ended" | "cancelled";
}

// ─── Ratings ──────────────────────────────────────────────────────────────────

export interface SeasonRating {
  season: number;
  seasonNumber?: number;
  rating: number;
  review?: string;
}

export interface ShowRating {
  id: string;
  userId?: string;
  show: Show;
  overallRating: number;
  seasonRatings: SeasonRating[];
  review?: string;
  watchStatus?: "watching" | "finished" | "dropped" | "paused";
  isFavorite?: boolean;
  createdAt?: string;
  dateWatched?: string;
  timestamp?: string;
}

// ─── Feed ─────────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  userId: string;
  user?: User;
  text: string;
  createdAt?: string;
  timestamp?: string;
}

export interface FeedActivity {
  id: string;
  userId?: string;
  user?: User;
  type: "show_rating" | "recommendation" | "watchlist_add" | "rec_request";
  show?: Show;
  showRating?: ShowRating;
  rating?: number;
  review?: string;
  seasonRatings?: SeasonRating[];
  taggedUsers?: string[];
  recQuery?: string;
  recGenres?: string[];
  reactions: Record<string, string[]>;
  comments?: Comment[];
  createdAt?: string;
  timestamp?: string;
  title?: string;
  season?: number;
}

// ─── Watchlist ────────────────────────────────────────────────────────────────

export interface WatchlistItem {
  id: string;
  contentType: "show";
  show?: Show;
  addedDate?: string;
  addedAt?: string;
  recommendedBy?: string;
  priority?: number;
  notes?: string;
  // legacy fields from older format
  userId?: string;
  contentId?: string;
  title?: string;
  year?: number;
  genre?: string | string[];
}

// ─── Community ────────────────────────────────────────────────────────────────

export interface CommunityShow {
  show?: Show;
  averageRating: number;
  ratingCount: number;
  pct9plus?: number;
}

// ─── Friends ratings ─────────────────────────────────────────────────────────

export interface FriendShowRating {
  userId: string;
  rating: number;
  review?: string;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type:
    | "recommendation"
    | "reaction"
    | "comment"
    | "follow"
    | "rec_request"
    | "rec_reply"
    | "return_date"
    | "started_watching"
    | "prediction";
  fromUserId?: string;
  fromUser?: User;
  show?: Show;
  message?: string;
  requestId?: string;
  season?: number;
  seen: boolean;
  createdAt?: string;
  timestamp?: string;
}

// ─── Groups / Clubs ──────────────────────────────────────────────────────────

export interface GroupMessage {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
  reactions: Record<string, string[]>;
  contentRef?: { title: string; type: "show"; rating?: number };
  spoilerWarning?: boolean;
}

export interface Prediction {
  id: string;
  userId: string;
  contentTitle?: string;
  text: string;
  locked: boolean;
  lockedAt?: string;
  revealed: boolean;
  result?: string;
  votes?: Record<string, "right" | "wrong">;
}

export interface GroupPollOption {
  id: string;
  text: string;
  votes: string[];
}

export interface GroupPoll {
  id: string;
  userId: string;
  question: string;
  options: GroupPollOption[];
  createdAt?: string;
  timestamp?: string;
  closed?: boolean;
}

export interface GroupClub {
  id: string;
  name: string;
  emoji: string;
  description?: string;
  memberIds: string[];
  clubType?: "group-watch" | "friends-club";
  currentWatch?: {
    title: string;
    type: "show";
    show?: Show;
    episode?: string;
  };
  messages: GroupMessage[];
  predictions: Prediction[];
  polls?: GroupPoll[];
  createdAt: string;
  lastActivity?: string;
}

// ─── Now Watching ────────────────────────────────────────────────────────────

export interface NowWatching {
  userId: string;
  title: string;
  type: "show";
  episode?: string;
  startedAt: string;
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

// ─── CommunityItem (legacy + current) ────────────────────────────────────────

export interface CommunityItem {
  id?: string;
  show?: Show;
  season?: number;
  rank?: number;
  averageRating: number;
  ratingCount: number;
  pct9plus?: number;
  type?: "show";
}

// ─── Add flow ─────────────────────────────────────────────────────────────────

export type AddStep =
  | "choose-type"
  | "search"
  | "rate-show"
  | "confirm"
  | "recommend";

export type ListContentType = "shows" | "watchlist";

// ─── Tab / View types ────────────────────────────────────────────────────────

export type TabId = "feed" | "add" | "groups" | "next" | "profile";
export type ContentType = "show";
export type FeedView = "friends" | "community" | "new";
export type GroupView = "list" | "chat" | "predictions" | "polls" | "members";
export type RecommendationSource = "taste" | "friends" | "community";
