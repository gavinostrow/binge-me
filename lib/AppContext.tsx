"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type {
  TabId,
  User,
  Show,
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
import { getSupabase } from "./supabase";
import {
  currentUser as mockCurrentUser,
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
  toggleShowFavorite: (ratingId: string) => void;
  updateShowRating: (ratingId: string, rating: number) => void;
  myNowWatching: NowWatching | null;
  setMyNowWatching: (status: NowWatching) => void;
  clearNowWatching: () => void;
  pendingRecipientId: string | null;
  setPendingRecipientId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

async function loadProfile(id: string, email: string): Promise<User> {
  const supabase = getSupabase();
  const fallback: User = { id, name: email.split("@")[0], username: email.split("@")[0], bio: "" };
  if (!supabase) return fallback;
  const { data } = await supabase.from("profiles").select("id, username, name, bio, avatar_url").eq("id", id).single();
  if (!data) return fallback;
  return { id: data.id, username: data.username, name: data.name || data.username, bio: data.bio, avatarUrl: data.avatar_url ?? undefined };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("light");

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", next === "dark");
        localStorage.setItem("binge_theme", next);
      }
      return next;
    });
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("binge_theme") as "dark" | "light" | null;
      if (saved === "dark") {
        setTheme("dark");
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  const [activeTab, setActiveTab] = useState<TabId>("feed");
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

  useEffect(() => {
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.getSession().then(async ({ data }) => {
        const sessionUser = data.session?.user;
        if (!sessionUser) return;
        const user = await loadProfile(sessionUser.id, sessionUser.email ?? "");
        setAuthUser(user);
        setCurrentUserData(user);
      });
      return;
    }
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

  const login = async (email: string, password: string) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      const user = await loadProfile(data.user.id, data.user.email ?? email);
      setAuthUser(user);
      setCurrentUserData(user);
      return;
    }
    // Sample mode: no backend yet, restore the locally saved account.
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("binge_user");
      if (saved) {
        const user = JSON.parse(saved);
        setAuthUser(user);
        setCurrentUserData(user);
      }
    }
  };

  const signup = async (name: string, username: string, email: string, password: string) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, username: username.toLowerCase() } },
      });
      if (error) throw new Error(error.message);
      if (!data.session) {
        throw new Error("Check your email to confirm your account, then sign in.");
      }
      const user: User = { id: data.user!.id, name, username: username.toLowerCase(), bio: "", favoriteGenres: [] };
      setAuthUser(user);
      setCurrentUserData(user);
      return;
    }
    const newUser: User = { id: `u_${Date.now()}`, name, username, bio: "", favoriteGenres: [] };
    if (typeof window !== "undefined") localStorage.setItem("binge_user", JSON.stringify(newUser));
    setAuthUser(newUser);
    setCurrentUserData(newUser);
  };

  const logout = () => {
    getSupabase()?.auth.signOut();
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

  const toggleShowFavorite = (ratingId: string) =>
    setShowRatings((prev) =>
      prev.map((r) => (r.id === ratingId ? { ...r, isFavorite: !r.isFavorite } : r))
    );

  const setMyNowWatching = (status: NowWatching) => setMyNowWatchingState(status);
  const clearNowWatching = () => setMyNowWatchingState(null);

  const updateShowRating = (ratingId: string, rating: number) =>
    setShowRatings((prev) =>
      prev.map((r) => (r.id === ratingId ? { ...r, overallRating: rating } : r))
    );

  const value: AppContextType = {
    theme, toggleTheme,
    activeTab, setActiveTab,
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
    toggleShowFavorite,
    updateShowRating,
    myNowWatching, setMyNowWatching, clearNowWatching,
    pendingRecipientId, setPendingRecipientId,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
