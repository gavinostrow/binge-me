"use client";
// State for Binge's social layer: friends, Currently Watching, "looking for something
// to watch" requests, streaming services, predictions and spoiler protection.
// In sample mode it lives in memory (plus localStorage for your own settings).
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useApp } from "./AppContext";
import { friends } from "./mockData";
import {
  friendsCurrentlyWatching,
  initialFriendPicks,
  initialPredictionQuestions,
  initialRecRequests,
  suggestedUsers,
  type CurrentlyWatchingEntry,
  type PredictionQuestion,
  type RecReply,
  type RecRequest,
} from "./socialData";
import { myRatingRows } from "./social";
import type { UserRating } from "./socialData";
import type { User } from "./types";

interface Toast {
  id: number;
  text: string;
}

interface SocialContextType {
  // People
  allUsers: User[];
  getUser: (id: string) => User | undefined;
  followingIds: string[];
  isFollowing: (id: string) => boolean;
  follow: (id: string) => void;
  unfollow: (id: string) => void;
  myRows: UserRating[];

  // Currently Watching (show + season)
  myWatching: CurrentlyWatchingEntry[];
  watchingFor: (userId: string) => CurrentlyWatchingEntry[];
  startWatching: (showId: string, season: number) => void;
  setWatchingSeason: (showId: string, season: number) => void;
  stopWatching: (showId: string) => void;

  // Rate flow hand-off (e.g. "Finished season" → rate it)
  pendingRate: { id: string; season?: number } | null;
  requestRate: (id: string, season?: number) => void;
  clearPendingRate: () => void;

  // Streaming services
  myServices: string[];
  toggleService: (key: string) => void;

  // Looking for something to watch
  recRequests: RecRequest[];
  myOpenRequest: RecRequest | undefined;
  openFriendRequests: RecRequest[];
  postRequest: (note?: string) => void;
  closeMyRequest: () => void;
  sendRecToRequest: (requestId: string, itemId: string, note?: string) => void;

  // Predictions
  questions: PredictionQuestion[];
  picks: Record<string, Record<string, string>>;
  makePick: (questionId: string, optionId: string) => void;

  // Spoiler protection
  spoilerShield: boolean;
  setSpoilerShield: (v: boolean) => void;

  // Little confirmation toasts
  toast: Toast | null;
  showToast: (text: string) => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

const ME = "u1";

function loadLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — keep in memory */
  }
}

export function SocialProvider({ children }: { children: ReactNode }) {
  const { currentUserData, showRatings, sendRecommendation } = useApp();
  const myId = currentUserData.id;

  const [followingIds, setFollowingIds] = useState<string[]>(friends.map((f) => f.id));
  const [myWatching, setMyWatching] = useState<CurrentlyWatchingEntry[]>([
    { userId: ME, showId: "s4", season: 2, startedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { userId: ME, showId: "s6", season: 3, startedAt: new Date(Date.now() - 86400000 * 9).toISOString() },
  ]);
  const [myServices, setMyServices] = useState<string[]>(["max", "apple", "netflix"]);
  const [spoilerShield, setSpoilerShieldState] = useState(true);
  const [recRequests, setRecRequests] = useState<RecRequest[]>(initialRecRequests);
  const [picks, setPicks] = useState<Record<string, Record<string, string>>>(initialFriendPicks);
  const [pendingRate, setPendingRate] = useState<SocialContextType["pendingRate"]>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  // Restore your own settings from this device.
  useEffect(() => {
    setFollowingIds(loadLocal("binge_following", friends.map((f) => f.id)));
    setMyServices(loadLocal("binge_services", ["max", "apple", "netflix"]));
    setSpoilerShieldState(loadLocal("binge_spoiler_shield", true));
    const savedWatching = loadLocal<CurrentlyWatchingEntry[] | null>("binge_watching", null);
    if (savedWatching) setMyWatching(savedWatching);
  }, []);

  const allUsers = useMemo(() => [...friends, ...suggestedUsers], []);
  const getUser = (id: string) => (id === myId || id === ME ? currentUserData : allUsers.find((u) => u.id === id));

  const showToast = (text: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text });
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  const follow = (id: string) =>
    setFollowingIds((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      saveLocal("binge_following", next);
      return next;
    });
  const unfollow = (id: string) =>
    setFollowingIds((prev) => {
      const next = prev.filter((x) => x !== id);
      saveLocal("binge_following", next);
      return next;
    });

  const updateWatching = (fn: (prev: CurrentlyWatchingEntry[]) => CurrentlyWatchingEntry[]) =>
    setMyWatching((prev) => {
      const next = fn(prev);
      saveLocal("binge_watching", next);
      return next;
    });

  const startWatching = (showId: string, season: number) =>
    updateWatching((prev) => [
      { userId: ME, showId, season, startedAt: new Date().toISOString() },
      ...prev.filter((w) => w.showId !== showId),
    ]);
  const setWatchingSeason = (showId: string, season: number) =>
    updateWatching((prev) => prev.map((w) => (w.showId === showId ? { ...w, season } : w)));
  const stopWatching = (showId: string) => updateWatching((prev) => prev.filter((w) => w.showId !== showId));

  const watchingFor = (userId: string) =>
    userId === ME || userId === myId ? myWatching : friendsCurrentlyWatching.filter((w) => w.userId === userId);

  const toggleService = (key: string) =>
    setMyServices((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      saveLocal("binge_services", next);
      return next;
    });

  const setSpoilerShield = (v: boolean) => {
    setSpoilerShieldState(v);
    saveLocal("binge_spoiler_shield", v);
  };

  // ─── Requests ──────────────────────────────────────────────────────────────
  const live = (r: RecRequest) => new Date(r.expiresAt).getTime() > Date.now();
  const myOpenRequest = recRequests.find((r) => r.userId === ME && live(r));
  const openFriendRequests = recRequests.filter((r) => r.userId !== ME && live(r) && followingIds.includes(r.userId));

  const postRequest = (note?: string) => {
    const id = `rq_${Date.now()}`;
    const req: RecRequest = {
      id,
      userId: ME,
      kind: "show",
      note: note?.trim() || undefined,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 48 * 3600000).toISOString(),
      replies: [],
    };
    setRecRequests((prev) => [req, ...prev.filter((r) => r.userId !== ME)]);
    showToast(`Asked ${followingIds.length} friends for a pick`);

    // Sample mode: friends "reply" a few seconds later so the flow can be tried end to end.
    const rated = new Set(showRatings.map((r) => r.show.id));
    const pool: Omit<RecReply, "id" | "createdAt">[] = [
      { fromUserId: "u3", type: "show", itemId: "s15", note: "Best spy show going. Trust." },
      { fromUserId: "u5", type: "show", itemId: "s14", note: "You'll finish it in a weekend" },
      { fromUserId: "u2", type: "show", itemId: "s12", note: "Season 2 is unreal" },
      { fromUserId: "u4", type: "show", itemId: "s9", note: "Funniest thing on TV" },
      { fromUserId: "u6", type: "show", itemId: "s10", note: "Better than Breaking Bad. Fight me." },
      { fromUserId: "u2", type: "show", itemId: "s13", note: "Dragons. Need I say more" },
    ];
    const demoReplies = pool
      .filter((r) => !rated.has(r.itemId))
      .slice(0, 2);
    demoReplies.forEach((reply, i) =>
      setTimeout(() => {
        const full: RecReply = { ...reply, id: `rr_${Date.now()}_${i}`, createdAt: new Date().toISOString() };
        setRecRequests((prev) => prev.map((r) => (r.id === id ? { ...r, replies: [...r.replies, full] } : r)));
        const from = friends.find((f) => f.id === reply.fromUserId);
        sendRecommendation({
          id: `n_${full.id}`,
          type: "rec_reply",
          fromUserId: reply.fromUserId,
          fromUser: from,
          requestId: id,
          message: reply.note,
          timestamp: full.createdAt,
          seen: false,
        });
      }, 4000 + i * 5000),
    );
  };

  const closeMyRequest = () => setRecRequests((prev) => prev.filter((r) => r.userId !== ME));

  const sendRecToRequest = (requestId: string, itemId: string, note?: string) => {
    setRecRequests((prev) =>
      prev.map((r) =>
        r.id !== requestId
          ? r
          : {
              ...r,
              replies: [
                ...r.replies.filter((x) => x.fromUserId !== ME),
                { id: `rr_${Date.now()}`, fromUserId: ME, type: "show", itemId, note: note?.trim() || undefined, createdAt: new Date().toISOString() },
              ],
            },
      ),
    );
  };

  // ─── Predictions ───────────────────────────────────────────────────────────
  const makePick = (questionId: string, optionId: string) => {
    const q = initialPredictionQuestions.find((x) => x.id === questionId);
    if (q && new Date(q.locksAt).getTime() <= Date.now()) return; // locked
    setPicks((prev) => ({ ...prev, [questionId]: { ...(prev[questionId] ?? {}), [ME]: optionId } }));
  };

  const myRows = useMemo(() => myRatingRows(ME, showRatings), [showRatings]);

  const value: SocialContextType = {
    allUsers,
    getUser,
    followingIds,
    isFollowing: (id) => followingIds.includes(id),
    follow,
    unfollow,
    myRows,
    myWatching,
    watchingFor,
    startWatching,
    setWatchingSeason,
    stopWatching,
    pendingRate,
    requestRate: (id, season) => setPendingRate({ id, season }),
    clearPendingRate: () => setPendingRate(null),
    myServices,
    toggleService,
    recRequests,
    myOpenRequest,
    openFriendRequests,
    postRequest,
    closeMyRequest,
    sendRecToRequest,
    questions: initialPredictionQuestions,
    picks,
    makePick,
    spoilerShield,
    setSpoilerShield,
    toast,
    showToast,
  };

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
}

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error("useSocial must be used within SocialProvider");
  return ctx;
}

export const MY_ID = ME;
