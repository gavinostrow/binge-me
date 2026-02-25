"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { ContentType } from "@/lib/types";
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

type Source = "taste" | "friends" | "community";

interface RecResult {
  title: string;
  year: number;
  genre: string;
  reason: string;
  rating?: number;
}

export default function WhatsNextTab() {
  const { movieRatings, showRatings, addToWatchlist, setActiveTab, setPendingAddItem, notifications } = useApp();

  const [source, setSource] = useState<Source | null>(null);
  const [contentType, setContentType] = useState<ContentType>("movie");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<RecResult | null>(null);
  const [suggestions, setSuggestions] = useState<RecResult[]>([]);

  const ratedTitles =
    contentType === "movie"
      ? new Set(movieRatings.map((r) => r.movie.title))
      : new Set(showRatings.map((r) => r.show.title));

  function getGenrePreferences(): Record<string, number> {
    const scores: Record<string, { total: number; count: number }> = {};
    if (contentType === "movie") {
      for (const r of movieRatings) {
        const g = Array.isArray(r.movie.genre) ? r.movie.genre[0] : r.movie.genre;
        if (!g) continue;
        if (!scores[g]) scores[g] = { total: 0, count: 0 };
        scores[g].total += r.rating;
        scores[g].count++;
      }
    } else {
      for (const r of showRatings) {
        const g = Array.isArray(r.show.genre) ? r.show.genre[0] : r.show.genre;
        if (!g) continue;
        if (!scores[g]) scores[g] = { total: 0, count: 0 };
        scores[g].total += r.overallRating;
        scores[g].count++;
      }
    }
    const avg: Record<string, number> = {};
    for (const [g, { total, count }] of Object.entries(scores)) avg[g] = total / count;
    return avg;
  }

  function getRecommendations(): RecResult[] {
    if (source === "taste") {
      const pool = contentType === "movie" ? searchableMovies : searchableShows;
      const unrated = pool.filter((item) => !ratedTitles.has(item.title));
      const genrePrefs = getGenrePreferences();
      const sorted = [...unrated].sort((a, b) => {
        const ag = Array.isArray(a.genre) ? a.genre[0] : a.genre;
        const bg = Array.isArray(b.genre) ? b.genre[0] : b.genre;
        return (genrePrefs[bg] ?? 0) - (genrePrefs[ag] ?? 0);
      });
      return sorted.map((item) => {
        const g = Array.isArray(item.genre) ? item.genre[0] : item.genre;
        const score = genrePrefs[g];
        return {
          title: item.title,
          year: item.year,
          genre: g ?? "",
          reason: score
            ? `Matches your ${g} taste (avg ${score.toFixed(1)})`
            : `Explore something new in ${g}`,
        };
      });
    }

    if (source === "friends") {
      // Only show recommendations actually sent by friends (received notifications)
      const sentRecs = notifications.filter(
        (n) => n.type === "recommendation" && n.fromUserId !== "u1" && (n.movie || n.show)
      );
      const recs: RecResult[] = [];
      for (const notif of sentRecs) {
        const item = contentType === "movie" ? notif.movie : notif.show;
        if (!item) continue;
        if (ratedTitles.has(item.title)) continue;
        if (recs.some((r) => r.title === item.title)) continue;
        const friend = friends.find((f) => f.id === notif.fromUserId) ?? notif.fromUser;
        const match = tasteMatchPercentages[notif.fromUserId ?? ""] ?? 70;
        const rawGenre = item.genre ?? "";
        const g = Array.isArray(rawGenre) ? rawGenre[0] ?? "" : rawGenre;
        recs.push({
          title: item.title,
          year: item.year,
          genre: g,
          reason: `${friend?.displayName ?? friend?.name ?? "A friend"} recommended this · ${match}% match`,
        });
      }
      return recs;
    }

    // Community
    const pool = contentType === "movie" ? communityMovies : communityShows;
    return pool
      .filter((item) => {
        const t = item.movie?.title ?? item.show?.title ?? "";
        return t && !ratedTitles.has(t);
      })
      .map((item) => {
        const rawGenre = item.movie?.genre ?? item.show?.genre ?? "";
        const g = Array.isArray(rawGenre) ? rawGenre[0] ?? "" : rawGenre;
        return {
          title: item.movie?.title ?? item.show?.title ?? "",
          year: item.movie?.year ?? item.show?.year ?? 0,
          genre: g,
          reason: `${item.averageRating.toFixed(1)} avg · ${item.ratingCount.toLocaleString()} ratings`,
          rating: item.averageRating,
        };
      });
  }

  function spin() {
    setSpinning(true);
    setResult(null);
    setSuggestions([]);
    setTimeout(() => {
      setSpinning(false);
      const recs = getRecommendations();
      if (recs.length === 0) {
        const emptyReason = source === "friends"
          ? "No friend recommendations yet. Ask friends to send you recs!"
          : "Try a different source or content type.";
        setResult({ title: "Nothing to show", year: 0, genre: "", reason: emptyReason });
        setSuggestions([]);
        return;
      }
      const shuffled = [...recs].sort(() => Math.random() - 0.5);
      setResult(shuffled[0]);
      setSuggestions(shuffled.slice(1, 6));
    }, 700);
  }

  function handleWatchlist() {
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
    } as any);
  }

  function handleRate(rec: RecResult) {
    const isShow = contentType === "show";
    const pendingItem = isShow
      ? { id: rec.title, title: rec.title, year: rec.year, genre: rec.genre, totalSeasons: 1 }
      : { id: rec.title, title: rec.title, year: rec.year, genre: rec.genre };
    setPendingAddItem(pendingItem as unknown as Parameters<typeof setPendingAddItem>[0]);
    setActiveTab("add");
  }

  const sourceLabels: Record<Source, string> = {
    taste: "Your Taste",
    friends: "Friends",
    community: "Community",
  };

  // ── Source selection screen ──
  if (!source) {
    return (
      <div className="pb-24">
        <div className="px-4 pt-6 pb-4">
          <h1 className="font-display font-bold text-2xl text-text-primary">What&apos;s Next</h1>
          <p className="text-text-muted text-sm mt-1">Spin for your next watch</p>
        </div>

        <div className="flex flex-col gap-3 px-4">
          {/* Your Taste */}
          <button
            onClick={() => setSource("taste")}
            className="bg-bg-surface rounded-xl p-5 w-full text-left active:scale-[0.98] active:opacity-80 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-purple/20 flex items-center justify-center shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-display font-semibold text-text-primary">Your Taste</h3>
                <p className="text-text-muted text-sm">Based on your ratings and favorite genres</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted ml-auto shrink-0">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>

          {/* Friends */}
          <button
            onClick={() => setSource("friends")}
            className="bg-bg-surface rounded-xl p-5 w-full text-left active:scale-[0.98] active:opacity-80 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-purple/20 flex items-center justify-center shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h3 className="font-display font-semibold text-text-primary">Friends</h3>
                <p className="text-text-muted text-sm">What your friends rated highly</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted ml-auto shrink-0">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>

          {/* Community */}
          <button
            onClick={() => setSource("community")}
            className="bg-bg-surface rounded-xl p-5 w-full text-left active:scale-[0.98] active:opacity-80 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-purple/20 flex items-center justify-center shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div>
                <h3 className="font-display font-semibold text-text-primary">Community</h3>
                <p className="text-text-muted text-sm">Highest rated across all users</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted ml-auto shrink-0">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ── Spin screen ──
  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => { setSource(null); setResult(null); setSuggestions([]); }}
          className="w-8 h-8 rounded-full bg-bg-surface flex items-center justify-center active:opacity-70 transition-opacity"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="font-display font-bold text-xl text-text-primary">{sourceLabels[source]}</h1>
      </div>

      {/* Movie / Show toggle */}
      <div className="px-4 pb-6">
        <div className="flex bg-bg-surface rounded-full p-1">
          <button
            onClick={() => { setContentType("movie"); setResult(null); setSuggestions([]); }}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all ${
              contentType === "movie" ? "bg-accent-purple text-white" : "text-text-muted"
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => { setContentType("show"); setResult(null); setSuggestions([]); }}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all ${
              contentType === "show" ? "bg-accent-purple text-white" : "text-text-muted"
            }`}
          >
            Shows
          </button>
        </div>
      </div>

      {/* Big SPIN button */}
      <div className="flex flex-col items-center py-6">
        <button
          onClick={spin}
          disabled={spinning}
          className={`w-28 h-28 rounded-full bg-accent-purple flex items-center justify-center shadow-xl shadow-accent-purple/40 active:scale-95 transition-all ${
            spinning ? "animate-spin-slow" : "hover:bg-accent-purple/90"
          }`}
        >
          {/* Dice icon */}
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="3" />
            <circle cx="8" cy="8" r="1.2" fill="white" stroke="none" />
            <circle cx="16" cy="8" r="1.2" fill="white" stroke="none" />
            <circle cx="8" cy="16" r="1.2" fill="white" stroke="none" />
            <circle cx="16" cy="16" r="1.2" fill="white" stroke="none" />
            <circle cx="12" cy="12" r="1.2" fill="white" stroke="none" />
          </svg>
        </button>
        <p className="text-text-primary font-display font-bold text-sm mt-4 tracking-[0.2em] uppercase">
          {spinning ? "Spinning..." : "Spin"}
        </p>
      </div>

      {/* Result card */}
      {result && !spinning && (
        <div className="px-4 pb-4 animate-scaleIn">
          <div className="bg-bg-surface rounded-xl p-5">
            <div className="flex items-start justify-between mb-2 gap-3">
              <h2 className="font-display font-bold text-xl text-text-primary flex-1 leading-tight">
                {result.title}
              </h2>
              {result.rating !== undefined && <RatingBadge rating={result.rating} size="md" />}
            </div>
            {(result.year > 0 || result.genre) && (
              <p className="text-text-muted text-sm mb-1">
                {result.year > 0 ? result.year : ""}
                {result.year > 0 && result.genre ? " · " : ""}
                {result.genre}
              </p>
            )}
            <p className="text-text-secondary text-sm mb-4 leading-relaxed">{result.reason}</p>
            <div className="flex gap-2">
              <button
                onClick={spin}
                className="flex-1 py-2.5 rounded-xl border border-bg-hover text-text-primary text-sm font-semibold active:scale-95 transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => handleRate(result)}
                className="flex-1 py-2.5 rounded-xl bg-accent-purple text-white text-sm font-semibold active:scale-95 transition-all"
              >
                Rate It
              </button>
              <button
                onClick={handleWatchlist}
                className="flex-1 py-2.5 rounded-xl border border-bg-hover text-text-muted text-sm font-semibold active:scale-95 transition-all"
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
          <h3 className="text-text-muted text-xs font-bold uppercase tracking-widest mb-3">More suggestions</h3>
          <div className="flex flex-col gap-2">
            {suggestions.map((item, i) => (
              <div
                key={`${item.title}-${i}`}
                className="bg-bg-surface rounded-xl p-3 flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-semibold truncate">{item.title}</p>
                  <p className="text-text-muted text-xs mt-0.5 truncate">{item.reason}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {item.rating !== undefined && (
                    <span
                      className="text-xs font-bold font-display"
                      style={{ color: getRatingColor(item.rating) }}
                    >
                      {item.rating.toFixed(1)}
                    </span>
                  )}
                  <button
                    onClick={() => handleRate(item)}
                    className="text-xs bg-bg-elevated text-text-secondary px-2.5 py-1 rounded-lg font-semibold active:scale-95 transition-all"
                  >
                    Rate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
