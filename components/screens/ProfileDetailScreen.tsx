"use client";
import { useMemo } from "react";
import { useApp } from "@/lib/AppContext";
import { useSocial } from "@/lib/SocialContext";
import { ratingsByUser, tasteMatch } from "@/lib/social";
import { getShow } from "@/lib/catalog";
import { knownExtras } from "@/lib/useTitleExtras";
import PosterImage from "@/components/PosterImage";
import RatingBadge from "@/components/RatingBadge";
import ScreenHeader from "@/components/social/ScreenHeader";
import UserAvatar from "@/components/social/UserAvatar";
import { ProviderLogos } from "@/components/social/ProviderChips";

export default function ProfileDetailScreen({ userId }: { userId: string }) {
  const { pushScreen, currentUserData } = useApp();
  const { getUser, myRows, watchingFor, isFollowing, follow, unfollow, showToast, recRequests } = useSocial();

  const isSelf = userId === currentUserData.id || userId === "u1";
  const user = getUser(userId);
  const rows = useMemo(() => (isSelf ? myRows : ratingsByUser(userId)), [isSelf, myRows, userId]);

  if (!user) return <div className="p-4">User not found</div>;

  const watching = watchingFor(userId);
  const match = isSelf ? null : tasteMatch(myRows, userId);
  const following = isFollowing(userId);
  const openRequest = recRequests.find((r) => r.userId === userId && new Date(r.expiresAt).getTime() > Date.now());
  const list = [...rows].sort((a, b) => b.rating - a.rating);
  const avg = rows.length ? (rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(1) : "—";

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-bg-primary">
      <ScreenHeader title={user.name} subtitle={`@${user.username}`} />

      <div className="px-4 pb-28 space-y-4">
        <div className="pt-5 flex items-center gap-4">
          <UserAvatar user={user} size="lg" />
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-bold text-text-primary truncate">{user.name}</h1>
            <p className="text-text-secondary text-sm">@{user.username}</p>
            {user.bio && <p className="text-text-secondary text-sm mt-1">{user.bio}</p>}
          </div>
        </div>

        {isSelf ? (
          <button
            onClick={() => pushScreen({ screen: "profile-edit" })}
            className="w-full py-2.5 rounded-xl bg-bg-card border border-border text-text-primary text-sm font-body font-semibold"
          >
            Edit profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (following) unfollow(userId);
                else {
                  follow(userId);
                  showToast(`Added ${user.name.split(" ")[0]}`);
                }
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-body font-semibold ${
                following ? "bg-bg-card border border-border text-text-primary" : "bg-accent text-bg-primary"
              }`}
            >
              {following ? "Friends ✓" : "Add friend"}
            </button>
            {openRequest && (
              <button
                onClick={() => pushScreen({ screen: "rec-request", requestId: openRequest.id })}
                className="flex-1 py-2.5 rounded-xl bg-accent text-bg-primary text-sm font-body font-semibold"
              >
                Send a pick
              </button>
            )}
          </div>
        )}

        {match && (
          <div className="bg-bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgb(var(--border))" strokeWidth="3.5" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="rgb(var(--text-primary))"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={`${(match.pct / 100) * 97.4} 97.4`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-text-primary">
                {match.pct}%
              </span>
            </div>
            <div>
              <p className="text-text-primary font-display font-bold">Taste match</p>
              <p className="text-text-secondary text-xs font-body mt-0.5">
                {match.overlap >= 3
                  ? `Based on ${match.overlap} titles you've both rated`
                  : match.overlap > 0
                    ? `Only ${match.overlap} title${match.overlap === 1 ? "" : "s"} in common so far — rate more to sharpen it`
                    : "Rate a few of the same titles to see a real match"}
              </p>
            </div>
          </div>
        )}

        {watching.length > 0 && (
          <div className="border-t border-text-primary pt-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-rating-green animate-pulse" />
              <p className="text-text-primary text-xs font-body uppercase font-bold tracking-[0.08em]">Currently watching</p>
            </div>
            <div className="divide-y divide-border">
              {watching.map((w) => {
                const show = getShow(w.showId);
                if (!show) return null;
                return (
                  <button
                    key={w.showId}
                    onClick={() => pushScreen({ screen: "show-detail", showId: show.id })}
                    className="w-full flex items-center gap-3 py-2 text-left"
                  >
                    <PosterImage title={show.title} year={show.year} posterPath={show.posterPath} size="sm" />
                    <p className="flex-1 min-w-0 text-text-primary text-sm font-display font-semibold truncate">
                      {show.title} <span className="text-text-secondary font-body font-normal">· Season {w.season}</span>
                    </p>
                    <ProviderLogos providers={knownExtras(show).providers} max={1} size="sm" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Shows", value: rows.length },
            { label: "Seasons", value: rows.reduce((n, r) => n + Math.max(1, r.seasons?.length ?? 1), 0) },
            { label: "Avg", value: avg },
          ].map((s) => (
            <div key={s.label} className="bg-bg-card border border-border rounded-xl p-3 text-center">
              <p className="text-text-primary text-[10px] uppercase font-bold tracking-[0.08em] font-body">{s.label}</p>
              <p className="text-xl font-display font-bold text-text-primary mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="text-text-primary text-xs font-body uppercase font-bold tracking-[0.08em] mb-2">Ranked shows</p>
          {list.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-6">Nothing rated yet.</p>
          ) : (
            <div className="space-y-2">
              {list.map((r, i) => {
                const item = getShow(r.id);
                if (!item) return null;
                return (
                  <button
                    key={r.id}
                    onClick={() =>
                      pushScreen({ screen: "show-detail", showId: r.id })
                    }
                    className="w-full bg-bg-card border border-border rounded-xl p-2.5 flex items-center gap-3 text-left active:bg-bg-elevated"
                  >
                    <span className="w-5 text-center text-text-muted text-xs font-display font-bold">{i + 1}</span>
                    <PosterImage title={item.title} year={item.year} posterPath={item.posterPath} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-display font-semibold truncate">{item.title}</p>
                      {r.review && <p className="text-text-secondary text-xs italic font-display truncate">&ldquo;{r.review}&rdquo;</p>}
                    </div>
                    <RatingBadge rating={r.rating} size="sm" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
