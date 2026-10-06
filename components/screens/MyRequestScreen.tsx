"use client";
import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { useSocial } from "@/lib/SocialContext";
import { getMovie, getShow } from "@/lib/catalog";
import { knownExtras } from "@/lib/useTitleExtras";
import { timeAgo } from "@/lib/utils";
import type { RecRequest } from "@/lib/socialData";
import PosterImage from "@/components/PosterImage";
import ScreenHeader from "@/components/social/ScreenHeader";
import UserAvatar from "@/components/social/UserAvatar";
import { ProviderLogos } from "@/components/social/ProviderChips";

const VIBES = ["Something funny", "Short series", "Can't-stop-watching", "Easy background watch", "Crime / thriller", "Cry-worthy"];

/** Ask friends for a pick, then see what they send back. */
export default function MyRequestScreen() {
  const { pushScreen, addToWatchlist, isInWatchlist } = useApp();
  const { myOpenRequest, postRequest, closeMyRequest, getUser, followingIds, showToast } = useSocial();
  const [kind, setKind] = useState<RecRequest["kind"]>("show");
  const [note, setNote] = useState("");

  if (!myOpenRequest) {
    return (
      <div className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-bg-primary">
        <ScreenHeader title="Ask your friends" subtitle={`Goes to your ${followingIds.length} friends`} />
        <div className="px-4 pt-4 pb-28 space-y-5">
          <div>
            <p className="text-text-muted text-xs font-body uppercase tracking-wider mb-2">Looking for a</p>
            <div className="flex bg-bg-elevated rounded-xl p-1">
              {(["show", "movie", "any"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setKind(k)}
                  className={`flex-1 py-2 rounded-lg text-sm font-body font-semibold transition-colors ${
                    kind === k ? "bg-accent text-white" : "text-text-secondary"
                  }`}
                >
                  {k === "any" ? "Either" : k === "show" ? "Show" : "Movie"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-text-muted text-xs font-body uppercase tracking-wider mb-2">Vibe (optional)</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {VIBES.map((v) => (
                <button
                  key={v}
                  onClick={() => setNote((n) => (n === v ? "" : v))}
                  className={`px-3 py-1.5 rounded-md text-xs font-body border transition-colors ${
                    note === v ? "border-accent bg-accent/15 text-text-primary" : "border-border text-text-secondary"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 120))}
              placeholder="Anything else? e.g. just finished Severance"
              rows={2}
              className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent resize-none font-body"
            />
          </div>

          <div className="bg-bg-card border border-border rounded-2xl p-3.5 flex items-center gap-3">
            <UserAvatar user={{ id: "u1", name: "You" }} size="md" />
            <p className="text-text-secondary text-sm font-body">
              Friends will see: <span className="text-text-primary font-semibold">&ldquo;You&apos;re looking for a new {kind === "any" ? "thing" : kind} to watch&rdquo;</span>
            </p>
          </div>

          <button
            onClick={() => postRequest(kind, note)}
            className="w-full py-3.5 rounded-2xl bg-accent text-white font-display font-bold transition-transform"
          >
            Ask friends
          </button>
          <p className="text-text-muted text-xs font-body text-center">Requests close after 48 hours.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-bg-primary">
      <ScreenHeader
        title="Your picks"
        subtitle={myOpenRequest.note ? `“${myOpenRequest.note}”` : `Looking for a ${myOpenRequest.kind === "any" ? "watch" : myOpenRequest.kind}`}
      />
      <div className="px-4 pt-4 pb-28 space-y-3">
        {myOpenRequest.replies.length === 0 && (
          <div className="text-center py-12">
            <div className="w-10 h-10 mx-auto rounded-full border-2 border-accent border-t-transparent animate-spin mb-4" />
            <p className="text-text-primary font-display font-semibold">Asked your friends</p>
            <p className="text-text-secondary text-sm font-body mt-1">Picks will show up here as they come in.</p>
          </div>
        )}
        {myOpenRequest.replies.map((rep) => {
          const item = rep.type === "movie" ? getMovie(rep.itemId) : getShow(rep.itemId);
          const from = getUser(rep.fromUserId);
          if (!item || !from) return null;
          const saved = isInWatchlist(rep.type, item.id);
          return (
            <div key={rep.id} className="bg-bg-card border border-border rounded-2xl p-3 flex gap-3 animate-fadeIn">
              <PosterImage
                title={item.title}
                year={item.year}
                posterPath={item.posterPath}
                size="lg"
                className="!w-20 !h-28"
                onClick={() =>
                  pushScreen(rep.type === "movie" ? { screen: "movie-detail", movieId: item.id } : { screen: "show-detail", showId: item.id })
                }
              />
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center gap-1.5">
                  <UserAvatar user={from} size="xs" />
                  <p className="text-text-secondary text-xs font-body truncate" suppressHydrationWarning>
                    {from.name.split(" ")[0]} · {timeAgo(rep.createdAt)}
                  </p>
                </div>
                <p className="text-text-primary font-display font-bold mt-1 truncate">{item.title}</p>
                {rep.note && <p className="text-text-secondary text-xs italic mt-0.5 line-clamp-2">&ldquo;{rep.note}&rdquo;</p>}
                <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                  <ProviderLogos providers={knownExtras(rep.type, item).providers} size="sm" />
                  <button
                    disabled={saved}
                    onClick={() => {
                      addToWatchlist({
                        id: `wl_${Date.now()}`,
                        contentType: rep.type,
                        ...(rep.type === "movie" ? { movie: item as ReturnType<typeof getMovie> } : { show: item as ReturnType<typeof getShow> }),
                        addedDate: new Date().toISOString(),
                        recommendedBy: rep.fromUserId,
                      });
                      showToast("Added to your watchlist");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold ${
                      saved ? "bg-bg-elevated text-text-muted" : "bg-accent text-white"
                    }`}
                  >
                    {saved ? "On watchlist" : "+ Watchlist"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <button
          onClick={() => {
            closeMyRequest();
            showToast("Request closed");
          }}
          className="w-full py-3 rounded-2xl border border-border text-text-secondary text-sm font-body font-semibold mt-4"
        >
          Close request
        </button>
      </div>
    </div>
  );
}
