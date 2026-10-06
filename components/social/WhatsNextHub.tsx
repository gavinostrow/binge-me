"use client";
import { useApp } from "@/lib/AppContext";
import { useSocial } from "@/lib/SocialContext";
import { useComingBack } from "@/lib/useComingBack";
import { nextSeasonLabel } from "@/lib/showExtras";
import { timeAgo } from "@/lib/utils";
import PosterImage from "@/components/PosterImage";
import UserAvatar from "./UserAvatar";

/** Top of What's Next: ask friends, answer friends, and what's coming back. */
export default function WhatsNextHub() {
  const { pushScreen } = useApp();
  const { myOpenRequest, openFriendRequests, getUser } = useSocial();
  const comingBack = useComingBack();

  return (
    <div className="space-y-4 pb-2">
      {/* Ask friends */}
      <div className="px-4">
        <button
          onClick={() => pushScreen({ screen: "my-request" })}
          className="w-full rounded-2xl p-4 text-left bg-bg-card border border-border transition-transform"
        >
          {myOpenRequest ? (
            <>
              <p className="text-text-primary font-display font-bold">Your friends are on it</p>
              <p className="text-text-secondary text-sm font-body mt-0.5">
                {myOpenRequest.replies.length === 0
                  ? "Waiting for picks…"
                  : `${myOpenRequest.replies.length} pick${myOpenRequest.replies.length === 1 ? "" : "s"} in — tap to see`}
              </p>
            </>
          ) : (
            <>
              <p className="text-text-primary font-display font-bold">Looking for something to watch?</p>
              <p className="text-text-secondary text-sm font-body mt-0.5">Ask your friends and they&apos;ll send you picks</p>
            </>
          )}
        </button>
      </div>

      {/* Friends who are asking */}
      {openFriendRequests.length > 0 && (
        <div className="px-4 space-y-2">
          {openFriendRequests.map((req) => {
            const u = getUser(req.userId);
            if (!u) return null;
            const answered = req.replies.some((r) => r.fromUserId === "u1");
            return (
              <div key={req.id} className="bg-bg-card border border-border rounded-2xl p-3.5 flex items-center gap-3">
                <UserAvatar user={u} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-body leading-snug">
                    <span className="font-semibold">{u.name.split(" ")[0]}</span> is looking for a new{" "}
                    show to watch
                  </p>
                  <p className="text-text-muted text-xs font-body truncate" suppressHydrationWarning>
                    {req.note ? `“${req.note}” · ` : ""}
                    {timeAgo(req.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => pushScreen({ screen: "rec-request", requestId: req.id })}
                  className={`px-3 py-2 rounded-xl text-xs font-body font-semibold flex-shrink-0 ${
                    answered ? "bg-bg-elevated text-text-secondary" : "bg-accent text-bg-primary"
                  }`}
                >
                  {answered ? "Sent ✓" : "Recommend"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Coming back */}
      {comingBack.length > 0 && (
        <div>
          <div className="px-4 flex items-center justify-between mb-2">
            <p className="text-text-primary text-xs font-body uppercase font-bold tracking-[0.08em]">Coming back</p>
            <button onClick={() => pushScreen({ screen: "coming-back" })} className="text-accent-light text-xs font-body font-semibold">
              See all
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-1">
            {comingBack.slice(0, 8).map(({ show, next }) => {
              const label = nextSeasonLabel(next);
              const short =
                next.kind === "date"
                  ? new Date(next.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : next.kind === "airing"
                    ? "Airing now"
                    : "Renewed";
              return (
                <button
                  key={show.id}
                  onClick={() => pushScreen({ screen: "show-detail", showId: show.id })}
                  className="flex-shrink-0 w-24 text-left active:opacity-75"
                  aria-label={`${show.title}: ${label.title}`}
                >
                  <PosterImage title={show.title} year={show.year} posterPath={show.posterPath} size="md" className="w-24 h-36 rounded-xl" />
                  <p className="text-text-primary text-xs font-display font-semibold mt-1.5 truncate">{show.title}</p>
                  <p className={`text-[10px] font-body font-semibold ${next.kind === "renewed" ? "text-accent-gold" : "text-rating-green"}`}>
                    {next.kind === "renewed" ? short : `S${"season" in next ? next.season : ""} · ${short}`}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
