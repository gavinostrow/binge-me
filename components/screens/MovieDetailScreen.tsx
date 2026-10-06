"use client";
import { useApp } from "@/lib/AppContext";
import { allMovies, getMovie } from "@/lib/catalog";
import { useTitleExtras } from "@/lib/useTitleExtras";
import PosterImage from "@/components/PosterImage";
import RatingBadge from "@/components/RatingBadge";
import WhereToWatch from "@/components/social/ProviderChips";
import RatingsTrio from "@/components/social/RatingsTrio";
import AlsoLikedRow from "@/components/social/AlsoLikedRow";
import { useMemo, useState } from "react";

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

  const movie = getMovie(movieId);
  const extras = useTitleExtras("movie", movie);

  // Fallback for "also liked": TMDB's similar movies, else same-genre movies.
  const similarMovies = useMemo(() => {
    if (!movie) return [];
    if (extras.similar && extras.similar.length > 0) return extras.similar;
    return allMovies()
      .filter((m) => m.id !== movieId && m.genre.some((g) => movie.genre.includes(g)))
      .sort(
        (a, b) =>
          b.genre.filter((g) => movie.genre.includes(g)).length -
          a.genre.filter((g) => movie.genre.includes(g)).length,
      )
      .slice(0, 8);
  }, [movie, movieId, extras.similar]);

  if (!movie) return <div className="p-4">Movie not found</div>;

  const myRating = getMyMovieRating(movieId);
  const inWatchlist = isInWatchlist("movie", movieId);

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
            className="w-full py-3.5 bg-accent text-white font-display font-bold text-base rounded-2xl transition-all"
          >
            Rate This Movie
          </button>
        )}

        <RatingsTrio type="movie" id={movie.id} myRating={myRating?.rating} />

        <WhereToWatch providers={extras.providers} source={extras.source} />

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

        <AlsoLikedRow type="movie" id={movie.id} fallback={similarMovies} />

        {/* Watchlist button (bottom) */}
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
