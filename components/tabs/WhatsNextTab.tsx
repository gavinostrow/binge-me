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

interface RecommendationResult {
  title: string;
  year: number;
  genre: string;
  reason: string;
  rating?: number;
}

export default function WhatsNextTab() {
  const { movieRatings, showRatings, addToWatchlist } = useApp();

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
        const genre = r.movie.genre || "Unknown";
        if (!genreScores[genre]) genreScores[genre] = { total: 0, count: 0 };
        genreScores[genre].total += r.rating;
        genreScores[genre].count += 1;
      }
    } else {
      for (const r of showRatings) {
        const genre = r.show.genre || "Unknown";
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
        const aScore = genrePrefs[a.genre] || 0;
        const bScore = genrePrefs[b.genre] || 0;
        return bScore - aScore;
      });
      return sorted.map((item) => {
        const topGenre = item.genre;
        const matchScore = genrePrefs[topGenre];
        const reason = matchScore
          ? `Matches your ${topGenre} taste (avg rating: ${matchScore.toFixed(1)})`
          : `Explore something new in ${topGenre}`;
        return {
          title: item.title,
          year: item.year,
          genre: item.genre,
          reason,
        };
      });
    }

    if (source === "friends") {
      const communityPool = contentType === "movie" ? communityMovies : communityShows;
      const unrated = communityPool.filter((item) => !ratedTitles.has(item.title));
      return unrated.map((item) => {
        const friend = friends[Math.floor(Math.random() * friends.length)];
        const matchPct = tasteMatchPercentages[friend.id] || 75;
        const friendRating = (7 + Math.random() * 3).toFixed(1);
        return {
          title: item.title,
          year: item.year,
          genre: item.genre,
          reason: `${friend.displayName} rated ${friendRating} — ${matchPct}% taste match`,
          rating: item.averageRating,
        };
      });
    }

    // community
    const communityPool = contentType === "movie" ? communityMovies : communityShows;
    const unrated = communityPool.filter((item) => !ratedTitles.has(item.title));
    return unrated.map((item) => ({
      title: item.title,
      year: item.year,
      genre: item.genre,
      reason: `${item.averageRating.toFixed(1)} avg from ${item.totalRatings.toLocaleString()} ratings`,
      rating: item.averageRating,
    }));
  }

  function spin() {
    setSpinning(true);
    setResult(null);
    setSuggestions([]);

    setTimeout(() => {
      setSpinning(false);
      const recs = getRecommendations();
      if (recs.length === 0) {
        setResult({
          title: "No recommendations",
          year: 0,
          genre: "",
          reason: "You've rated everything! Try a different source or content type.",
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
              {result.genre}
            </p>
            <p className="text-text-secondary text-sm mb-4">{result.reason}</p>
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
                  <p className="text-text-muted text-xs">
                    {item.year > 0 && item.year}
                    {item.year > 0 && item.genre && " · "}
                    {item.genre}
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
