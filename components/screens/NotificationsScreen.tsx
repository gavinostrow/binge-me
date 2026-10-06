"use client";
import { useEffect } from "react";
import { useApp } from "@/lib/AppContext";
import { useSocial } from "@/lib/SocialContext";
import { timeAgo } from "@/lib/utils";
import type { Notification } from "@/lib/types";
import PosterImage from "@/components/PosterImage";
import ScreenHeader from "@/components/social/ScreenHeader";
import UserAvatar from "@/components/social/UserAvatar";

function describe(n: Notification): { lead?: string; text: string } {
  const who = n.fromUser?.name.split(" ")[0];
  const title = n.show?.title ?? n.movie?.title;
  switch (n.type) {
    case "rec_request":
      return { lead: who, text: "is looking for a new show to watch. Send a pick?" };
    case "rec_reply":
      return { lead: who, text: `sent you a pick${n.message ? `: “${n.message}”` : ""}` };
    case "recommendation":
      return { lead: who, text: `recommended ${title}${n.message ? ` — “${n.message}”` : ""}` };
    case "return_date":
      return { lead: title, text: n.message ?? "has a new season on the way" };
    case "started_watching":
      return { lead: who, text: `started watching ${title}${n.season ? ` · Season ${n.season}` : ""}` };
    case "prediction":
      return { lead: who, text: n.message ?? "made a prediction" };
    case "follow":
      return { lead: who, text: "added you as a friend" };
    case "comment":
      return { lead: who, text: n.message ? `commented: “${n.message}”` : "commented on your rating" };
    case "reaction":
      return { lead: who, text: "reacted to your rating" };
    default:
      return { text: n.message ?? "" };
  }
}

export default function NotificationsScreen() {
  const { notifications, markNotificationSeen, pushScreen } = useApp();
  const { recRequests } = useSocial();

  // Opening the list marks everything as seen (after a beat, so new ones still stand out).
  useEffect(() => {
    const t = setTimeout(() => notifications.filter((n) => !n.seen).forEach((n) => markNotificationSeen(n.id)), 1500);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.timestamp ?? b.createdAt ?? 0).getTime() - new Date(a.timestamp ?? a.createdAt ?? 0).getTime(),
  );

  const open = (n: Notification) => {
    markNotificationSeen(n.id);
    if (n.type === "rec_request" && n.requestId && recRequests.some((r) => r.id === n.requestId)) {
      pushScreen({ screen: "rec-request", requestId: n.requestId });
    } else if (n.type === "rec_reply") {
      pushScreen({ screen: "my-request" });
    } else if (n.show) {
      pushScreen({ screen: "show-detail", showId: n.show.id });
    } else if (n.movie) {
      pushScreen({ screen: "movie-detail", movieId: n.movie.id });
    } else if (n.fromUserId) {
      pushScreen({ screen: "profile", userId: n.fromUserId });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-bg-primary">
      <ScreenHeader title="Notifications" />
      <div className="pb-28">
        {sorted.length === 0 && <p className="text-text-secondary text-sm text-center py-16">You&apos;re all caught up.</p>}
        {sorted.map((n) => {
          const d = describe(n);
          const title = n.show ?? n.movie;
          return (
            <button
              key={n.id}
              onClick={() => open(n)}
              className={`w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-border active:bg-bg-elevated transition-colors ${
                n.seen ? "" : "bg-accent/5"
              }`}
            >
              {n.fromUser ? (
                <UserAvatar user={n.fromUser} size="md" />
              ) : (
                <span className="w-10 h-10 rounded-full bg-rating-green/15 text-rating-green flex items-center justify-center flex-shrink-0 font-display font-black">
                  ↻
                </span>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-text-secondary text-sm font-body leading-snug">
                  {d.lead && <span className="text-text-primary font-semibold">{d.lead} </span>}
                  {d.text}
                </p>
                <p className="text-text-muted text-xs font-body mt-1" suppressHydrationWarning>
                  {timeAgo(n.timestamp ?? n.createdAt ?? "")}
                </p>
                {n.type === "rec_request" && (
                  <span className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-display font-bold">Recommend</span>
                )}
              </div>
              {title && <PosterImage title={title.title} year={title.year} posterPath={title.posterPath} size="sm" />}
              {!n.seen && <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" aria-label="New" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
