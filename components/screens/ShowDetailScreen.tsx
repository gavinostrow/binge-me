"use client";
import { useApp } from "@/lib/AppContext";
import { communitySeasons } from "@/lib/mockData";
import { allShows, getShow } from "@/lib/catalog";
import { useSocial } from "@/lib/SocialContext";
import { useTitleExtras } from "@/lib/useTitleExtras";
import PosterImage from "@/components/PosterImage";
import RatingBadge from "@/components/RatingBadge";
import UserAvatar from "@/components/social/UserAvatar";
import NextSeasonCard from "@/components/social/NextSeasonCard";
import WhereToWatch from "@/components/social/ProviderChips";
import RatingsTrio from "@/components/social/RatingsTrio";
import AlsoLikedRow from "@/components/social/AlsoLikedRow";
import WatchingControl from "@/components/social/WatchingControl";
import { useMemo, useState } from "react";

export default function ShowDetailScreen({ showId }: { showId: string }) {
  const {
    setActiveTab,
    pushScreen,
    popScreen,
    watchlist,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    getMyShowRating,
  } = useApp();
  const { followingIds, watchingFor, getUser, questions } = useSocial();
  const [scrolled, setScrolled] = useState(false);

  const show = getShow(showId);
  const extras = useTitleExtras("show", show);

  // Fallback for "also liked": TMDB's similar shows, else same-genre shows.
  const similarShows = useMemo(() => {
    if (!show) return [];
    if (extras.similar && extras.similar.length > 0) return extras.similar;
    return allShows()
      .filter((s) => s.id !== showId && s.genre.some((g) => show.genre.includes(g)))
      .sort(
        (a, b) =>
          b.genre.filter((g) => show.genre.includes(g)).length -
          a.genre.filter((g) => show.genre.includes(g)).length,
      )
      .slice(0, 8);
  }, [show, showId, extras.similar]);

  if (!show) return <div className="p-4">Show not found</div>;

  const myRating = getMyShowRating(showId);
  const inWatchlist = isInWatchlist("show", showId);
  const seasonCommunityRatings = communitySeasons.filter(
    (c) => c.show?.id === showId,
  );
  const openPredictions = questions.filter(
    (q) => q.showId === showId && new Date(q.locksAt).getTime() > Date.now(),
  );

  // Friends currently watching this show (show + season)
  const watchingNow = followingIds
    .flatMap((id) => watchingFor(id))
    .filter((w) => w.showId === showId);

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      const item = watchlist.find((w) => w.show?.id === showId);
      if (item) removeFromWatchlist(item.id);
    } else {
      addToWatchlist({
        id: `wl_${Date.now()}`,
        contentType: "show",
        show,
        addedDate: new Date().toISOString(),
      });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrolled(e.currentTarget.scrollTop > 80);
  };

  const handleActorSearch = (actor: string) => {
    pushScreen({ screen: "search", query: actor });
  };

  return (
    <div
      className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-bg-primary"
      onScroll={handleScroll}
    >
      {/* Sticky condensed header — appears on scroll */}
      {scrolled && (
        <div className="sticky top-0 z-20 bg-bg-primary/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3 animate-fadeIn">
          <button
            onClick={popScreen}
            className="w-8 h-8 rounded-full bg-bg-card border border-border flex items-center justify-center flex-shrink-0 transition-all"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2 className="font-display text-base text-text-primary font-bold flex-1 truncate">
            {show.title}
          </h2>
          {myRating && (
            <RatingBadge rating={myRating.overallRating} size="sm" />
          )}
        </div>
      )}

      {/* Hero poster */}
      <div className="relative">
        <PosterImage
          title={show.title}
          year={show.year}
          posterPath={show.posterPath}
          size="xl"
          className="w-full aspect-[2/3] object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/30 to-transparent" />

        {/* Back button */}
        <button
          onClick={popScreen}
          aria-label="Back"
          className="absolute top-4 left-4 z-10 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth={2.5}
            strokeLinecap="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Watchlist button on poster */}
        <button
          onClick={handleWatchlistToggle}
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={inWatchlist ? "white" : "none"}
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        {/* Title block overlaying bottom of poster */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <h1 className="font-display text-3xl font-bold text-white leading-tight drop-shadow-lg">
            {show.title}
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-white/70 text-sm font-body">{show.year}</span>
            {show.seasons && (
              <>
                <span className="text-white/40 text-xs">·</span>
                <span className="text-white/70 text-sm font-body">
                  {show.seasons} season{show.seasons !== 1 ? "s" : ""}
                </span>
              </>
            )}
            {show.network && (
              <>
                <span className="text-white/40 text-xs">·</span>
                <span className="text-white/70 text-sm font-body">
                  {show.network}
                </span>
              </>
            )}
            {show.status && (
              <span
                className={`text-xs px-2 py-0.5 rounded-md font-semibold backdrop-blur-sm ${
                  show.status === "ongoing"
                    ? "bg-green-500/20 text-green-300 border border-green-400/30"
                    : "bg-white/15 text-white/70 border border-white/20"
                }`}
              >
                {show.status === "ongoing" ? "Ongoing" : "Ended"}
              </span>
            )}
          </div>
          {/* Genre chips */}
          <div className="flex gap-2 mt-2 flex-wrap">
            {show.genre.map((g) => (
              <span
                key={g}
                className="px-2.5 py-1 rounded-md text-xs font-body font-semibold bg-white/15 backdrop-blur-sm text-white border border-white/20"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pb-28 space-y-5 -mt-1">
        {/* Rate / Edit CTA */}
        {myRating ? (
          <div className="bg-bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-text-muted text-xs font-body uppercase tracking-wider">
                  Your Rating
                </p>
                {myRating.review && (
                  <p className="text-text-secondary text-sm mt-1 italic line-clamp-2">
                    "{myRating.review}"
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                <RatingBadge rating={myRating.overallRating} size="lg" />
                <button
                  onClick={() => setActiveTab("add")}
                  className="text-accent text-sm font-body font-semibold"
                >
                  Edit
                </button>
              </div>
            </div>
            {/* Season ratings mini-grid */}
            {myRating.seasonRatings && myRating.seasonRatings.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-text-muted text-[10px] font-body uppercase tracking-wider mb-2">
                  Season Ratings
                </p>
                <div className="flex gap-2 flex-wrap">
                  {myRating.seasonRatings.map((sr) => (
                    <div
                      key={sr.season}
                      className="bg-bg-elevated rounded-lg px-2.5 py-1.5 flex items-center gap-1.5"
                    >
                      <span className="text-text-muted text-[10px] font-body">
                        S{sr.season}
                      </span>
                      <RatingBadge rating={sr.rating} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setActiveTab("add")}
            className="w-full py-3.5 bg-accent text-white font-display font-bold text-base rounded-2xl transition-all"
          >
            Rate This Show
          </button>
        )}

        <WatchingControl show={show} />

        <RatingsTrio type="show" id={show.id} myRating={myRating?.overallRating} />

        <NextSeasonCard next={extras.next} />

        <WhereToWatch providers={extras.providers} source={extras.source} />

        {/* Friends watching now */}
        {watchingNow.length > 0 && (
          <div className="bg-bg-card rounded-2xl p-4 border border-border">
            <p className="text-text-muted text-xs font-body uppercase tracking-wider mb-3">
              Friends watching now
            </p>
            <div className="flex gap-2 flex-wrap">
              {watchingNow.map((w) => {
                const u = getUser(w.userId);
                if (!u) return null;
                return (
                  <button
                    key={w.userId}
                    onClick={() => pushScreen({ screen: "profile", userId: w.userId })}
                    className="flex items-center gap-2 bg-bg-elevated rounded-xl px-3 py-2 active:opacity-80 transition-opacity"
                  >
                    <UserAvatar user={u} size="sm" />
                    <div className="text-left">
                      <p className="text-text-primary text-xs font-display font-semibold">{u.name.split(" ")[0]}</p>
                      <p className="text-text-muted text-[10px] font-body">Season {w.season}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Predictions */}
        {openPredictions.length > 0 && (
          <button
            onClick={() => pushScreen({ screen: "predictions", showId: show.id })}
            className="w-full bg-bg-card border border-border rounded-2xl p-4 flex items-center gap-3 text-left transition-transform"
          >
            <span className="w-10 h-10 rounded-lg border border-border bg-bg-elevated flex items-center justify-center font-mono font-semibold text-text-secondary text-base">?</span>
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-sm font-display font-bold">Make your predictions</p>
              <p className="text-text-secondary text-xs font-body">
                {openPredictions.length} open pick{openPredictions.length === 1 ? "" : "s"} · see who calls it
              </p>
            </div>
            <span className="text-text-muted text-lg">›</span>
          </button>
        )}

        {/* Season ratings */}
        {show.seasons > 1 && !myRating?.seasonRatings?.length && seasonCommunityRatings.length > 0 ? (
          <div className="bg-bg-card rounded-2xl p-4 border border-border">
            <p className="text-text-muted text-xs font-body uppercase tracking-wider mb-3">
              Season ratings on Binge
            </p>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: show.seasons }).map((_, i) => {
                const season = i + 1;
                const mySeasonRating = myRating?.seasonRatings?.find((sr) => sr.season === season);
                const commSeasonRating = seasonCommunityRatings.find((c) => c.season === season);
                return (
                  <div key={season} className="bg-bg-elevated rounded-xl p-2.5 text-center">
                    <p className="text-text-muted text-[10px] font-body mb-1">S{season}</p>
                    {mySeasonRating ? (
                      <RatingBadge rating={mySeasonRating.rating} size="sm" />
                    ) : commSeasonRating ? (
                      <span className="text-text-secondary text-xs font-display font-bold">
                        {commSeasonRating.averageRating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-text-muted text-xs">—</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Description */}
        {show.description && (
          <div>
            <p className="text-text-muted text-xs font-body uppercase tracking-wider mb-2 px-1">
              About
            </p>
            <p className="text-text-secondary text-sm leading-relaxed font-body">
              {show.description}
            </p>
          </div>
        )}

        {/* Cast */}
        {show.cast && show.cast.length > 0 && (
          <div>
            <p className="text-text-muted text-xs font-body uppercase tracking-wider mb-3 px-1">
              Cast
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {show.cast.map((actor) => (
                <button
                  key={actor}
                  onClick={() => handleActorSearch(actor)}
                  className="flex-shrink-0 px-3.5 py-2 bg-bg-card border border-border rounded-xl text-text-primary text-sm font-body font-medium active:bg-bg-elevated active:border-accent transition-all"
                >
                  {actor}
                </button>
              ))}
            </div>
            <p className="text-text-muted text-[10px] font-body mt-2 px-1">
              Tap a name to find more of their work
            </p>
          </div>
        )}

        <AlsoLikedRow type="show" id={show.id} fallback={similarShows} />

        {/* Watchlist button */}
        <button
          onClick={handleWatchlistToggle}
          className={`w-full py-3 rounded-2xl font-body font-semibold transition-all ${
            inWatchlist
              ? "bg-accent/10 text-accent border border-accent"
              : "bg-bg-card text-text-secondary border border-border"
          }`}
        >
          {inWatchlist ? "✓ In Watchlist" : "Add to Watchlist"}
        </button>
      </div>
    </div>
  );
}
