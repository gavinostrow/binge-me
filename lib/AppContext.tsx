"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  TabId,
  MovieRating,
  ShowRating,
  FeedActivity,
  WatchlistItem,
  Reaction,
} from "./types";
import {
  myMovieRatings as initialMovieRatings,
  myShowRatings as initialShowRatings,
  feedActivities as initialFeed,
} from "./mockData";

interface AppState {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  movieRatings: MovieRating[];
  showRatings: ShowRating[];
  feedActivities: FeedActivity[];
  watchlist: WatchlistItem[];
  addMovieRating: (rating: MovieRating) => void;
  addShowRating: (rating: ShowRating) => void;
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (id: string) => void;
  toggleReaction: (activityId: string, userId: string, type: Reaction["type"]) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabId>("feed");
  const [movieRatings, setMovieRatings] = useState<MovieRating[]>(initialMovieRatings);
  const [showRatings, setShowRatings] = useState<ShowRating[]>(initialShowRatings);
  const [feedActivities, setFeedActivities] = useState<FeedActivity[]>(initialFeed);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  const addMovieRating = useCallback((rating: MovieRating) => {
    setMovieRatings((prev) => [rating, ...prev]);
    const activity: FeedActivity = {
      id: `fa-${Date.now()}`,
      userId: rating.userId,
      user: {
        id: rating.userId,
        username: "alexchen",
        displayName: "Alex Chen",
        handle: "@alexchen",
        bio: "",
        avatarColor: "#8B5CF6",
        mountRushmore: [],
        createdAt: "",
      },
      type: "movie_rating",
      title: rating.movie.title,
      year: rating.movie.year,
      rating: rating.rating,
      taggedUsers: [],
      reactions: [],
      createdAt: new Date().toISOString(),
    };
    setFeedActivities((prev) => [activity, ...prev]);
  }, []);

  const addShowRating = useCallback((rating: ShowRating) => {
    setShowRatings((prev) => [rating, ...prev]);
    const activity: FeedActivity = {
      id: `fa-${Date.now()}`,
      userId: rating.userId,
      user: {
        id: rating.userId,
        username: "alexchen",
        displayName: "Alex Chen",
        handle: "@alexchen",
        bio: "",
        avatarColor: "#8B5CF6",
        mountRushmore: [],
        createdAt: "",
      },
      type: "show_rating",
      title: rating.show.title,
      year: rating.show.year,
      rating: rating.overallRating,
      taggedUsers: [],
      reactions: [],
      createdAt: new Date().toISOString(),
    };
    setFeedActivities((prev) => [activity, ...prev]);
  }, []);

  const addToWatchlist = useCallback((item: WatchlistItem) => {
    setWatchlist((prev) => [item, ...prev]);
  }, []);

  const removeFromWatchlist = useCallback((id: string) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggleReaction = useCallback(
    (activityId: string, userId: string, type: Reaction["type"]) => {
      setFeedActivities((prev) =>
        prev.map((activity) => {
          if (activity.id !== activityId) return activity;
          const existing = activity.reactions.find(
            (r) => r.userId === userId && r.type === type
          );
          if (existing) {
            return {
              ...activity,
              reactions: activity.reactions.filter(
                (r) => !(r.userId === userId && r.type === type)
              ),
            };
          }
          return {
            ...activity,
            reactions: [...activity.reactions, { userId, type }],
          };
        })
      );
    },
    []
  );

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        movieRatings,
        showRatings,
        feedActivities,
        watchlist,
        addMovieRating,
        addShowRating,
        addToWatchlist,
        removeFromWatchlist,
        toggleReaction,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
