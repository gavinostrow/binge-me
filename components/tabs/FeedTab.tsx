"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { FeedView, CommunityItem } from "@/lib/types";
import {
  communityShows,
  communitySeasons,
  friends,
  tasteMatchPercentages,
} from "@/lib/mockData";
import { timeAgo, getRatingColor } from "@/lib/utils";
import RatingBadge from "@/components/RatingBadge";
import { useSocial } from "@/lib/SocialContext";
import SpoilerText from "@/components/social/SpoilerText";
import UserAvatar from "@/components/social/UserAvatar";
import type { FeedActivity } from "@/lib/types";

const reactionTypes = [
  { key: "fire", icon: "★", label: "Fire" },
  { key: "agree", icon: "✓", label: "Agree" },
  { key: "disagree", icon: "✗", label: "Nah" },
  { key: "mustwatch", icon: "◉", label: "Must Watch" },
] as const;

type ReactionType = (typeof reactionTypes)[number]["key"];

export default function FeedTab() {
  const { feedActivities, toggleReaction, notifications, pushScreen, getMyShowRating } = useApp();
  const { openFriendRequests, getUser, spoilerShield, myWatching } = useSocial();
  const unseen = notifications.filter((n) => !n.seen).length;

  // Spoiler shield: hide show reviews for seasons you haven't finished.
  const spoilerReason = (a: FeedActivity): string | null => {
    if (!spoilerShield || !a.show || a.type !== "show_rating") return null;
    const mine = getMyShowRating(a.show.id);
    const watching = myWatching.find((w) => w.showId === a.show!.id);
    if (!mine && !watching) return "you haven't watched it";
    if (a.season != null) {
      const ratedSeason = mine?.seasonRatings.some((r) => r.season === a.season);
      const behind = watching ? watching.season <= a.season : false;
      if (!ratedSeason && (behind || !mine)) return `you're not done with S${a.season}`;
    }
    return null;
  };

  const [feedView, setFeedView] = useState<FeedView>("friends");
  const [communityTab, setCommunityTab] = useState<"shows" | "seasons">("shows");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredActivities = feedActivities.filter((activity) => activity.type === "show_rating");

  const communityData: CommunityItem[] = communityTab === "shows" ? communityShows : communitySeasons;

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
    <div className="flex flex-col gap-4 pb-24 px-4">
      {/* Header */}
      <div className="pt-4 px-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold lowercase font-display text-text-primary">
          binge
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => pushScreen({ screen: "find-friends" })}
            aria-label="Find friends"
            className="w-9 h-9 flex items-center justify-center text-text-secondary active:text-text-primary"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </button>
          <button
            onClick={() => pushScreen({ screen: "notifications" })}
            aria-label={unseen ? `Notifications, ${unseen} new` : "Notifications"}
            className="relative w-9 h-9 flex items-center justify-center text-text-secondary active:text-text-primary"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unseen > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-md bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                {unseen}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search friends and shows..."
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
          {/* Friends looking for something to watch */}
          {openFriendRequests.map((req) => {
            const u = getUser(req.userId);
            if (!u) return null;
            const answered = req.replies.some((r) => r.fromUserId === "u1");
            return (
              <button
                key={req.id}
                onClick={() => pushScreen({ screen: "rec-request", requestId: req.id })}
                className="w-full bg-bg-card border border-border rounded-xl p-3.5 flex items-center gap-3 text-left transition-transform"
              >
                <UserAvatar user={u} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-body leading-snug">
                    <span className="font-semibold">{u.name.split(" ")[0]}</span> is looking for a new show to watch
                  </p>
                  {req.note && <p className="text-text-muted text-xs truncate">&ldquo;{req.note}&rdquo;</p>}
                </div>
                <span className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold flex-shrink-0 ${answered ? "bg-bg-elevated text-text-secondary" : "bg-accent text-white"}`}>
                  {answered ? "Sent ✓" : "Recommend"}
                </span>
              </button>
            );
          })}

          {/* Feed cards */}
          <div className="flex flex-col gap-3">
            {filteredActivities.map((activity) => {
              const friend = activity.user ?? (activity.userId ? getFriend(activity.userId) : null);
              if (!friend) return null;

              return (
                <div
                  key={activity.id}
                  className="bg-bg-card border border-border rounded-xl p-4 flex flex-col gap-3"
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
                      {activity.show?.title ?? activity.title}
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

                  {/* Review (spoiler-shielded for unfinished seasons) */}
                  {activity.review && (
                    <SpoilerText
                      text={activity.review}
                      hidden={spoilerReason(activity) !== null}
                      reason={spoilerReason(activity) ?? ""}
                    />
                  )}

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
          {/* Shows / Seasons sub-tabs */}
          <div className="flex gap-6 border-b border-bg-elevated">
            {(["shows", "seasons"] as const).map((tab) => (
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
                      {item.show?.title}
                      {item.season != null && (
                        <span className="text-text-secondary">
                          {" "}
                          S{item.season}
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-text-muted shrink-0">
                      {item.show?.year}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-bg-elevated text-text-secondary rounded px-2 py-0.5">
                      {(item.show?.genre ?? [])[0]}
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
