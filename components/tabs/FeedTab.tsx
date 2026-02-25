"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { ContentType, FeedActivity, CommunityItem, User } from "@/lib/types";
import {
  communityMovies,
  communityShows,
  communitySeasons,
  friends,
  nowPlaying,
  comingSoon,
  newAndReturning,
} from "@/lib/mockData";
import { timeAgo, getRatingColor } from "@/lib/utils";
import RatingBadge from "@/components/RatingBadge";
import FriendProfileSheet from "@/components/FriendProfileSheet";
import NotificationsSheet from "@/components/NotificationsSheet";
import SearchOverlay from "@/components/SearchOverlay";

type FeedTab = "friends" | "community" | "new";
type ContentFilter = "all" | "movies" | "shows";
type CommunitySubTab = "movies" | "shows" | "seasons";

const reactionTypes = [
  { key: "fire", icon: "🔥", label: "Fire" },
  { key: "agree", icon: "✓", label: "Agree" },
  { key: "disagree", icon: "✗", label: "Nah" },
  { key: "mustwatch", icon: "◉", label: "Must Watch" },
] as const;
type ReactionKey = (typeof reactionTypes)[number]["key"];

export default function FeedTab() {
  const {
    feedActivities,
    addFeedActivity,
    toggleReaction,
    watchlist,
    addToWatchlist,
    setActiveTab,
    setPendingAddItem,
    notifications,
    unreadCount,
    markNotificationsRead,
    pushScreen,
  } = useApp();

  const [activeTab, setTab] = useState<FeedTab>("friends");
  const [contentFilter, setContentFilter] = useState<ContentFilter>("all");
  const [communitySubTab, setCommunitySubTab] = useState<CommunitySubTab>("movies");
  const [expandedCommunityId, setExpandedCommunityId] = useState<string | null>(null);
  const [recentlyReacted, setRecentlyReacted] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [recQuery, setRecQuery] = useState("");
  const [showRecInput, setShowRecInput] = useState(false);

  // Friends feed filtering
  const friendsActivities = feedActivities.filter((a) => {
    if (contentFilter === "movies") return a.type === "movie_rating";
    if (contentFilter === "shows") return a.type === "show_rating";
    // "all" shows everything
    return true;
  });

  // Community data
  const rawCommunityData: CommunityItem[] =
    communitySubTab === "movies"
      ? communityMovies
      : communitySubTab === "shows"
        ? communityShows
        : communitySeasons;

  const getFriend = (userId: string) => friends.find((f) => f.id === userId);
  const getFriendByHandle = (handle: string) =>
    friends.find((f) => f.handle === handle || f.username === handle.replace("@", ""));

  const getReactionCount = (
    reactions: Record<string, string[]> | { userId: string; type: string }[] | undefined,
    type: string
  ) => {
    if (!reactions) return 0;
    if (Array.isArray(reactions)) return reactions.filter((r) => r.type === type).length;
    return (reactions[type] ?? []).length;
  };

  const hasUserReacted = (
    reactions: Record<string, string[]> | { userId: string; type: string }[] | undefined,
    type: string
  ) => {
    if (!reactions) return false;
    if (Array.isArray(reactions)) return reactions.some((r) => r.userId === "u1" && r.type === type);
    return (reactions[type] ?? []).includes("u1");
  };

  const isOnWatchlist = (title: string) => watchlist.some((w) => (w.movie?.title ?? w.show?.title ?? w.title) === title);

  function handleCommunityWatchlist(item: CommunityItem) {
    const title = item.movie?.title ?? item.show?.title ?? "";
    const year = item.movie?.year ?? item.show?.year ?? 0;
    const genre = item.movie?.genre ?? item.show?.genre ?? "";
    const contentId = item.movie?.id ?? item.show?.id ?? "unknown";
    const contentType: "movie" | "show" = item.movie ? "movie" : "show";
    if (isOnWatchlist(title)) return;
    addToWatchlist({
      id: "wl-" + Date.now(),
      userId: "u1",
      contentId,
      contentType,
      title,
      year,
      genre: Array.isArray(genre) ? genre[0] : genre,
      addedAt: new Date().toISOString(),
    });
  }

  function handleCommunityRate(item: CommunityItem) {
    const title = item.movie?.title ?? item.show?.title ?? "";
    const year = item.movie?.year ?? item.show?.year ?? 0;
    const genre = item.movie?.genre ?? item.show?.genre ?? "";
    const id = item.movie?.id ?? item.show?.id ?? "unknown";
    const isShow = !!item.show;
    const pendingItem = isShow
      ? { id, title, year, genre: Array.isArray(genre) ? genre[0] : genre, seasons: 1, totalSeasons: 1 }
      : { id, title, year, genre: Array.isArray(genre) ? genre[0] : genre };
    setPendingAddItem(pendingItem as unknown as Parameters<typeof setPendingAddItem>[0]);
    setActiveTab("add");
  }

  function handleReaction(activityId: string, key: ReactionKey) {
    toggleReaction(activityId, key);
    setRecentlyReacted(`${activityId}-${key}`);
    setTimeout(() => setRecentlyReacted(null), 250);
  }

  function handlePostRecRequest() {
    if (!recQuery.trim()) return;
    const newActivity: FeedActivity = {
      id: `fa_rec_${Date.now()}`,
      user: { id: "u1", name: "Gavin Ostrow", displayName: "Gavin Ostrow", username: "gavin", handle: "@gavin", avatarColor: "#8B5CF6" },
      type: "rec_request",
      recQuery: recQuery.trim(),
      recGenres: [],
      timestamp: new Date().toISOString(),
      reactions: {},
      comments: [],
    };
    addFeedActivity(newActivity);
    setRecQuery("");
    setShowRecInput(false);
  }

  return (
    <div className="flex flex-col pb-24">
      {/* Header */}
      <div className="pt-4 px-4 flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold lowercase font-display text-text-primary">
          binge
        </h1>
        <button
          onClick={() => {
            setShowNotifications(true);
            markNotificationsRead();
          }}
          className="relative p-2 text-text-muted hover:text-text-secondary active:scale-90 transition-all"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Search bar */}
      <div className="px-4 mb-3">
        <button
          onClick={() => setShowSearch(true)}
          className="w-full bg-bg-elevated rounded-xl px-4 py-2.5 text-sm text-text-muted flex items-center gap-2 active:opacity-80 transition-opacity"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Search movies, shows, actors...
        </button>
      </div>

      {/* Tab bar: Friends | Community | What's New */}
      <div className="flex border-b border-bg-elevated px-4 mb-0">
        {(["friends", "community", "new"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setTab(tab)}
            className={`mr-6 pb-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab
                ? "text-text-primary border-b-2 border-accent-purple"
                : "text-text-muted"
            }`}
          >
            {tab === "friends" ? "Friends" : tab === "community" ? "Community" : "What's New"}
          </button>
        ))}
      </div>

      {/* ── FRIENDS TAB ── */}
      {activeTab === "friends" && (
        <div className="flex flex-col animate-fadeIn">
          {/* Ask the community prompt box */}
          <div className="px-4 pt-3 pb-1">
            {showRecInput ? (
              <div className="bg-bg-surface rounded-xl border border-bg-elevated overflow-hidden">
                <div className="flex items-center gap-3 px-4 pt-3 pb-2">
                  <div className="w-8 h-8 rounded-full bg-accent-purple flex items-center justify-center text-white text-sm font-bold shrink-0">
                    G
                  </div>
                  <textarea
                    autoFocus
                    value={recQuery}
                    onChange={(e) => setRecQuery(e.target.value)}
                    placeholder="What are you looking for? Be specific..."
                    rows={2}
                    className="flex-1 bg-transparent text-text-primary text-sm resize-none outline-none placeholder:text-text-muted"
                  />
                </div>
                <div className="flex items-center justify-between px-4 pb-3 pt-1 border-t border-bg-elevated">
                  <button
                    onClick={() => { setShowRecInput(false); setRecQuery(""); }}
                    className="text-text-muted text-xs font-medium active:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePostRecRequest}
                    disabled={!recQuery.trim()}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                      recQuery.trim()
                        ? "bg-accent-purple text-white"
                        : "bg-bg-elevated text-text-muted"
                    }`}
                  >
                    Ask →
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowRecInput(true)}
                className="w-full bg-bg-surface rounded-xl border border-bg-elevated px-4 py-3 flex items-center gap-3 active:opacity-80 transition-opacity"
              >
                <div className="w-7 h-7 rounded-full bg-accent-purple/80 flex items-center justify-center text-white shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <span className="text-text-muted text-sm">Looking for a rec? Ask the community...</span>
              </button>
            )}
          </div>

          {/* All / Movies / Shows filter pills */}
          <div className="flex gap-2 px-4 pt-3 pb-2">
            {(["all", "movies", "shows"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setContentFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all active:scale-95 ${
                  contentFilter === f
                    ? "bg-accent-purple text-white"
                    : "bg-bg-elevated text-text-muted"
                }`}
              >
                {f === "all" ? "All" : f === "movies" ? "Movies" : "Shows"}
              </button>
            ))}
          </div>

          {/* Feed cards */}
          <div className="flex flex-col gap-3 px-4 pt-1">
            {friendsActivities.map((activity) => {
              if (activity.type === "rec_request") {
                return (
                  <RecRequestCard
                    key={activity.id}
                    activity={activity}
                    onSelectFriend={setSelectedFriend}
                    getFriend={getFriend}
                    getReactionCount={getReactionCount}
                    hasUserReacted={hasUserReacted}
                    handleReaction={handleReaction}
                    recentlyReacted={recentlyReacted}
                  />
                );
              }
              const friend = activity.user ?? (activity.userId ? getFriend(activity.userId) : null);
              if (!friend) return null;
              return (
                <RatingCard
                  key={activity.id}
                  activity={activity}
                  friend={friend}
                  onSelectFriend={setSelectedFriend}
                  getFriendByHandle={getFriendByHandle}
                  getReactionCount={getReactionCount}
                  hasUserReacted={hasUserReacted}
                  handleReaction={handleReaction}
                  recentlyReacted={recentlyReacted}
                  pushScreen={pushScreen}
                />
              );
            })}

            {friendsActivities.length === 0 && (
              <div className="text-center text-text-muted text-sm py-12">
                No activity yet. Start rating to see your friends&apos; feed!
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── COMMUNITY TAB ── */}
      {activeTab === "community" && (
        <div className="flex flex-col animate-fadeIn">
          {/* Sub-tabs */}
          <div className="flex gap-6 px-4 pt-3 pb-0 border-b border-bg-elevated">
            {(["movies", "shows", "seasons"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setCommunitySubTab(tab); setExpandedCommunityId(null); }}
                className={`pb-2.5 text-sm font-medium capitalize transition-colors ${
                  communitySubTab === tab
                    ? "text-text-primary border-b-2 border-accent-purple"
                    : "text-text-muted"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 px-4 pt-3">
            {rawCommunityData.map((item, index) => {
              const itemTitle = item.movie?.title ?? item.show?.title ?? "";
              const itemYear = item.movie?.year ?? item.show?.year ?? 0;
              const rawGenre = item.movie?.genre ?? item.show?.genre ?? "";
              const itemGenre = Array.isArray(rawGenre) ? rawGenre[0] ?? "" : rawGenre;
              const itemId = item.movie?.id ?? item.show?.id ?? `item-${index}`;
              const itemSeason = item.season;
              return (
                <div key={itemId}>
                  <div
                    onClick={() => setExpandedCommunityId(expandedCommunityId === itemId ? null : itemId)}
                    className="bg-bg-surface rounded-xl p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
                  >
                    <span className="text-text-muted font-display text-sm w-6 text-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="text-sm font-semibold text-text-primary truncate">
                        {itemTitle}
                        {itemSeason != null && <span className="text-text-secondary"> S{itemSeason}</span>}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted">{itemYear}</span>
                        {itemGenre && (
                          <>
                            <span className="text-text-muted text-xs">·</span>
                            <span className="text-xs text-text-muted">{itemGenre}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-text-muted text-xs">{item.ratingCount.toLocaleString()} ratings</span>
                      <RatingBadge rating={item.averageRating} size="sm" />
                    </div>
                  </div>

                  {expandedCommunityId === itemId && (
                    <div className="bg-bg-elevated rounded-b-xl px-4 py-3 flex flex-col gap-3 -mt-1 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-text-secondary text-xs">Community avg</p>
                          <p className="font-display font-bold text-lg" style={{ color: getRatingColor(item.averageRating) }}>
                            {item.averageRating.toFixed(1)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-text-secondary text-xs">Ratings</p>
                          <p className="text-text-primary font-semibold">{item.ratingCount.toLocaleString()}</p>
                        </div>
                      </div>
                      {communitySubTab !== "seasons" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCommunityRate(item)}
                            className="flex-1 bg-accent-purple text-white text-sm font-semibold py-2 rounded-lg active:scale-95 transition-all"
                          >
                            Rate This
                          </button>
                          <button
                            onClick={() => handleCommunityWatchlist(item)}
                            className={`flex-1 text-sm font-semibold py-2 rounded-lg active:scale-95 transition-all border ${
                              isOnWatchlist(itemTitle)
                                ? "border-accent-purple text-accent-purple"
                                : "border-bg-elevated text-text-primary"
                            }`}
                          >
                            {isOnWatchlist(itemTitle) ? "✓ Saved" : "+ Watchlist"}
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          if (item.movie?.id) pushScreen({ screen: "movie-detail", movieId: item.movie.id });
                          else if (item.show?.id) pushScreen({ screen: "show-detail", showId: item.show.id });
                        }}
                        className="text-accent-purple text-xs font-semibold text-center py-1 active:opacity-60 transition-opacity"
                      >
                        View Details →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── WHAT'S NEW TAB ── */}
      {activeTab === "new" && (
        <div className="flex flex-col animate-fadeIn px-4 pt-3 gap-5">
          {/* In Theaters */}
          <section>
            <h3 className="text-text-muted text-xs font-bold uppercase tracking-widest mb-3">In Theaters</h3>
            <div className="flex flex-col gap-2">
              {nowPlaying.slice(0, 5).map((entry, i) => (
                <button
                  key={entry.movie.id ?? i}
                  onClick={() => entry.movie.id && pushScreen({ screen: "movie-detail", movieId: entry.movie.id })}
                  className="bg-bg-surface rounded-xl p-3 flex items-center gap-3 active:scale-[0.98] transition-all text-left"
                >
                  <span className="text-text-muted font-display text-sm w-5 text-center shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm font-semibold truncate">{entry.movie.title}</p>
                    <p className="text-text-muted text-xs mt-0.5 truncate">{entry.buzz}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted shrink-0">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
          </section>

          {/* Coming Soon */}
          <section>
            <h3 className="text-text-muted text-xs font-bold uppercase tracking-widest mb-3">Coming Soon</h3>
            <div className="flex flex-col gap-2">
              {comingSoon.slice(0, 5).map((entry, i) => (
                <div
                  key={entry.movie.id ?? i}
                  className="bg-bg-surface rounded-xl p-3 flex items-center gap-3"
                >
                  <span className="text-text-muted font-display text-sm w-5 text-center shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm font-semibold truncate">{entry.movie.title}</p>
                    <p className="text-text-muted text-xs mt-0.5 truncate">{entry.buzz}</p>
                  </div>
                  <span className="text-text-muted text-xs shrink-0">
                    {new Date(entry.releaseDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* New & Returning Shows */}
          <section>
            <h3 className="text-text-muted text-xs font-bold uppercase tracking-widest mb-3">New & Returning Shows</h3>
            <div className="flex flex-col gap-2">
              {newAndReturning.slice(0, 5).map((entry, i) => (
                <button
                  key={entry.show.id ?? i}
                  onClick={() => entry.show.id && pushScreen({ screen: "show-detail", showId: entry.show.id })}
                  className="bg-bg-surface rounded-xl p-3 flex items-center gap-3 active:scale-[0.98] transition-all text-left"
                >
                  <span className="text-text-muted font-display text-sm w-5 text-center shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm font-semibold truncate">{entry.show.title}</p>
                    <p className="text-text-muted text-xs mt-0.5">{entry.type ?? "New"} · {entry.network}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted shrink-0">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Sheets */}
      {selectedFriend && (
        <FriendProfileSheet friend={selectedFriend} onClose={() => setSelectedFriend(null)} />
      )}
      {showNotifications && (
        <NotificationsSheet notifications={notifications} onClose={() => setShowNotifications(false)} />
      )}
      {showSearch && (
        <SearchOverlay onClose={() => setShowSearch(false)} />
      )}
    </div>
  );
}

// ─── Rec Request Card ─────────────────────────────────────────────────────────

function RecRequestCard({
  activity,
  onSelectFriend,
  getFriend,
  getReactionCount,
  hasUserReacted,
  handleReaction,
  recentlyReacted,
}: {
  activity: FeedActivity;
  onSelectFriend: (f: User | null) => void;
  getFriend: (id: string) => User | undefined;
  getReactionCount: (reactions: any, type: string) => number;
  hasUserReacted: (reactions: any, type: string) => boolean;
  handleReaction: (id: string, key: any) => void;
  recentlyReacted: string | null;
}) {
  const [showDropRec, setShowDropRec] = useState(false);
  const [recText, setRecText] = useState("");
  const { addComment } = useApp();

  const friend = activity.user ?? (activity.userId ? getFriend(activity.userId) : null);
  if (!friend) return null;

  const firstName = (friend.displayName ?? friend.name ?? "them").split(" ")[0];

  function handleDropRec() {
    if (!recText.trim()) return;
    addComment(activity.id, {
      id: `c_${Date.now()}`,
      userId: "u1",
      user: { id: "u1", name: "Gavin Ostrow", displayName: "Gavin Ostrow", username: "gavin", handle: "@gavin", avatarColor: "#8B5CF6" },
      text: recText.trim(),
      timestamp: new Date().toISOString(),
    });
    setRecText("");
    setShowDropRec(false);
  }

  return (
    <div className="bg-bg-surface rounded-xl overflow-hidden">
      {/* User row */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
        <button
          onClick={() => onSelectFriend(friend ?? null)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 active:opacity-70 transition-opacity"
          style={{ backgroundColor: friend.avatarColor ?? "#8B5CF6" }}
        >
          {(friend.displayName ?? friend.name ?? "?").charAt(0).toUpperCase()}
        </button>
        <div className="flex-1 min-w-0">
          <button onClick={() => onSelectFriend(friend ?? null)} className="text-left active:opacity-70">
            <span className="text-sm font-semibold text-text-primary">
              {friend.displayName ?? friend.name}
            </span>
            <span className="text-text-muted text-xs ml-1.5">{friend.handle ?? friend.username ?? ""}</span>
          </button>
          <p className="text-text-muted text-xs">
            is looking for a rec · {timeAgo(activity.timestamp ?? activity.createdAt ?? "")}
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-full border border-accent-purple/60 text-accent-purple shrink-0">
          REC?
        </span>
      </div>

      {/* Query */}
      {activity.recQuery && (
        <div className="mx-4 mb-3 bg-bg-elevated rounded-lg px-4 py-3">
          <p className="text-text-secondary text-sm leading-relaxed">
            &ldquo;{activity.recQuery}&rdquo;
          </p>
          {activity.recGenres && activity.recGenres.length > 0 && (
            <div className="flex gap-1.5 mt-2">
              {activity.recGenres.map((g) => (
                <span key={g} className="text-[10px] font-semibold px-2 py-0.5 bg-bg-surface rounded-full text-text-muted border border-bg-hover">
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Give a Rec button */}
      <div className="mx-4 mb-3">
        <button
          onClick={() => setShowDropRec(!showDropRec)}
          className="w-full border border-accent-purple/40 rounded-lg py-2.5 text-accent-purple text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all active:bg-accent-purple/5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Give a Rec to {firstName}
        </button>
      </div>

      {/* Drop a rec input */}
      {showDropRec && (
        <div className="mx-4 mb-3 bg-bg-elevated rounded-lg overflow-hidden animate-fadeIn">
          <textarea
            autoFocus
            value={recText}
            onChange={(e) => setRecText(e.target.value)}
            placeholder={`Recommend something to ${firstName}...`}
            rows={2}
            className="w-full bg-transparent text-text-primary text-sm px-3 pt-3 pb-2 resize-none outline-none placeholder:text-text-muted"
          />
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
            <button onClick={() => setShowDropRec(false)} className="text-text-muted text-xs active:opacity-60">
              Cancel
            </button>
            <button
              onClick={handleDropRec}
              disabled={!recText.trim()}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                recText.trim() ? "bg-accent-purple text-white" : "bg-bg-hover text-text-muted"
              }`}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Existing recs / comments */}
      {activity.comments && activity.comments.length > 0 && (
        <div className="border-t border-bg-elevated mx-4 pt-2 pb-3 flex flex-col gap-2">
          {activity.comments.map((comment) => {
            const commenter = comment.user ?? (comment.userId ? getFriend(comment.userId) : null);
            return (
              <div key={comment.id} className="flex items-start gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: commenter?.avatarColor ?? "#8B5CF6" }}
                >
                  {(commenter?.displayName ?? commenter?.name ?? "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-text-secondary text-xs font-semibold">
                    {commenter?.displayName ?? commenter?.name ?? "Someone"}
                  </span>
                  <span className="text-text-primary text-xs ml-1.5">{comment.text}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drop a rec link (when no input open) */}
      {!showDropRec && (
        <div className="border-t border-bg-elevated px-4 py-2.5">
          <button
            onClick={() => setShowDropRec(true)}
            className="flex items-center gap-2 text-text-muted text-xs active:opacity-60 transition-opacity"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Drop a rec
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Rating Card ──────────────────────────────────────────────────────────────

function RatingCard({
  activity,
  friend,
  onSelectFriend,
  getFriendByHandle,
  getReactionCount,
  hasUserReacted,
  handleReaction,
  recentlyReacted,
  pushScreen,
}: {
  activity: FeedActivity;
  friend: User;
  onSelectFriend: (f: User) => void;
  getFriendByHandle: (h: string) => User | undefined;
  getReactionCount: (reactions: any, type: string) => number;
  hasUserReacted: (reactions: any, type: string) => boolean;
  handleReaction: (id: string, key: any) => void;
  recentlyReacted: string | null;
  pushScreen: (d: any) => void;
}) {
  return (
    <div className="bg-bg-surface rounded-xl p-4 flex flex-col gap-3">
      {/* User row */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSelectFriend(friend)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 active:opacity-70 transition-opacity"
          style={{ backgroundColor: friend.avatarColor ?? "#8B5CF6" }}
        >
          {(friend.displayName ?? friend.name ?? "?").charAt(0).toUpperCase()}
        </button>
        <button
          onClick={() => onSelectFriend(friend)}
          className="flex items-center gap-1.5 min-w-0 active:opacity-70 transition-opacity"
        >
          <span className="text-sm font-semibold text-text-primary truncate">
            {friend.displayName ?? friend.name}
          </span>
          <span className="text-xs text-text-muted">{friend.handle ?? friend.username ?? ""}</span>
        </button>
        <span className="text-xs text-text-muted ml-auto shrink-0">
          {timeAgo(activity.timestamp ?? activity.createdAt ?? "")}
        </span>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (activity.movie?.id) pushScreen({ screen: "movie-detail", movieId: activity.movie.id });
            else if (activity.show?.id) pushScreen({ screen: "show-detail", showId: activity.show.id });
          }}
          className="font-display font-bold text-text-primary text-left active:opacity-70 transition-opacity text-base"
        >
          {activity.title ?? activity.movie?.title ?? activity.show?.title}
          {activity.season != null && (
            <span className="text-text-secondary font-normal"> S{activity.season}</span>
          )}
        </button>
        {activity.rating != null && <RatingBadge rating={activity.rating} size="md" />}
      </div>

      {/* Review */}
      {activity.review && (
        <p className="text-text-secondary text-sm leading-relaxed">&ldquo;{activity.review}&rdquo;</p>
      )}

      {/* Tagged users */}
      {activity.taggedUsers && activity.taggedUsers.length > 0 && (
        <div className="text-sm text-text-secondary flex flex-wrap gap-x-1">
          <span>with</span>
          {activity.taggedUsers.map((taggedHandle, idx) => {
            const taggedFriend = getFriendByHandle(taggedHandle);
            return (
              <span key={taggedHandle}>
                <button
                  onClick={() => taggedFriend && onSelectFriend(taggedFriend)}
                  className={`${taggedFriend ? "text-accent-purple active:opacity-60" : "text-text-muted"} transition-opacity`}
                >
                  {taggedHandle}
                </button>
                {idx < activity.taggedUsers!.length - 1 && ","}
              </span>
            );
          })}
        </div>
      )}

      {/* Reactions */}
      <div className="flex items-center gap-2 pt-0.5">
        {reactionTypes.map((reaction) => {
          const count = getReactionCount(activity.reactions, reaction.key);
          const active = hasUserReacted(activity.reactions, reaction.key);
          const justReacted = recentlyReacted === `${activity.id}-${reaction.key}`;
          return (
            <button
              key={reaction.key}
              onClick={() => handleReaction(activity.id, reaction.key)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs transition-all ${
                active ? "bg-accent-purple/15 text-accent-purple" : "bg-bg-elevated text-text-muted"
              } ${justReacted ? "animate-reaction-pop" : ""}`}
            >
              <span>{reaction.icon}</span>
              <span>{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
