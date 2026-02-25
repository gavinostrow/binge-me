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
import PosterImage from "@/components/PosterImage";
import FriendProfileSheet from "@/components/FriendProfileSheet";
import NotificationsSheet from "@/components/NotificationsSheet";
import SearchOverlay from "@/components/SearchOverlay";

type FeedTab = "friends" | "community" | "new";
type ContentFilter = "all" | "movies" | "shows";
type CommunitySubTab = "movies" | "shows" | "seasons";

const reactionTypes = [
  { key: "fire", icon: "🔥" },
  { key: "agree", icon: "✓" },
  { key: "disagree", icon: "✗" },
  { key: "mustwatch", icon: "◉" },
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

  const friendsActivities = feedActivities.filter((a) => {
    if (contentFilter === "movies") return a.type === "movie_rating";
    if (contentFilter === "shows") return a.type === "show_rating";
    return true;
  });

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

  const isOnWatchlist = (title: string) =>
    watchlist.some((w) => (w.movie?.title ?? w.show?.title ?? w.title) === title);

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
        <h1 className="text-2xl font-bold lowercase font-display text-text-primary">binge</h1>
        <button
          onClick={() => {
            setShowNotifications(true);
            markNotificationsRead();
          }}
          className="relative p-2 -mr-1 text-text-muted active:scale-90 transition-all"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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

      {/* Tab bar */}
      <div className="flex border-b border-bg-elevated px-4">
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
          {/* Ask community prompt */}
          <div className="px-4 pt-3 pb-1">
            {showRecInput ? (
              <div className="bg-bg-surface rounded-xl border border-bg-elevated overflow-hidden">
                <div className="flex items-start gap-3 px-4 pt-3 pb-2">
                  <div className="w-7 h-7 rounded-full bg-accent-purple flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">G</div>
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
                  <button onClick={() => { setShowRecInput(false); setRecQuery(""); }} className="text-text-muted text-xs font-medium">Cancel</button>
                  <button
                    onClick={handlePostRecRequest}
                    disabled={!recQuery.trim()}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${recQuery.trim() ? "bg-accent-purple text-white" : "bg-bg-elevated text-text-muted"}`}
                  >
                    Ask
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowRecInput(true)}
                className="w-full bg-bg-surface rounded-xl border border-bg-elevated px-4 py-2.5 flex items-center gap-2.5 active:opacity-80 transition-opacity"
              >
                <div className="w-6 h-6 rounded-full bg-accent-purple/80 flex items-center justify-center text-white shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </div>
                <span className="text-text-muted text-sm">Looking for a rec? Ask the community...</span>
              </button>
            )}
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 px-4 pt-3 pb-2">
            {(["all", "movies", "shows"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setContentFilter(f)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                  contentFilter === f ? "bg-accent-purple text-white" : "bg-bg-elevated text-text-muted"
                }`}
              >
                {f === "all" ? "All" : f === "movies" ? "Movies" : "Shows"}
              </button>
            ))}
          </div>

          {/* Feed cards */}
          <div className="flex flex-col gap-2.5 px-4 pt-1">
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
              <div className="text-center text-text-muted text-sm py-12">No activity yet.</div>
            )}
          </div>
        </div>
      )}

      {/* ── COMMUNITY TAB ── */}
      {activeTab === "community" && (
        <div className="flex flex-col animate-fadeIn">
          <div className="flex gap-5 px-4 pt-3 pb-0 border-b border-bg-elevated">
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
              const posterPath = item.movie?.posterPath ?? item.show?.posterPath;
              return (
                <div key={itemId}>
                  <div
                    onClick={() => setExpandedCommunityId(expandedCommunityId === itemId ? null : itemId)}
                    className="bg-bg-surface rounded-xl p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
                  >
                    <span className="text-text-muted font-display text-sm w-5 text-center shrink-0">{index + 1}</span>
                    <PosterImage title={itemTitle} year={itemYear} posterPath={posterPath} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">{itemTitle}</p>
                      <p className="text-xs text-text-muted mt-0.5">{itemYear}{itemGenre ? ` · ${itemGenre}` : ""}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-text-muted text-xs">{item.ratingCount.toLocaleString()}</span>
                      <RatingBadge rating={item.averageRating} size="sm" />
                    </div>
                  </div>

                  {expandedCommunityId === itemId && (
                    <div className="bg-bg-elevated rounded-b-xl px-4 py-3 flex flex-col gap-2.5 -mt-1 animate-fadeIn">
                      <div className="flex gap-2">
                        {communitySubTab !== "seasons" && (
                          <button
                            onClick={() => handleCommunityRate(item)}
                            className="flex-1 bg-accent-purple text-white text-sm font-semibold py-2 rounded-lg active:scale-95 transition-all"
                          >
                            Rate
                          </button>
                        )}
                        <button
                          onClick={() => handleCommunityWatchlist(item)}
                          className={`flex-1 text-sm font-semibold py-2 rounded-lg active:scale-95 transition-all border ${
                            isOnWatchlist(itemTitle)
                              ? "border-accent-purple text-accent-purple"
                              : "border-bg-hover text-text-primary"
                          }`}
                        >
                          {isOnWatchlist(itemTitle) ? "Saved" : "+ Watchlist"}
                        </button>
                        <button
                          onClick={() => {
                            if (item.movie?.id) pushScreen({ screen: "movie-detail", movieId: item.movie.id });
                            else if (item.show?.id) pushScreen({ screen: "show-detail", showId: item.show.id });
                          }}
                          className="flex-1 text-sm font-semibold py-2 rounded-lg active:scale-95 transition-all border border-bg-hover text-text-muted"
                        >
                          Details
                        </button>
                      </div>
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
          <section>
            <h3 className="text-text-muted text-xs font-bold uppercase tracking-widest mb-2">In Theaters</h3>
            <div className="flex flex-col gap-2">
              {nowPlaying.slice(0, 5).map((entry, i) => (
                <button
                  key={entry.movie.id ?? i}
                  onClick={() => entry.movie.id && pushScreen({ screen: "movie-detail", movieId: entry.movie.id })}
                  className="bg-bg-surface rounded-xl p-3 flex items-center gap-3 active:scale-[0.98] transition-all text-left"
                >
                  <PosterImage title={entry.movie.title} year={entry.movie.year} posterPath={entry.movie.posterPath} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm font-semibold truncate">{entry.movie.title}</p>
                    <p className="text-text-muted text-xs mt-0.5 truncate">{entry.buzz}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted shrink-0"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-text-muted text-xs font-bold uppercase tracking-widest mb-2">Coming Soon</h3>
            <div className="flex flex-col gap-2">
              {comingSoon.slice(0, 5).map((entry, i) => (
                <div key={entry.movie.id ?? i} className="bg-bg-surface rounded-xl p-3 flex items-center gap-3">
                  <PosterImage title={entry.movie.title} year={entry.movie.year} posterPath={entry.movie.posterPath} size="sm" />
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

          <section>
            <h3 className="text-text-muted text-xs font-bold uppercase tracking-widest mb-2">New & Returning Shows</h3>
            <div className="flex flex-col gap-2">
              {newAndReturning.slice(0, 5).map((entry, i) => (
                <button
                  key={entry.show.id ?? i}
                  onClick={() => entry.show.id && pushScreen({ screen: "show-detail", showId: entry.show.id })}
                  className="bg-bg-surface rounded-xl p-3 flex items-center gap-3 active:scale-[0.98] transition-all text-left"
                >
                  <PosterImage title={entry.show.title} year={entry.show.year} posterPath={entry.show.posterPath} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm font-semibold truncate">{entry.show.title}</p>
                    <p className="text-text-muted text-xs mt-0.5">{entry.type ?? "New"} · {entry.network}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted shrink-0"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {selectedFriend && <FriendProfileSheet friend={selectedFriend} onClose={() => setSelectedFriend(null)} />}
      {showNotifications && <NotificationsSheet notifications={notifications} onClose={() => setShowNotifications(false)} />}
      {showSearch && <SearchOverlay onClose={() => setShowSearch(false)} />}
    </div>
  );
}

// ─── Rec Request Card ─────────────────────────────────────────────────────────
function RecRequestCard({
  activity, onSelectFriend, getFriend, getReactionCount, hasUserReacted, handleReaction, recentlyReacted,
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
      <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-2">
        <button
          onClick={() => onSelectFriend(friend ?? null)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ backgroundColor: friend.avatarColor ?? "#8B5CF6" }}
        >
          {(friend.displayName ?? friend.name ?? "?").charAt(0).toUpperCase()}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <button onClick={() => onSelectFriend(friend ?? null)} className="text-sm font-semibold text-text-primary">
              {friend.displayName ?? friend.name}
            </button>
            <span className="text-text-muted text-xs">{friend.handle ?? friend.username ?? ""}</span>
          </div>
          <p className="text-text-muted text-xs">is looking for a rec · {timeAgo(activity.timestamp ?? activity.createdAt ?? "")}</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-accent-purple/60 text-accent-purple shrink-0">REC?</span>
      </div>

      {activity.recQuery && (
        <div className="mx-4 mb-3 bg-bg-elevated rounded-lg px-3 py-2.5">
          <p className="text-text-secondary text-sm leading-relaxed">&ldquo;{activity.recQuery}&rdquo;</p>
          {activity.recGenres && activity.recGenres.length > 0 && (
            <div className="flex gap-1.5 mt-2">
              {activity.recGenres.map((g) => (
                <span key={g} className="text-[10px] font-semibold px-2 py-0.5 bg-bg-surface rounded-full text-text-muted border border-bg-hover">{g}</span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mx-4 mb-3">
        <button
          onClick={() => setShowDropRec(!showDropRec)}
          className="w-full border border-accent-purple/40 rounded-lg py-2 text-accent-purple text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Give a Rec to {firstName}
        </button>
      </div>

      {showDropRec && (
        <div className="mx-4 mb-3 bg-bg-elevated rounded-lg overflow-hidden animate-fadeIn">
          <textarea
            autoFocus value={recText} onChange={(e) => setRecText(e.target.value)}
            placeholder={`Recommend something to ${firstName}...`} rows={2}
            className="w-full bg-transparent text-text-primary text-sm px-3 pt-3 pb-2 resize-none outline-none placeholder:text-text-muted"
          />
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
            <button onClick={() => setShowDropRec(false)} className="text-text-muted text-xs">Cancel</button>
            <button
              onClick={handleDropRec} disabled={!recText.trim()}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${recText.trim() ? "bg-accent-purple text-white" : "bg-bg-hover text-text-muted"}`}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {activity.comments && activity.comments.length > 0 && (
        <div className="border-t border-bg-elevated mx-4 pt-2 pb-3 flex flex-col gap-1.5">
          {activity.comments.map((comment) => {
            const commenter = comment.user ?? (comment.userId ? getFriend(comment.userId) : null);
            return (
              <div key={comment.id} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5" style={{ backgroundColor: commenter?.avatarColor ?? "#8B5CF6" }}>
                  {(commenter?.displayName ?? commenter?.name ?? "?").charAt(0).toUpperCase()}
                </div>
                <p className="text-xs text-text-primary flex-1 min-w-0">
                  <span className="font-semibold text-text-secondary">{commenter?.displayName ?? commenter?.name ?? "Someone"} </span>
                  {comment.text}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {!showDropRec && (
        <div className="border-t border-bg-elevated px-4 py-2">
          <button onClick={() => setShowDropRec(true)} className="flex items-center gap-1.5 text-text-muted text-xs">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            Drop a rec
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Rating Card ──────────────────────────────────────────────────────────────
function RatingCard({
  activity, friend, onSelectFriend, getFriendByHandle, getReactionCount, hasUserReacted, handleReaction, recentlyReacted, pushScreen,
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
  const title = activity.title ?? activity.movie?.title ?? activity.show?.title ?? "";
  const contentTypeLabel = activity.movie ? "a movie" : "a show";
  const posterPath = activity.movie?.posterPath ?? activity.show?.posterPath;
  const year = activity.movie?.year ?? activity.show?.year;

  return (
    <div className="bg-bg-surface rounded-xl p-3.5 flex flex-col gap-2.5">
      {/* Activity summary line */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSelectFriend(friend)}
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ backgroundColor: friend.avatarColor ?? "#8B5CF6" }}
        >
          {(friend.displayName ?? friend.name ?? "?").charAt(0).toUpperCase()}
        </button>
        <p className="text-xs text-text-muted flex-1 min-w-0">
          <button onClick={() => onSelectFriend(friend)} className="font-semibold text-text-secondary">
            {friend.displayName ?? friend.name}
          </button>
          {" rated "}
          <span className="text-text-muted">{contentTypeLabel}</span>
          <span className="ml-auto float-right">{timeAgo(activity.timestamp ?? activity.createdAt ?? "")}</span>
        </p>
      </div>

      {/* Main content row: poster + info */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            if (activity.movie?.id) pushScreen({ screen: "movie-detail", movieId: activity.movie.id });
            else if (activity.show?.id) pushScreen({ screen: "show-detail", showId: activity.show.id });
          }}
          className="shrink-0"
        >
          <PosterImage title={title} year={year} posterPath={posterPath} size="sm" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <button
              onClick={() => {
                if (activity.movie?.id) pushScreen({ screen: "movie-detail", movieId: activity.movie.id });
                else if (activity.show?.id) pushScreen({ screen: "show-detail", showId: activity.show.id });
              }}
              className="font-display font-bold text-text-primary text-left text-sm leading-tight"
            >
              {title}
              {activity.season != null && <span className="text-text-secondary font-normal"> S{activity.season}</span>}
            </button>
            {activity.rating != null && <RatingBadge rating={activity.rating} size="sm" />}
          </div>
          {year && <p className="text-text-muted text-xs mt-0.5">{year}</p>}
          {activity.review && (
            <p className="text-text-secondary text-xs mt-1.5 leading-relaxed">&ldquo;{activity.review}&rdquo;</p>
          )}
        </div>
      </div>

      {/* Reactions */}
      <div className="flex items-center gap-1.5">
        {reactionTypes.map((reaction) => {
          const count = getReactionCount(activity.reactions, reaction.key);
          const active = hasUserReacted(activity.reactions, reaction.key);
          return (
            <button
              key={reaction.key}
              onClick={() => handleReaction(activity.id, reaction.key)}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-all ${
                active ? "bg-accent-purple/15 text-accent-purple" : "bg-bg-elevated text-text-muted"
              }`}
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
