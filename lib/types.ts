// ─── Core Entities ────────────────────────────────────────────────────────────

export interface MountRushmoreItem {
  title: string;
  type: "movie" | "show";
  year?: number;
}

export interface User {
  id: string;
  name: string;
  displayName?: string;
  username: string;
  handle?: string;
  bio?: string;
  favoriteGenres?: string[];
  avatarColor?: string;
  avatarUrl?: string;
  mountRushmore?: MountRushmoreItem[];
}

export interface Movie {
  id: string;
  tmdbId?: number;
  posterPath?: string;
  title: string;
  year: number;
  genre: string[];
  director?: string;
  runtime?: number;
  description?: string;
  cast?: string[];
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

export interface MovieRating {
  id: string;
  userId?: string;
  movie: Movie;
  rating: number;
  review?: string;
  isFavorite?: boolean;
  createdAt?: string;
  dateWatched?: string;
  timestamp?: string;
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
  type: "movie_rating" | "show_rating" | "recommendation" | "watchlist_add" | "rec_request";
  movie?: Movie;
  show?: Show;
  movieRating?: MovieRating;
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
  contentType: "movie" | "show";
  movie?: Movie;
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

export interface CommunityMovie {
  movie?: Movie;
  averageRating: number;
  ratingCount: number;
  pct9plus?: number;
}

export interface CommunityShow {
  show?: Show;
  averageRating: number;
  ratingCount: number;
  pct9plus?: number;
}

// ─── Friends ratings ─────────────────────────────────────────────────────────

export interface FriendMovieRating {
  userId: string;
  rating: number;
  review?: string;
}

export interface FriendShowRating {
  userId: string;
  rating: number;
  review?: string;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: "recommendation" | "reaction" | "comment" | "follow";
  fromUserId?: string;
  fromUser?: User;
  movie?: Movie;
  show?: Show;
  message?: string;
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
  contentRef?: { title: string; type: "movie" | "show"; rating?: number };
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
    type: "movie" | "show";
    movie?: Movie;
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
  type: "movie" | "show";
  episode?: string;
  startedAt: string;
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export interface NowPlayingMovie {
  movie: Movie;
  inTheaters?: boolean;
  inTheatersDate?: string;
  buzz?: string;
}

export interface UpcomingMovie {
  movie: Movie;
  releaseDate: string;
  buzz?: string;
}

export interface NewShowEntry {
  show: Show;
  episode?: string;
  network?: string;
  type?: "new-series" | "new-season" | "returning";
  premiereDate?: string;
  season?: number;
  buzz?: string;
}

export interface NowStreamingEntry {
  show?: Show;
  movie?: Movie;
  platform: string;
  arrivedDate?: string;
  buzz?: string;
}

// ─── CommunityItem (legacy + current) ────────────────────────────────────────

export interface CommunityItem {
  id?: string;
  movie?: Movie;
  show?: Show;
  season?: number;
  rank?: number;
  averageRating: number;
  ratingCount: number;
  pct9plus?: number;
  type?: "movie" | "show";
}

// ─── Add flow ─────────────────────────────────────────────────────────────────

export type AddStep =
  | "choose-type"
  | "search"
  | "rate-movie"
  | "rate-show"
  | "confirm"
  | "recommend";

export type ListContentType = "movies" | "shows" | "all" | "watchlist";

// ─── Tab / View types ────────────────────────────────────────────────────────

export type TabId = "feed" | "lists" | "add" | "groups" | "next" | "profile";
export type ContentType = "movie" | "show";
export type FeedView = "friends" | "community" | "new";
export type GroupView = "list" | "chat" | "predictions" | "polls" | "members";
export type RecommendationSource = "taste" | "friends" | "community";
