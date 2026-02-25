"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type {
  TabId,
  User,
  Movie,
  Show,
  MovieRating,
  ShowRating,
  FeedActivity,
  WatchlistItem,
  GroupClub,
  GroupMessage,
  Prediction,
  ContentType,
  Comment,
  Notification,
  GroupPoll,
  NowWatching,
} from "./types";
import type { ScreenDescriptor } from "./navigation";
import {
  currentUser as mockCurrentUser,
  myMovieRatings as initialMovieRatings,
  myShowRatings as initialShowRatings,
  feedActivities as initialFeedActivities,
  initialWatchlist as mockWatchlist,
  initialNotifications,
} from "./mockData";

interface AppContextType {
  theme: "dark" | "light";
  toggleTheme: () => void;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  movieRatings: MovieRating[];
  addMovieRating: (rating: MovieRating) => void;
  getMyMovieRating: (movieId: string) => MovieRating | undefined;
  showRatings: ShowRating[];
  addShowRating: (rating: ShowRating) => void;
  getMyShowRating: (showId: string) => ShowRating | undefined;
  feedActivities: FeedActivity[];
  addFeedActivity: (activity: FeedActivity) => void;
  toggleReaction: (activityId: string, emoji: string) => void;
  watchlist: WatchlistItem[];
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (itemId: string) => void;
  isInWatchlist: (contentType: ContentType, contentId: string) => boolean;
  groups: GroupClub[];
  sendGroupMessage: (groupId: string, message: GroupMessage) => void;
  toggleGroupReaction: (groupId: string, messageId: string, emoji: string, userId: string) => void;
  addPrediction: (groupId: string, prediction: Prediction) => void;
  lockPrediction: (groupId: string, predictionId: string) => void;
  revealPrediction: (groupId: string, predictionId: string, result: string) => void;
  votePrediction: (groupId: string, predictionId: string, vote: "right" | "wrong") => void;
  createGroup: (group: GroupClub) => void;
  navigationStack: ScreenDescriptor[];
  pushScreen: (descriptor: ScreenDescriptor) => void;
  popScreen: () => void;
  clearStack: () => void;
  authUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  currentUserData: User;
  notifications: Notification[];
  addComment: (activityId: string, comment: Comment) => void;
  sendRecommendation: (notification: Notification) => void;
  markNotificationSeen: (id: string) => void;
  sendGroupPoll: (groupId: string, poll: GroupPoll) => void;
  voteGroupPoll: (groupId: string, pollId: string, optionId: string, userId: string) => void;
  toggleMovieFavorite: (ratingId: string) => void;
  toggleShowFavorite: (ratingId: string) => void;
  updateMovieRating: (ratingId: string, rating: number) => void;
  updateShowRating: (ratingId: string, rating: number) => void;
  myNowWatching: NowWatching | null;
  setMyNowWatching: (status: NowWatching) => void;
  clearNowWatching: () => void;
  pendingRecipientId: string | null;
  setPendingRecipientId: (id: string | null) => void;
  unreadCount: number;
  markNotificationsRead: () => void;
  pendingAddItem: Movie | Show | null;
  setPendingAddItem: (item: Movie | Show | null) => void;
  whatsNextSource: "taste" | "friends" | "community" | null;
  setWhatsNextSource: (s: "taste" | "friends" | "community" | null) => void;
  whatsNextContentType: "movie" | "show" | "both";
  setWhatsNextContentType: (t: "movie" | "show" | "both") => void;
  deleteMovieRating: (id: string) => void;
  deleteShowRating: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("light", next === "light");
        localStorage.setItem("binge_theme", next);
      }
      return next;
    });
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("binge_theme") as "dark" | "light" | null;
      if (saved === "light") {
        setTheme("light");
        document.documentElement.classList.add("light");
      }
    }
  }, []);

  const [activeTab, setActiveTab] = useState<TabId>("feed");
  const [movieRatings, setMovieRatings] = useState<MovieRating[]>(initialMovieRatings);
  const [showRatings, setShowRatings] = useState<ShowRating[]>(initialShowRatings);
  const [feedActivities, setFeedActivities] = useState<FeedActivity[]>(initialFeedActivities);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(mockWatchlist);
  const [groups, setGroups] = useState<GroupClub[]>([]);
  const [navigationStack, setNavigationStack] = useState<ScreenDescriptor[]>([]);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [currentUserData, setCurrentUserData] = useState<User>(mockCurrentUser);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [myNowWatching, setMyNowWatchingState] = useState<NowWatching | null>(null);
  const [pendingRecipientId, setPendingRecipientId] = useState<string | null>(null);
  const [pendingAddItem, setPendingAddItem] = useState<Movie | Show | null>(null);
  const [whatsNextSource, setWhatsNextSource] = useState<"taste" | "friends" | "community" | null>(null);
  const [whatsNextContentType, setWhatsNextContentType] = useState<"movie" | "show" | "both">("both");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("binge_user");
      if (saved) {
        try {
          const user = JSON.parse(saved);
          setAuthUser(user);
          setCurrentUserData(user);
        } catch {
          console.error("Failed to parse saved user");
        }
      }
    }
  }, []);

  const addMovieRating = (rating: MovieRating) => {
    setMovieRatings((prev) => {
      const existing = prev.findIndex((r) => r.movie.id === rating.movie.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = rating;
        return updated;
      }
      return [...prev, rating];
    });
  };

  const getMyMovieRating = (movieId: string) => movieRatings.find((r) => r.movie.id === movieId);

  const addShowRating = (rating: ShowRating) => {
    setShowRatings((prev) => {
      const existing = prev.findIndex((r) => r.show.id === rating.show.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = rating;
        return updated;
      }
      return [...prev, rating];
    });
  };

  const getMyShowRating = (showId: string) => showRatings.find((r) => r.show.id === showId);

  const addFeedActivity = (activity: FeedActivity) => {
    setFeedActivities((prev) => [activity, ...prev]);
  };

  const toggleReaction = (activityId: string, emoji: string) => {
    setFeedActivities((prev) =>
      prev.map((activity) => {
        if (activity.id !== activityId) return activity;
        const reactions = { ...activity.reactions };
        if (!reactions[emoji]) reactions[emoji] = [];
        const idx = reactions[emoji].indexOf("u1");
        if (idx >= 0) {
          reactions[emoji] = reactions[emoji].filter((id) => id !== "u1");
        } else {
          reactions[emoji] = [...reactions[emoji], "u1"];
        }
        return { ...activity, reactions };
      })
    );
  };

  const addToWatchlist = (item: WatchlistItem) => setWatchlist((prev) => [...prev, item]);
  const removeFromWatchlist = (itemId: string) =>
    setWatchlist((prev) => prev.filter((w) => w.id !== itemId));

  const isInWatchlist = (contentType: ContentType, contentId: string) =>
    watchlist.some((w) => {
      if (w.contentType !== contentType) return false;
      if (contentType === "movie") return w.movie?.id === contentId;
      return w.show?.id === contentId;
    });

  const sendGroupMessage = (groupId: string, message: GroupMessage) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id !== groupId ? g : { ...g, messages: [...(g.messages || []), message] }
      )
    );
  };

  const toggleGroupReaction = (
    groupId: string,
    messageId: string,
    emoji: string,
    userId: string
  ) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          messages: (g.messages || []).map((m) => {
            if (m.id !== messageId) return m;
            const reactions = { ...m.reactions };
            if (!reactions[emoji]) reactions[emoji] = [];
            const idx = reactions[emoji].indexOf(userId);
            if (idx >= 0) {
              reactions[emoji] = reactions[emoji].filter((id) => id !== userId);
            } else {
              reactions[emoji] = [...reactions[emoji], userId];
            }
            return { ...m, reactions };
          }),
        };
      })
    );
  };

  const addPrediction = (groupId: string, prediction: Prediction) =>
    setGroups((prev) =>
      prev.map((g) =>
        g.id !== groupId ? g : { ...g, predictions: [...(g.predictions || []), prediction] }
      )
    );

  const lockPrediction = (groupId: string, predictionId: string) =>
    setGroups((prev) =>
      prev.map((g) =>
        g.id !== groupId
          ? g
          : {
              ...g,
              predictions: (g.predictions || []).map((p) =>
                p.id !== predictionId
                  ? p
                  : { ...p, locked: true, lockedAt: new Date().toISOString() }
              ),
            }
      )
    );

  const revealPrediction = (groupId: string, predictionId: string, result: string) =>
    setGroups((prev) =>
      prev.map((g) =>
        g.id !== groupId
          ? g
          : {
              ...g,
              predictions: (g.predictions || []).map((p) =>
                p.id !== predictionId ? p : { ...p, revealed: true, result }
              ),
            }
      )
    );

  const votePrediction = (groupId: string, predictionId: string, vote: "right" | "wrong") =>
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          predictions: (g.predictions || []).map((p) => {
            if (p.id !== predictionId) return p;
            return { ...p, votes: { ...p.votes, u1: vote } };
          }),
        };
      })
    );

  const createGroup = (group: GroupClub) => setGroups((prev) => [...prev, group]);

  const pushScreen = (descriptor: ScreenDescriptor) =>
    setNavigationStack((prev) => [...prev, descriptor]);

  const popScreen = () =>
    setNavigationStack((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));

  const clearStack = () => setNavigationStack([]);

  const login = async (_email: string, _password: string) => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("binge_user");
      if (saved) {
        const user = JSON.parse(saved);
        setAuthUser(user);
        setCurrentUserData(user);
      }
    }
  };

  const signup = async (name: string, username: string, _email: string, _password: string) => {
    const newUser: User = { id: `u_${Date.now()}`, name, username, bio: "", favoriteGenres: [] };
    if (typeof window !== "undefined") localStorage.setItem("binge_user", JSON.stringify(newUser));
    setAuthUser(newUser);
    setCurrentUserData(newUser);
  };

  const logout = () => {
    if (typeof window !== "undefined") localStorage.removeItem("binge_user");
    setAuthUser(null);
    setCurrentUserData(mockCurrentUser);
  };

  const updateProfile = (updates: Partial<User>) => {
    const updated = { ...currentUserData, ...updates };
    setCurrentUserData(updated);
    if (authUser) {
      const newAuthUser = { ...authUser, ...updates };
      setAuthUser(newAuthUser);
      if (typeof window !== "undefined")
        localStorage.setItem("binge_user", JSON.stringify(newAuthUser));
    }
  };

  const addComment = (activityId: string, comment: Comment) =>
    setFeedActivities((prev) =>
      prev.map((a) =>
        a.id === activityId ? { ...a, comments: [...(a.comments ?? []), comment] } : a
      )
    );

  const sendRecommendation = (notification: Notification) =>
    setNotifications((prev) => [notification, ...prev]);

  const markNotificationSeen = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, seen: true } : n)));

  const sendGroupPoll = (groupId: string, poll: GroupPoll) =>
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, polls: [...(g.polls ?? []), poll] } : g))
    );

  const voteGroupPoll = (groupId: string, pollId: string, optionId: string, userId: string) =>
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const polls = (g.polls ?? []).map((p) => {
          if (p.id !== pollId) return p;
          const options = p.options.map((o) => ({
            ...o,
            votes:
              o.id === optionId
                ? [...o.votes.filter((v) => v !== userId), userId]
                : o.votes.filter((v) => v !== userId),
          }));
          return { ...p, options };
        });
        return { ...g, polls };
      })
    );

  const toggleMovieFavorite = (ratingId: string) =>
    setMovieRatings((prev) =>
      prev.map((r) => (r.id === ratingId ? { ...r, isFavorite: !r.isFavorite } : r))
    );

  const toggleShowFavorite = (ratingId: string) =>
    setShowRatings((prev) =>
      prev.map((r) => (r.id === ratingId ? { ...r, isFavorite: !r.isFavorite } : r))
    );

  const setMyNowWatching = (status: NowWatching) => setMyNowWatchingState(status);
  const clearNowWatching = () => setMyNowWatchingState(null);

  const updateMovieRating = (ratingId: string, rating: number) =>
    setMovieRatings((prev) => prev.map((r) => (r.id === ratingId ? { ...r, rating } : r)));

  const updateShowRating = (ratingId: string, rating: number) =>
    setShowRatings((prev) =>
      prev.map((r) => (r.id === ratingId ? { ...r, overallRating: rating } : r))
    );

  const deleteMovieRating = (id: string) =>
    setMovieRatings((prev) => prev.filter((r) => r.id !== id));

  const deleteShowRating = (id: string) =>
    setShowRatings((prev) => prev.filter((r) => r.id !== id));

  const markNotificationsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));

  const unreadCount = notifications.filter((n) => !n.seen).length;

  const value: AppContextType = {
    theme, toggleTheme,
    activeTab, setActiveTab,
    movieRatings, addMovieRating, getMyMovieRating,
    showRatings, addShowRating, getMyShowRating,
    feedActivities, addFeedActivity, toggleReaction,
    watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist,
    groups, sendGroupMessage, toggleGroupReaction, addPrediction,
    lockPrediction, revealPrediction, votePrediction, createGroup,
    navigationStack, pushScreen, popScreen, clearStack,
    authUser, isAuthenticated: authUser !== null,
    login, signup, logout, updateProfile, currentUserData,
    notifications, addComment, sendRecommendation, markNotificationSeen,
    sendGroupPoll, voteGroupPoll,
    toggleMovieFavorite, toggleShowFavorite,
    updateMovieRating, updateShowRating,
    myNowWatching, setMyNowWatching, clearNowWatching,
    pendingRecipientId, setPendingRecipientId,
    unreadCount, markNotificationsRead,
    pendingAddItem, setPendingAddItem,
    whatsNextSource, setWhatsNextSource,
    whatsNextContentType, setWhatsNextContentType,
    deleteMovieRating, deleteShowRating,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
