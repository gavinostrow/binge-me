"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { ContentType, FeedView, CommunityItem } from "@/lib/types";
import {
  communityMovies,
  communityShows,
  communitySeasons,
  friends,
  tasteMatchPercentages,
} from "@/lib/mockData";
import { timeAgo, getRatingColor } from "@/lib/utils";
import RatingBadge from "@/components/RatingBadge";

const reactionTypes = [
  { key: "fire", icon: "★", label: "Fire" },
  { key: "agree", icon: "✓", label: "Agree" },
  { key: "disagree", icon: "✗", label: "Nah" },
  { key: "mustwatch", icon: "◉", label: "Must Watch" },
] as const;

type ReactionType = (typeof reactionTypes)[number]["key"];

export default function FeedTab() {
  const { feedActivities, toggleReaction } = useApp();

  const [feedView, setFeedView] = useState<FeedView>("friends");
  const [contentFilter, setContentFilter] = useState<ContentType>("movie");
  const [communityTab, setCommunityTab] = useState<
    "movies" | "shows" | "seasons"
  >("movies");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredActivities = feedActivities.filter((activity) => {
    if (contentFilter === "movie") return activity.type === "movie_rating";
    return activity.type === "show_rating";
  });

  const communityData: CommunityItem[] =
    communityTab === "movies"
      ? communityMovies
      : communityTab === "shows"
        ? communityShows
        : communitySeasons;

  const getFriend = (userId: string) => friends.find((f) => f.id === userId);

  const getReactionCount = (
    reactions: Record<string, string[]> | { userId: string; type: string }[],
    type: string
  ) => {
    if (Array.isArray(reactions)) return reactions.filter((r: { userId: string; type: string }) => r.type === type).length;
    return (reactions[type] ?? []).length;
  };

  const hasUserReacted = (
    reactions: Record<string, string[]> | { userId: string; type: string }[],
    type: string
  ) => {
    if (Array.isArray(reactions)) return reactions.some((r: { userId: string; type: string }) => r.userId === "u1" && r.type === type);
    return (reactions[type] ?? []).includes("u1");
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Header */}
      <div className="pt-4 px-1">
        <h1 className="text-2xl font-bold lowercase font-display text-text-primary">
          binge
        </h1>
      </div>

      {/* Search bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search friends, movies, shows..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-bg-elevated text-text-primary placeholder-text-muted rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent-purple"
        />
      </div>

      {/* Friends / Community toggle */}
      <div className="flex bg-bg-elevated rounded-lg p-1">
        <button
          onClick={() => setFeedView("friends")}
          className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
            feedView === "friends"
              ? "bg-bg-hover text-text-primary"
              : "text-text-muted"
          }`}
        >
          Friends
        </button>
        <button
          onClick={() => setFeedView("community")}
          className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
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
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: friend.avatarColor ?? "#7C5CF6" }}
                    >
                      {(friend.displayName ?? friend.name).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm font-medium text-text-primary truncate">
                        {friend.displayName ?? friend.name}
                      </span>
                      <span className="text-xs text-text-muted truncate">
                        @{(friend as { handle?: string }).handle ?? friend.username}
                      </span>
                    </div>
                    <span className="text-xs text-text-muted ml-auto shrink-0" suppressHydrationWarning>
                      {timeAgo(activity.timestamp ?? activity.createdAt ?? "")}
                    </span>
                  </div>

                  {/* Title line */}
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-text-primary">
                      {activity.movie?.title ?? activity.show?.title ?? activity.title}
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
                    <div className="text-sm text-text-secondary">
                      <span>with </span>
                      {activity.taggedUsers.map((taggedId, idx) => {
                        const taggedFriend = getFriend(taggedId);
                        return (
                          <span key={taggedId}>
                            <span className="text-accent-purple">
                              {taggedFriend ? `@${(taggedFriend as { handle?: string }).handle ?? taggedFriend.username}` : taggedId}
                            </span>
                            {idx < activity.taggedUsers!.length - 1 && ", "}
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

                      return (
                        <button
                          key={reaction.key}
                          onClick={() =>
                            toggleReaction(
                              activity.id,
                              reaction.key
                            )
                          }
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                            active
                              ? "bg-bg-hover text-accent-purple"
                              : "bg-bg-elevated text-text-muted"
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
            })}

            {filteredActivities.length === 0 && (
              <div className="text-center text-text-muted text-sm py-8">
                No activity yet. Start rating to see your friends&apos; feed!
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
                onClick={() => setCommunityTab(tab)}
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
            {communityData.map((item, index) => (
              <div
                key={item.id}
                className="bg-bg-surface rounded-lg p-3 flex items-center gap-3"
              >
                {/* Rank */}
                <span className="text-text-muted font-display text-sm w-6 text-center shrink-0">
                  {index + 1}
                </span>

                {/* Info */}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary truncate">
                      {item.movie?.title ?? item.show?.title}
                      {item.season != null && (
                        <span className="text-text-secondary">
                          {" "}
                          S{item.season}
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-text-muted shrink-0">
                      {item.movie?.year ?? item.show?.year}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-bg-elevated text-text-secondary rounded px-2 py-0.5">
                      {(item.movie?.genre ?? item.show?.genre ?? [])[0]}
                    </span>
                  </div>
                </div>

                {/* Rating info */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-text-muted text-xs">
                    {item.ratingCount} ratings
                  </span>
                  <RatingBadge rating={item.averageRating} size="sm" />
                </div>
              </div>
            ))}

            {communityData.length === 0 && (
              <div className="text-center text-text-muted text-sm py-8">
                No community data available yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
