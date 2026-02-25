"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { ContentType, FeedView, CommunityItem, User } from "@/lib/types";
import {
  communityMovies,
  communityShows,
  communitySeasons,
  friends,
} from "@/lib/mockData";
import { timeAgo, getRatingColor } from "@/lib/utils";
import RatingBadge from "@/components/RatingBadge";
import FriendProfileSheet from "@/components/FriendProfileSheet";
import NotificationsSheet from "@/components/NotificationsSheet";
import SearchOverlay from "@/components/SearchOverlay";

const reactionTypes = [
  { key: "fire", icon: "★", label: "Fire" },
  { key: "agree", icon: "✓", label: "Agree" },
  { key: "disagree", icon: "✗", label: "Nah" },
  { key: "mustwatch", icon: "◉", label: "Must Watch" },
] as const;

type ReactionType = (typeof reactionTypes)[number]["key"];

export default function FeedTab() {
  const {
    feedActivities,
    toggleReaction,
    watchlist,
    addToWatchlist,
    setActiveTab,
    setPendingAddItem,
    notifications,
    unreadCount,
    markNotificationsRead,
  } = useApp();

  const [feedView, setFeedView] = useState<FeedView>("friends");
  const [contentFilter, setContentFilter] = useState<ContentType>("movie");
  const [communityTab, setCommunityTab] = useState<
    "movies" | "shows" | "seasons"
  >("movies");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCommunityId, setExpandedCommunityId] = useState<string | null>(null);
  const [recentlyReacted, setRecentlyReacted] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const query = searchQuery.toLowerCase().trim();

  const filteredActivities = feedActivities.filter((activity) => {
    const typeMatch =
      contentFilter === "movie"
        ? activity.type === "movie_rating"
        : activity.type === "show_rating";
    if (!typeMatch) return false;
    if (!query) return true;
    const title = activity.movie?.title ?? activity.show?.title ?? activity.title ?? "";
    const name = activity.user?.displayName ?? activity.user?.name ?? "";
    const handle = activity.user?.handle ?? activity.user?.username ?? "";
    return (
      title.toLowerCase().includes(query) ||
      name.toLowerCase().includes(query) ||
      handle.toLowerCase().includes(query)
    );
  });

  const rawCommunityData: CommunityItem[] =
    communityTab === "movies"
      ? communityMovies
      : communityTab === "shows"
        ? communityShows
        : communitySeasons;

  const communityData = query
    ? rawCommunityData.filter((item) =>
        (item.movie?.title ?? item.show?.title ?? "").toLowerCase().includes(query)
      )
    : rawCommunityData;

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
    watchlist.some((w) => w.title === title);

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

  function handleReaction(activityId: string, key: ReactionType) {
    toggleReaction(activityId, key);
    setRecentlyReacted(`${activityId}-${key}`);
    setTimeout(() => setRecentlyReacted(null), 250);
  }

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Header */}
      <div className="pt-4 px-1 flex items-center justify-between">
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

      {/* Search bar — tapping opens global overlay */}
      <div className="relative">
        <div
          onClick={() => setShowSearch(true)}
          className="w-full bg-bg-elevated rounded-lg px-4 py-2.5 text-sm text-text-muted flex items-center gap-2 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {searchQuery || "Search movies, shows, friends..."}
        </div>
      </div>

      {/* Friends / Community toggle */}
      <div className="flex bg-bg-elevated rounded-lg p-1">
        <button
          onClick={() => setFeedView("friends")}
          className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors active:scale-[0.98] ${
            feedView === "friends"
              ? "bg-bg-hover text-text-primary"
              : "text-text-muted"
          }`}
        >
          Friends
        </button>
        <button
          onClick={() => setFeedView("community")}
          className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors active:scale-[0.98] ${
            feedView === "community"
              ? "bg-bg-hover text-text-primary"
              : "text-text-muted"
          }`}
        >
          Community
        </button>
      </div>

      {/* Content area */}
      {feedView === "friends" ? (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {/* Movie / Show sub-tabs */}
          <div className="flex gap-6 border-b border-bg-elevated">
            <button
              onClick={() => setContentFilter("movie")}
              className={`pb-2 text-sm font-medium transition-colors ${
                contentFilter === "movie"
                  ? "text-text-primary border-b-2 border-accent-purple"
                  : "text-text-muted"
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setContentFilter("show")}
              className={`pb-2 text-sm font-medium transition-colors ${
                contentFilter === "show"
                  ? "text-text-primary border-b-2 border-accent-purple"
                  : "text-text-muted"
              }`}
            >
              Shows
            </button>
          </div>

          {/* Feed cards */}
          <div className="flex flex-col gap-3">
            {filteredActivities.map((activity) => {
              const friend = activity.user ?? (activity.userId ? getFriend(activity.userId) : null);
              if (!friend) return null;

              return (
                <div
                  key={activity.id}
                  className="bg-bg-surface rounded-xl p-4 flex flex-col gap-3"
                >
                  {/* User row */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedFriend(friend)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 active:opacity-70 transition-opacity"
                      style={{ backgroundColor: friend.avatarColor ?? "#8B5CF6" }}
                    >
                      {(friend.displayName ?? friend.name ?? "?").charAt(0).toUpperCase()}
                    </button>
                    <button
                      onClick={() => setSelectedFriend(friend)}
                      className="flex items-center gap-1.5 min-w-0 active:opacity-70 transition-opacity"
                    >
                      <span className="text-sm font-medium text-text-primary truncate">
                        {friend.displayName ?? friend.name}
                      </span>
                      <span className="text-xs text-text-muted truncate">
                        {(friend.handle ?? friend.username ?? "")}
                      </span>
                    </button>
                    <span className="text-xs text-text-muted ml-auto shrink-0">
                      {timeAgo(activity.timestamp ?? activity.createdAt ?? "")}
                    </span>
                  </div>

                  {/* Title line */}
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-text-primary">
                      {activity.title}
                      {activity.season != null && (
                        <span className="text-text-secondary">
                          {" "}
                          S{activity.season}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Rating */}
                  <div>
                    {activity.rating != null && <RatingBadge rating={activity.rating} />}
                  </div>

                  {/* Tagged users */}
                  {activity.taggedUsers && activity.taggedUsers.length > 0 && (
                    <div className="text-sm text-text-secondary flex flex-wrap gap-x-1">
                      <span>with</span>
                      {activity.taggedUsers.map((taggedHandle, idx) => {
                        const taggedFriend = getFriendByHandle(taggedHandle);
                        return (
                          <span key={taggedHandle}>
                            <button
                              onClick={() => taggedFriend && setSelectedFriend(taggedFriend)}
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

                  {/* Reaction buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    {reactionTypes.map((reaction) => {
                      const count = getReactionCount(
                        activity.reactions,
                        reaction.key
                      );
                      const active = hasUserReacted(
                        activity.reactions,
                        reaction.key
                      );
                      const justReacted =
                        recentlyReacted === `${activity.id}-${reaction.key}`;

                      return (
                        <button
                          key={reaction.key}
                          onClick={() =>
                            handleReaction(activity.id, reaction.key)
                          }
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                            active
                              ? "bg-bg-hover text-accent-purple"
                              : "bg-bg-elevated text-text-muted"
                          } ${justReacted ? "animate-reaction-pop" : ""}`}
                        >
                          <span
                            style={
                              active ? { color: "#8B5CF6" } : undefined
                            }
                          >
                            {reaction.icon}
                          </span>
                          <span>{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {filteredActivities.length === 0 && (
              <div className="text-center text-text-muted text-sm py-8">
                {query
                  ? `No results for "${searchQuery}"`
                  : "No activity yet. Start rating to see your friends\u2019 feed!"}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {/* Movies / Shows / Seasons sub-tabs */}
          <div className="flex gap-6 border-b border-bg-elevated">
            {(["movies", "shows", "seasons"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setCommunityTab(tab);
                  setExpandedCommunityId(null);
                }}
                className={`pb-2 text-sm font-medium capitalize transition-colors ${
                  communityTab === tab
                    ? "text-text-primary border-b-2 border-accent-purple"
                    : "text-text-muted"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Community ranked list */}
          <div className="flex flex-col gap-2">
            {communityData.map((item, index) => {
              const itemTitle = item.movie?.title ?? item.show?.title ?? "";
              const itemYear = item.movie?.year ?? item.show?.year ?? 0;
              const rawGenre = item.movie?.genre ?? item.show?.genre ?? "";
              const itemGenre = Array.isArray(rawGenre) ? rawGenre[0] ?? "" : rawGenre;
              const itemId = item.movie?.id ?? item.show?.id ?? `item-${index}`;
              const itemSeason = item.season;
              return (
              <div key={itemId}>
                <div
                  onClick={() =>
                    setExpandedCommunityId(
                      expandedCommunityId === itemId ? null : itemId
                    )
                  }
                  className="bg-bg-surface rounded-lg p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
                >
                  {/* Rank */}
                  <span className="text-text-muted font-display text-sm w-6 text-center shrink-0">
                    {index + 1}
                  </span>

                  {/* Info */}
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary truncate">
                        {itemTitle}
                        {itemSeason != null && (
                          <span className="text-text-secondary">
                            {" "}
                            S{itemSeason}
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-text-muted shrink-0">
                        {itemYear}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-bg-elevated text-text-secondary rounded px-2 py-0.5">
                        {itemGenre}
                      </span>
                    </div>
                  </div>

                  {/* Rating info */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-text-muted text-xs">
                      {item.ratingCount.toLocaleString()} ratings
                    </span>
                    <RatingBadge rating={item.averageRating} size="sm" />
                  </div>
                </div>

                {/* Expanded community row */}
                {expandedCommunityId === itemId && (
                  <div className="bg-bg-elevated rounded-b-lg px-4 py-3 flex flex-col gap-3 -mt-1 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-text-secondary text-xs">Community avg</p>
                        <p
                          className="font-display font-bold text-lg"
                          style={{ color: getRatingColor(item.averageRating) }}
                        >
                          {item.averageRating.toFixed(1)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-text-secondary text-xs">Ratings</p>
                        <p className="text-text-primary font-semibold">
                          {item.ratingCount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {communityTab !== "seasons" && (
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
                              : "border-bg-hover text-text-primary"
                          }`}
                        >
                          {isOnWatchlist(itemTitle) ? "✓ Saved" : "+ Watchlist"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              );
            })}

            {communityData.length === 0 && (
              <div className="text-center text-text-muted text-sm py-8">
                {query
                  ? `No results for "${searchQuery}"`
                  : "No community data available yet."}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Friend profile sheet */}
      {selectedFriend && (
        <FriendProfileSheet
          friend={selectedFriend}
          onClose={() => setSelectedFriend(null)}
        />
      )}

      {/* Notifications sheet */}
      {showNotifications && (
        <NotificationsSheet
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}
