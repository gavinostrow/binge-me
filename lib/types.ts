export interface User {
  id: string;
  username: string;
  displayName: string;
  handle: string;
  bio: string;
  avatarColor: string;
  mountRushmore: MountRushmoreItem[];
  createdAt: string;
}

export interface MountRushmoreItem {
  title: string;
  type: "movie" | "show";
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  genre: string;
  posterUrl?: string;
}

export interface Show {
  id: string;
  title: string;
  year: number;
  genre: string;
  posterUrl?: string;
  totalSeasons: number;
}

export interface MovieRating {
  id: string;
  userId: string;
  movie: Movie;
  rating: number;
  createdAt: string;
}

export interface SeasonRating {
  seasonNumber: number;
  rating: number;
}

export interface ShowRating {
  id: string;
  userId: string;
  show: Show;
  overallRating: number;
  seasonRatings: SeasonRating[];
  createdAt: string;
}

export type ReactionType = "fire" | "agree" | "disagree" | "mustwatch";

export interface Reaction {
  userId: string;
  type: ReactionType;
}

export interface FeedActivity {
  id: string;
  userId: string;
  user: User;
  type: "movie_rating" | "show_rating";
  title: string;
  year: number;
  season?: number;
  rating: number;
  taggedUsers: string[];
  reactions: Reaction[];
  createdAt: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  contentId: string;
  contentType: "movie" | "show";
  title: string;
  year: number;
  genre: string;
  addedAt: string;
}

export interface CommunityItem {
  id: string;
  title: string;
  year: number;
  genre: string;
  totalRatings: number;
  averageRating: number;
  type: "movie" | "show";
  season?: number;
}

export type TabId = "feed" | "lists" | "add" | "next" | "profile";
export type ContentType = "movie" | "show";
export type FeedView = "friends" | "community";
export type RecommendationSource = "taste" | "friends" | "community";
