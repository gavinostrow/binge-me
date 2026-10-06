"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/AppContext";
import { useSocial } from "@/lib/SocialContext";
import { allMovies, allShows, getMovie, getShow } from "@/lib/catalog";
import { friendStatus, type Kind } from "@/lib/social";
import { knownExtras } from "@/lib/useTitleExtras";
import { mergeById, useLiveSearch } from "@/lib/useLiveSearch";
import type { Movie, Show } from "@/lib/types";
import PosterImage from "@/components/PosterImage";
import RatingBadge from "@/components/RatingBadge";
import ScreenHeader from "@/components/social/ScreenHeader";
import UserAvatar from "@/components/social/UserAvatar";
import { ProviderLogos } from "@/components/social/ProviderChips";

interface Candidate {
  type: Kind;
  item: Movie | Show;
  myRating?: number;
}

/** Answer a friend's "looking for something to watch" — with already-watched titles flagged. */
export default function RecRequestScreen({ requestId }: { requestId: string }) {
  const { movieRatings, showRatings, popScreen } = useApp();
  const { recRequests, getUser, sendRecToRequest, showToast, myServices } = useSocial();
  const req = recRequests.find((r) => r.id === requestId);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [note, setNote] = useState("");
  const live = useLiveSearch(query);

  const kinds: Kind[] = !req ? [] : req.kind === "any" ? ["show", "movie"] : [req.kind];

  const candidates: Candidate[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const mine: Candidate[] = [
      ...(kinds.includes("show") ? showRatings.map((r) => ({ type: "show" as const, item: r.show, myRating: r.overallRating })) : []),
      ...(kinds.includes("movie") ? movieRatings.map((r) => ({ type: "movie" as const, item: r.movie, myRating: r.rating })) : []),
    ].sort((a, b) => (b.myRating ?? 0) - (a.myRating ?? 0));
    if (!q) return mine;
    const rated = new Map(mine.map((c) => [`${c.type}:${c.item.id}`, c.myRating]));
    const pool: Candidate[] = [
      ...(kinds.includes("show") ? mergeById(allShows().filter((s) => s.title.toLowerCase().includes(q)), live.shows) : []).map(
        (item) => ({ type: "show" as const, item, myRating: rated.get(`show:${item.id}`) }),
      ),
      ...(kinds.includes("movie") ? mergeById(allMovies().filter((m) => m.title.toLowerCase().includes(q)), live.movies) : []).map(
        (item) => ({ type: "movie" as const, item, myRating: rated.get(`movie:${item.id}`) }),
      ),
    ];
    return pool;
  }, [query, kinds.join(), showRatings, movieRatings, live.shows, live.movies]); // eslint-disable-line react-hooks/exhaustive-deps

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
    sendRecToRequest(req.id, selected.type, selected.item.id, note);
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
                <span className="font-semibold">{firstName}</span> is looking for a new {req.kind === "any" ? "thing" : req.kind} to watch
              </p>
              {req.note && <p className="text-text-secondary text-sm italic mt-0.5">&ldquo;{req.note}&rdquo;</p>}
            </div>
          </div>
        )}

        {others.length > 0 && (
          <div className="bg-bg-card border border-border rounded-2xl p-3">
            <p className="text-text-muted text-[10px] font-body uppercase tracking-wider mb-2">Already suggested</p>
            {others.map((r) => {
              const it = r.type === "movie" ? getMovie(r.itemId) : getShow(r.itemId);
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
          placeholder={`Search any ${req.kind === "movie" ? "movie" : req.kind === "show" ? "show" : "title"}…`}
          className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent font-body"
        />

        <p className="text-text-muted text-xs font-body uppercase tracking-wider">
          {query ? "Results" : "Your top rated"}
        </p>

        <div className="space-y-2">
          {candidates.map((c) => {
            const status = friendStatus(req.userId, c.type, c.item.id);
            const watched = status.watched != null;
            const picked = selected?.item.id === c.item.id && selected.type === c.type;
            const providers = knownExtras(c.type, c.item).providers;
            const onMine = providers.some((p) => myServices.includes(p.key));
            return (
              <button
                key={`${c.type}:${c.item.id}`}
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
          <button onClick={send} className="w-full py-3 rounded-xl bg-accent text-white font-display font-bold transition-transform">
            Send {selected.item.title} to {firstName}
          </button>
        </div>
      )}
    </div>
  );
}
