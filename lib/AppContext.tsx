"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  TabId,
  MovieRating,
  ShowRating,
  FeedActivity,
  WatchlistItem,
  Reaction,
  Club,
} from "./types";
import {
  myMovieRatings as initialMovieRatings,
  myShowRatings as initialShowRatings,
  feedActivities as initialFeed,
  myClubs as initialMyClubs,
  discoverClubs as initialDiscoverClubs,
} from "./mockData";

interface AppState {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  movieRatings: MovieRating[];
  showRatings: ShowRating[];
  feedActivities: FeedActivity[];
  watchlist: WatchlistItem[];
  myClubs: Club[];
  discoverClubs: Club[];
  addMovieRating: (rating: MovieRating) => void;
  addShowRating: (rating: ShowRating) => void;
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (id: string) => void;
  toggleReaction: (activityId: string, userId: string, type: Reaction["type"]) => void;
  joinClub: (clubId: string) => void;
  leaveClub: (clubId: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabId>("feed");
  const [movieRatings, setMovieRatings] = useState<MovieRating[]>(initialMovieRatings);
  const [showRatings, setShowRatings] = useState<ShowRating[]>(initialShowRatings);
  const [feedActivities, setFeedActivities] = useState<FeedActivity[]>(initialFeed);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [myClubs, setMyClubs] = useState<Club[]>(initialMyClubs);
  const [discoverClubs, setDiscoverClubs] = useState<Club[]>(initialDiscoverClubs);

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

  const joinClub = useCallback((clubId: string) => {
    setDiscoverClubs((prev) => {
      const club = prev.find((c) => c.id === clubId);
      if (!club) return prev;
      const currentUserMember = {
        userId: "u1",
        user: {
          id: "u1",
          username: "alexchen",
          displayName: "Alex Chen",
          handle: "@alexchen",
          bio: "",
          avatarColor: "#8B5CF6",
          mountRushmore: [],
          createdAt: "",
        },
        role: "member" as const,
        joinedAt: new Date().toISOString(),
      };
      const updatedClub = { ...club, members: [...club.members, currentUserMember] };
      setMyClubs((myPrev) => [...myPrev, updatedClub]);
      return prev.filter((c) => c.id !== clubId);
    });
  }, []);

  const leaveClub = useCallback((clubId: string) => {
    setMyClubs((prev) => {
      const club = prev.find((c) => c.id === clubId);
      if (!club) return prev;
      const updatedClub = {
        ...club,
        members: club.members.filter((m) => m.userId !== "u1"),
      };
      setDiscoverClubs((discPrev) => [...discPrev, updatedClub]);
      return prev.filter((c) => c.id !== clubId);
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        movieRatings,
        showRatings,
        feedActivities,
        watchlist,
        myClubs,
        discoverClubs,
        addMovieRating,
        addShowRating,
        addToWatchlist,
        removeFromWatchlist,
        toggleReaction,
        joinClub,
        leaveClub,
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
