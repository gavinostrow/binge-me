"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/AppContext";
import { useSocial } from "@/lib/SocialContext";
import { allShows, getShow } from "@/lib/catalog";
import { friendStatus } from "@/lib/social";
import { knownExtras } from "@/lib/useTitleExtras";
import { mergeById, useLiveSearch } from "@/lib/useLiveSearch";
import type { Show } from "@/lib/types";
import PosterImage from "@/components/PosterImage";
import RatingBadge from "@/components/RatingBadge";
import ScreenHeader from "@/components/social/ScreenHeader";
import UserAvatar from "@/components/social/UserAvatar";
import { ProviderLogos } from "@/components/social/ProviderChips";

interface Candidate {
  item: Show;
  myRating?: number;
}

/** Answer a friend's "looking for something to watch" — with already-watched titles flagged. */
export default function RecRequestScreen({ requestId }: { requestId: string }) {
  const { showRatings, popScreen } = useApp();
  const { recRequests, getUser, sendRecToRequest, showToast, myServices } = useSocial();
  const req = recRequests.find((r) => r.id === requestId);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [note, setNote] = useState("");
  const live = useLiveSearch(query);

  const candidates: Candidate[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const mine: Candidate[] = showRatings
      .map((r) => ({ item: r.show, myRating: r.overallRating }))
      .sort((a, b) => (b.myRating ?? 0) - (a.myRating ?? 0));
    if (!q) return mine;
    const rated = new Map(mine.map((c) => [c.item.id, c.myRating]));
    return mergeById(allShows().filter((s) => s.title.toLowerCase().includes(q)), live.shows).map((item) => ({
      item,
      myRating: rated.get(item.id),
    }));
  }, [query, showRatings, live.shows]);

  if (!req) {
    return (
      <div className="flex flex-col h-full bg-bg-primary">
        <ScreenHeader title="Request closed" />
        <p className="text-text-secondary text-sm text-center py-16 px-6">This request has expired or was closed.</p>
      </div>
    );
  }

  const asker = getUser(req.userId);
  const firstName = asker?.name.split(" ")[0] ?? "Your friend";
  const others = req.replies.filter((r) => r.fromUserId !== "u1");

  const send = () => {
    if (!selected) return;
    sendRecToRequest(req.id, selected.item.id, note);
    showToast(`Sent ${selected.item.title} to ${firstName}`);
    popScreen();
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-bg-primary">
      <ScreenHeader title={`Recommend to ${firstName}`} />
      <div className="px-4 pt-4 pb-40 space-y-4">
        {asker && (
          <div className="flex items-start gap-3">
            <UserAvatar user={asker} size="md" />
            <div>
              <p className="text-text-primary text-sm font-body">
                <span className="font-semibold">{firstName}</span> is looking for a new show to watch
              </p>
              {req.note && <p className="text-text-secondary text-sm italic font-display mt-0.5">&ldquo;{req.note}&rdquo;</p>}
            </div>
          </div>
        )}

        {others.length > 0 && (
          <div className="border-t border-text-primary pt-3">
            <p className="text-text-primary text-[10px] font-body uppercase font-bold tracking-[0.08em] mb-2">Already suggested</p>
            {others.map((r) => {
              const it = getShow(r.itemId);
              const u = getUser(r.fromUserId);
              return it && u ? (
                <p key={r.id} className="text-text-secondary text-xs font-body py-0.5">
                  <span className="text-text-primary font-semibold">{u.name.split(" ")[0]}</span> → {it.title}
                </p>
              ) : null;
            })}
          </div>
        )}

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any show…"
          className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent font-body"
        />

        <p className="text-text-primary text-xs font-body uppercase font-bold tracking-[0.08em]">
          {query ? "Results" : "Your top rated"}
        </p>

        <div className="space-y-2">
          {candidates.map((c) => {
            const status = friendStatus(req.userId, c.item.id);
            const watched = status.watched != null;
            const picked = selected?.item.id === c.item.id;
            const providers = knownExtras(c.item).providers;
            const onMine = providers.some((p) => myServices.includes(p.key));
            return (
              <button
                key={c.item.id}
                disabled={watched}
                onClick={() => setSelected(picked ? null : c)}
                className={`w-full rounded-2xl p-2.5 flex items-center gap-3 text-left border transition-colors ${
                  watched
                    ? "opacity-45 border-border bg-bg-card"
                    : picked
                      ? "border-accent bg-accent/10"
                      : "border-border bg-bg-card active:bg-bg-elevated"
                }`}
              >
                <PosterImage title={c.item.title} year={c.item.year} posterPath={c.item.posterPath} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-display font-semibold truncate">{c.item.title}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <ProviderLogos providers={providers} max={2} size="sm" />
                    {watched ? (
                      <span className="text-[11px] font-body font-semibold text-text-secondary">
                        Already watched · {firstName} gave it {status.watched!.toFixed(1)}
                      </span>
                    ) : status.onWatchlist ? (
                      <span className="text-[11px] font-body font-semibold text-accent-gold">On {firstName}&apos;s watchlist</span>
                    ) : onMine ? null : providers.length === 0 ? (
                      <span className="text-[11px] font-body text-text-muted">Not streaming</span>
                    ) : null}
                  </div>
                </div>
                {c.myRating != null && <RatingBadge rating={c.myRating} size="sm" />}
                <span
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${picked ? "border-accent bg-accent" : "border-text-muted"}`}
                  aria-hidden
                />
              </button>
            );
          })}
          {candidates.length === 0 && <p className="text-text-muted text-sm text-center py-8">No matches.</p>}
        </div>
      </div>

      {selected && (
        <div className="fixed bottom-16 left-0 right-0 z-[55] max-w-app mx-auto bg-bg-primary/95 backdrop-blur-md border-t border-border p-4 space-y-2 animate-fadeIn">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 100))}
            placeholder="Add a note (optional) — e.g. trust me on this"
            className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent font-body"
          />
          <button onClick={send} className="w-full py-3 rounded-xl bg-accent text-bg-primary font-body font-semibold transition-transform">
            Send {selected.item.title} to {firstName}
          </button>
        </div>
      )}
    </div>
  );
}
