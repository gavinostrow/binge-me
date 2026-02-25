"use client";
import { useApp } from "@/lib/AppContext";
import {
  movies,
  friends,
  friendsMovieRatings,
  communityMovies,
} from "@/lib/mockData";
import PosterImage from "@/components/PosterImage";
import RatingBadge from "@/components/RatingBadge";
import { useState } from "react";

const FRIEND_COLORS = ["#7C5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"];
function friendColor(userId: string) {
  return FRIEND_COLORS[
    parseInt(userId.replace(/\D/g, "")) % FRIEND_COLORS.length
  ];
}

export default function MovieDetailScreen({ movieId }: { movieId: string }) {
  const {
    setActiveTab,
    pushScreen,
    popScreen,
    watchlist,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    getMyMovieRating,
  } = useApp();
  const [scrolled, setScrolled] = useState(false);

  const movie = movies.find((m) => m.id === movieId);
  if (!movie) return <div className="p-4">Movie not found</div>;

  const myRating = getMyMovieRating(movieId);
  const friendRatings = friendsMovieRatings[movieId] || [];
  const communityItem = communityMovies.find((c) => c.movie?.id === movieId);
  const inWatchlist = isInWatchlist("movie", movieId);

  // Similar movies: same genre(s), exclude current
  const similarMovies = movies
    .filter(
      (m) => m.id !== movieId && m.genre.some((g) => movie.genre.includes(g)),
    )
    .sort((a, b) => {
      const aMatch = a.genre.filter((g) => movie.genre.includes(g)).length;
      const bMatch = b.genre.filter((g) => movie.genre.includes(g)).length;
      return bMatch - aMatch;
    })
    .slice(0, 8);

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      const item = watchlist.find((w) => w.movie?.id === movieId);
      if (item) removeFromWatchlist(item.id);
    } else {
      addToWatchlist({
        id: `wl_${Date.now()}`,
        contentType: "movie",
        movie,
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
            className="w-8 h-8 rounded-full bg-bg-card border border-border flex items-center justify-center flex-shrink-0 active:scale-95 transition-all"
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
            {movie.title}
          </h2>
          {myRating && <RatingBadge rating={myRating.rating} size="sm" />}
        </div>
      )}

      {/* Hero poster */}
      <div className="relative">
        <PosterImage
          title={movie.title}
          year={movie.year}
          posterPath={movie.posterPath}
          size="xl"
          className="w-full aspect-[2/3] object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/30 to-transparent" />

        {/* Back button always on poster */}
        <button
          onClick={popScreen}
          className="absolute top-4 left-4 z-10 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-95 transition-all"
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
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-95 transition-all"
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
            {movie.title}
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-white/70 text-sm font-body">
              {movie.year}
            </span>
            {movie.runtime && (
              <>
                <span className="text-white/40 text-xs">·</span>
                <span className="text-white/70 text-sm font-body">
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </span>
              </>
            )}
            {movie.director && (
              <>
                <span className="text-white/40 text-xs">·</span>
                <span className="text-white/70 text-sm font-body">
                  dir. {movie.director}
                </span>
              </>
            )}
          </div>
          {/* Genre chips */}
          <div className="flex gap-2 mt-2 flex-wrap">
            {movie.genre.map((g) => (
              <span
                key={g}
                className="px-2.5 py-1 rounded-full text-xs font-body font-semibold bg-white/15 backdrop-blur-sm text-white border border-white/20"
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
          <div className="bg-bg-card rounded-2xl p-4 border border-border flex items-center justify-between">
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
              <RatingBadge rating={myRating.rating} size="lg" />
              <button
                onClick={() => setActiveTab("add")}
                className="text-accent text-sm font-body font-semibold"
              >
                Edit
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setActiveTab("add")}
            className="w-full py-3.5 bg-gradient-to-r from-accent to-accent-light text-white font-display font-bold text-base rounded-2xl active:scale-[0.98] transition-all"
          >
            Rate This Movie
          </button>
        )}

        {/* Community Stats */}
        {communityItem && (
          <div className="bg-bg-card rounded-2xl p-4 border border-border">
            <p className="text-text-muted text-xs font-body uppercase tracking-wider mb-3">
              Community
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <RatingBadge rating={communityItem.averageRating} size="lg" />
                <div>
                  <p className="text-text-primary text-sm font-display font-bold">
                    {communityItem.averageRating.toFixed(1)} avg
                  </p>
                  <p className="text-text-muted text-xs font-body">
                    {communityItem.ratingCount.toLocaleString()} ratings
                  </p>
                </div>
              </div>
              {communityItem.pct9plus && (
                <div className="flex-1 flex justify-end">
                  <div className="bg-accent/10 border border-accent/30 rounded-xl px-3 py-2 text-center">
                    <p className="font-display font-bold text-accent text-lg leading-none">
                      {communityItem.pct9plus}%
                    </p>
                    <p className="text-accent/80 text-[10px] font-body mt-0.5">
                      gave it a 9+
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Friends' Ratings */}
        {friendRatings.length > 0 && (
          <div>
            <p className="text-text-muted text-xs font-body uppercase tracking-wider mb-3 px-1">
              Friends' Takes
            </p>
            <div className="space-y-2">
              {friendRatings.map((fr, idx) => {
                const friend = friends.find((f) => f.id === fr.userId);
                if (!friend) return null;
                return (
                  <button
                    key={idx}
                    onClick={() =>
                      pushScreen({ screen: "profile", userId: fr.userId })
                    }
                    className="w-full bg-bg-card rounded-2xl p-4 border border-border flex items-start gap-3 active:opacity-80 transition-opacity text-left"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-display font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: friendColor(friend.id) }}
                    >
                      {friend.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-display font-semibold">
                        {friend.name}
                      </p>
                      {fr.review && (
                        <p className="text-text-secondary text-xs mt-1 italic leading-relaxed line-clamp-2">
                          "{fr.review}"
                        </p>
                      )}
                    </div>
                    <RatingBadge rating={fr.rating} size="md" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Description */}
        {movie.description && (
          <div>
            <p className="text-text-muted text-xs font-body uppercase tracking-wider mb-2 px-1">
              About
            </p>
            <p className="text-text-secondary text-sm leading-relaxed font-body">
              {movie.description}
            </p>
          </div>
        )}

        {/* Cast */}
        {movie.cast && movie.cast.length > 0 && (
          <div>
            <p className="text-text-muted text-xs font-body uppercase tracking-wider mb-3 px-1">
              Cast
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {movie.cast.map((actor) => (
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

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <div>
            <p className="text-text-muted text-xs font-body uppercase tracking-wider mb-3 px-1">
              You Might Also Like
            </p>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {similarMovies.map((m) => {
                const communityRating = communityMovies.find(
                  (c) => c.movie?.id === m.id,
                );
                return (
                  <button
                    key={m.id}
                    onClick={() =>
                      pushScreen({ screen: "movie-detail", movieId: m.id })
                    }
                    className="flex-shrink-0 w-28 active:opacity-75 transition-opacity text-left"
                  >
                    <PosterImage
                      title={m.title}
                      year={m.year}
                      posterPath={m.posterPath}
                      size="md"
                      className="w-28 h-40 rounded-xl object-cover"
                    />
                    <p className="text-text-primary text-xs font-display font-semibold mt-1.5 truncate leading-tight">
                      {m.title}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-text-muted text-[10px] font-body">
                        {m.year}
                      </span>
                      {communityRating && (
                        <>
                          <span className="text-text-muted text-[10px]">·</span>
                          <span
                            className="text-[10px] font-body font-semibold"
                            style={{ color: "#A78BFA" }}
                          >
                            {communityRating.averageRating.toFixed(1)}
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Watchlist button (bottom) */}
        <button
          onClick={handleWatchlistToggle}
          className={`w-full py-3 rounded-2xl font-body font-semibold transition-all active:scale-[0.98] ${
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
