"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { ContentType, RecommendationSource } from "@/lib/types";
import {
  searchableMovies,
  searchableShows,
  friends,
  tasteMatchPercentages,
  communityMovies,
  communityShows,
} from "@/lib/mockData";
import { getRatingColor } from "@/lib/utils";
import RatingBadge from "@/components/RatingBadge";
import { useSocial } from "@/lib/SocialContext";
import { allFriendRatings, tasteMatch } from "@/lib/social";
import { getMovie, getShow } from "@/lib/catalog";
import { knownExtras } from "@/lib/useTitleExtras";
import WhatsNextHub from "@/components/social/WhatsNextHub";
import { ProviderLogos } from "@/components/social/ProviderChips";

interface RecommendationResult {
  title: string;
  year: number;
  genre: string | string[];
  reason: string;
  rating?: number;
  itemId?: string;
}

function genreText(genre: string | string[]) {
  return Array.isArray(genre) ? genre.slice(0, 2).join(", ") : genre;
}

export default function WhatsNextTab() {
  const { movieRatings, showRatings, addToWatchlist, pushScreen } = useApp();
  const { followingIds, getUser, myRows, myServices } = useSocial();
  const [onlyMyServices, setOnlyMyServices] = useState(false);

  const [source, setSource] = useState<RecommendationSource | null>(null);
  const [contentType, setContentType] = useState<ContentType>("movie");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [suggestions, setSuggestions] = useState<RecommendationResult[]>([]);

  const ratedTitles = contentType === "movie"
    ? new Set(movieRatings.map((r) => r.movie.title))
    : new Set(showRatings.map((r) => r.show.title));

  function getGenrePreferences(): Record<string, number> {
    const genreScores: Record<string, { total: number; count: number }> = {};
    if (contentType === "movie") {
      for (const r of movieRatings) {
        const genre = (Array.isArray(r.movie.genre) ? r.movie.genre[0] : r.movie.genre) || "Unknown";
        if (!genreScores[genre]) genreScores[genre] = { total: 0, count: 0 };
        genreScores[genre].total += r.rating;
        genreScores[genre].count += 1;
      }
    } else {
      for (const r of showRatings) {
        const genre = (Array.isArray(r.show.genre) ? r.show.genre[0] : r.show.genre) || "Unknown";
        if (!genreScores[genre]) genreScores[genre] = { total: 0, count: 0 };
        genreScores[genre].total += r.overallRating;
        genreScores[genre].count += 1;
      }
    }
    const avg: Record<string, number> = {};
    for (const [genre, { total, count }] of Object.entries(genreScores)) {
      avg[genre] = total / count;
    }
    return avg;
  }

  function getRecommendations(): RecommendationResult[] {
    if (source === "taste") {
      const pool = contentType === "movie" ? searchableMovies : searchableShows;
      const unrated = pool.filter((item) => !ratedTitles.has(item.title));
      const genrePrefs = getGenrePreferences();
      const sorted = [...unrated].sort((a, b) => {
        const aScore = genrePrefs[(Array.isArray(a.genre) ? a.genre[0] : a.genre) as string] || 0;
        const bScore = genrePrefs[(Array.isArray(b.genre) ? b.genre[0] : b.genre) as string] || 0;
        return bScore - aScore;
      });
      return sorted.map((item) => {
        const topGenre = (Array.isArray(item.genre) ? item.genre[0] : item.genre) as string;
        const matchScore = genrePrefs[topGenre];
        const reason = matchScore
          ? `Matches your ${topGenre} taste (avg rating: ${matchScore.toFixed(1)})`
          : `Explore something new in ${topGenre}`;
        return {
          title: item.title,
          year: item.year,
          genre: item.genre,
          reason,
          itemId: item.id,
        };
      });
    }

    if (source === "friends") {
      const kind = contentType === "movie" ? "movie" : "show";
      const best = new Map<string, { userId: string; rating: number }>();
      allFriendRatings()
        .filter((r) => r.type === kind && r.rating >= 8 && followingIds.includes(r.userId))
        .forEach((r) => {
          const cur = best.get(r.id);
          if (!cur || r.rating > cur.rating) best.set(r.id, { userId: r.userId, rating: r.rating });
        });
      return Array.from(best.entries())
        .map(([id, { userId, rating }]) => {
          const item = kind === "movie" ? getMovie(id) : getShow(id);
          const friend = getUser(userId);
          if (!item || !friend || ratedTitles.has(item.title)) return null;
          const match = tasteMatch(myRows, userId).pct;
          return {
            title: item.title,
            year: item.year,
            genre: item.genre,
            reason: `${friend.name.split(" ")[0]} rated it ${rating.toFixed(1)} · ${match}% taste match`,
            rating,
            itemId: item.id,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);
    }

    // community
    const communityPool = contentType === "movie" ? communityMovies : communityShows;
    const unrated = communityPool.filter((item) => {
      const t = item.movie?.title ?? item.show?.title ?? "";
      return !ratedTitles.has(t);
    });
    return unrated.map((item) => ({
      title: item.movie?.title ?? item.show?.title ?? "",
      year: item.movie?.year ?? item.show?.year ?? 0,
      genre: item.movie?.genre ?? item.show?.genre ?? [],
      reason: `${item.averageRating.toFixed(1)} avg from ${item.ratingCount.toLocaleString()} ratings`,
      rating: item.averageRating,
      itemId: item.movie?.id ?? item.show?.id,
    }));
  }

  function providersOf(r: RecommendationResult) {
    if (!r.itemId) return [];
    const item = contentType === "movie" ? getMovie(r.itemId) : getShow(r.itemId);
    return item ? knownExtras(contentType, item).providers : [];
  }

  function filterByServices(recs: RecommendationResult[]) {
    if (!onlyMyServices) return recs;
    return recs.filter((r) => providersOf(r).some((p) => myServices.includes(p.key)));
  }

  function spin() {
    setSpinning(true);
    setResult(null);
    setSuggestions([]);

    setTimeout(() => {
      setSpinning(false);
      const recs = filterByServices(getRecommendations());
      if (recs.length === 0) {
        setResult({
          title: "No recommendations",
          year: 0,
          genre: "",
          reason: onlyMyServices
            ? "Nothing left on your services. Turn off the services filter or try another source."
            : "You've rated everything! Try a different source or content type.",
        });
        setSuggestions([]);
        return;
      }
      const shuffled = [...recs].sort(() => Math.random() - 0.5);
      setResult(shuffled[0]);
      setSuggestions(shuffled.slice(1, 6));
    }, 600);
  }

  function handleAddToWatchlist() {
    if (!result) return;
    const item = result.itemId ? (contentType === "movie" ? getMovie(result.itemId) : getShow(result.itemId)) : undefined;
    if (item) {
      addToWatchlist({
        id: "wl-" + Date.now(),
        contentType,
        ...(contentType === "movie" ? { movie: item as ReturnType<typeof getMovie> } : { show: item as ReturnType<typeof getShow> }),
        addedDate: new Date().toISOString(),
        recommendedBy: source ?? undefined,
      });
      return;
    }
    addToWatchlist({
      id: "wl-" + Date.now(),
      userId: "u1",
      contentId: result.title,
      contentType,
      title: result.title,
      year: result.year,
      genre: result.genre,
      addedAt: new Date().toISOString(),
    });
  }

  // Source selection screen
  if (!source) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="px-4 pt-6 pb-4">
          <h1 className="font-display font-bold text-xl text-text-primary">
            What&apos;s Next
          </h1>
          <p className="text-text-secondary text-sm">Find your next watch</p>
        </div>

        <WhatsNextHub />

        <p className="px-4 pt-2 pb-2 text-text-muted text-xs font-body uppercase tracking-wider">Spin for a pick</p>

        {/* Your Taste */}
        <button
          className="bg-bg-surface rounded-xl p-5 mx-4 mb-3 w-[calc(100%-2rem)] text-left hover:bg-bg-hover transition-colors"
          onClick={() => setSource("taste")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-purple/20 flex items-center justify-center flex-shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div>
              <h3 className="font-display font-semibold text-text-primary">
                Your Taste
              </h3>
              <p className="text-text-secondary text-sm">
                Based on your ratings and favorite genres
              </p>
            </div>
          </div>
        </button>

        {/* Friends */}
        <button
          className="bg-bg-surface rounded-xl p-5 mx-4 mb-3 w-[calc(100%-2rem)] text-left hover:bg-bg-hover transition-colors"
          onClick={() => setSource("friends")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-purple/20 flex items-center justify-center flex-shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h3 className="font-display font-semibold text-text-primary">
                Friends
              </h3>
              <p className="text-text-secondary text-sm">
                What your friends rated highly
              </p>
            </div>
          </div>
        </button>

        {/* Community */}
        <button
          className="bg-bg-surface rounded-xl p-5 mx-4 mb-3 w-[calc(100%-2rem)] text-left hover:bg-bg-hover transition-colors"
          onClick={() => setSource("community")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-purple/20 flex items-center justify-center flex-shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div>
              <h3 className="font-display font-semibold text-text-primary">
                Community
              </h3>
              <p className="text-text-secondary text-sm">
                Highest rated across all users
              </p>
            </div>
          </div>
        </button>
      </div>
    );
  }

  const sourceLabels: Record<RecommendationSource, string> = {
    taste: "Your Taste",
    friends: "Friends",
    community: "Community",
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header with back button */}
      <div className="px-4 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => {
            setSource(null);
            setResult(null);
            setSuggestions([]);
          }}
          className="w-8 h-8 rounded-full bg-bg-surface flex items-center justify-center hover:bg-bg-hover transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#E8E4DC"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="font-display font-bold text-xl text-text-primary">
          {sourceLabels[source]}
        </h1>
      </div>

      {/* Movie / Show toggle */}
      <div className="px-4 pb-4">
        <div className="flex bg-bg-surface rounded-full p-1">
          <button
            onClick={() => {
              setContentType("movie");
              setResult(null);
              setSuggestions([]);
            }}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
              contentType === "movie"
                ? "bg-accent-purple text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => {
              setContentType("show");
              setResult(null);
              setSuggestions([]);
            }}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
              contentType === "show"
                ? "bg-accent-purple text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Shows
          </button>
        </div>
        <button
          onClick={() => setOnlyMyServices((v) => !v)}
          className={`mt-3 w-full flex items-center justify-between rounded-xl px-3 py-2.5 border text-sm font-body transition-colors ${
            onlyMyServices ? "border-rating-green/40 bg-rating-green/5 text-text-primary" : "border-border bg-bg-surface text-text-secondary"
          }`}
          aria-pressed={onlyMyServices}
        >
          <span>Only what&apos;s on my services</span>
          <span
            className={`w-9 h-5 rounded-full relative transition-colors ${onlyMyServices ? "bg-rating-green" : "bg-bg-hover"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${onlyMyServices ? "left-[18px]" : "left-0.5"}`} />
          </span>
        </button>
      </div>

      {/* Spin button */}
      <div className="flex flex-col items-center py-8">
        <button
          onClick={spin}
          disabled={spinning}
          className={`w-24 h-24 rounded-full bg-accent-purple flex items-center justify-center shadow-lg shadow-accent-purple/30 hover:bg-accent-purple/90 transition-all active:scale-95 ${
            spinning ? "animate-spin-slow" : ""
          }`}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="8" height="8" rx="1" />
            <rect x="14" y="2" width="8" height="8" rx="1" />
            <rect x="2" y="14" width="8" height="8" rx="1" />
            <rect x="14" y="14" width="8" height="8" rx="1" />
            <circle cx="6" cy="6" r="1" fill="white" />
            <circle cx="18" cy="6" r="1" fill="white" />
            <circle cx="6" cy="18" r="1" fill="white" />
            <circle cx="18" cy="18" r="1" fill="white" />
            <circle cx="6" cy="6" r="1" fill="white" />
            <circle cx="18" cy="18" r="1" fill="white" />
          </svg>
        </button>
        <span className="text-text-primary font-display font-bold text-sm mt-3 tracking-widest">
          SPIN
        </span>
      </div>

      {/* Result card */}
      {result && !spinning && (
        <div className="px-4 pb-4 animate-scaleIn">
          <div className="bg-bg-surface rounded-xl p-5">
            <div className="flex items-start justify-between mb-2">
              <h2 className="font-display font-semibold text-lg text-text-primary flex-1">
                {result.title}
              </h2>
              {result.rating !== undefined && (
                <RatingBadge rating={result.rating} />
              )}
            </div>
            <p className="text-text-secondary text-sm mb-1">
              {result.year > 0 && result.year}
              {result.year > 0 && result.genre && " · "}
              {genreText(result.genre)}
            </p>
            <p className="text-text-secondary text-sm mb-3">{result.reason}</p>
            {providersOf(result).length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <ProviderLogos providers={providersOf(result)} max={3} size="sm" />
                <span className="text-text-muted text-xs font-body">
                  {providersOf(result).map((p) => p.name).join(" · ")}
                </span>
              </div>
            )}
            {result.itemId && (
              <button
                onClick={() =>
                  pushScreen(
                    contentType === "movie"
                      ? { screen: "movie-detail", movieId: result.itemId! }
                      : { screen: "show-detail", showId: result.itemId! },
                  )
                }
                className="text-accent-light text-sm font-body font-semibold mb-4"
              >
                See details ›
              </button>
            )}
            <div className="flex gap-3">
              <button
                onClick={spin}
                className="flex-1 py-2.5 px-4 rounded-lg border border-bg-hover text-text-primary text-sm font-medium hover:bg-bg-hover transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleAddToWatchlist}
                className="flex-1 py-2.5 px-4 rounded-lg bg-accent-purple text-white text-sm font-medium hover:bg-accent-purple/90 transition-colors"
              >
                + Watchlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* More suggestions */}
      {suggestions.length > 0 && !spinning && (
        <div className="px-4 pb-8">
          <h3 className="text-text-secondary text-sm font-medium mb-3">
            More suggestions
          </h3>
          <div className="space-y-2">
            {suggestions.slice(0, 5).map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="bg-bg-surface rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-text-primary text-sm font-medium truncate">
                    {item.title}
                  </h4>
                  <p className="text-text-muted text-xs flex items-center gap-1.5">
                    <span className="truncate">
                      {item.year > 0 && item.year}
                      {item.year > 0 && item.genre && " · "}
                      {genreText(item.genre)}
                    </span>
                    <ProviderLogos providers={providersOf(item)} max={2} />
                  </p>
                </div>
                {item.rating !== undefined && (
                  <div
                    className="ml-3 text-xs font-bold px-2 py-0.5 rounded"
                    style={{ color: getRatingColor(item.rating) }}
                  >
                    {item.rating.toFixed(1)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
