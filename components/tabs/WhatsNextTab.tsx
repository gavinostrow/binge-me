"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { ContentType } from "@/lib/types";
import {
  searchableMovies,
  searchableShows,
  friends,
  tasteMatchPercentages,
} from "@/lib/mockData";
import { getRatingColor } from "@/lib/utils";
import RatingBadge from "@/components/RatingBadge";
import PosterImage from "@/components/PosterImage";

interface RecResult {
  title: string;
  year: number;
  genre: string;
  reason: string;
  rating?: number;
  posterPath?: string;
  fromFriend?: string;
}

type VibeStep = "content-type" | "vibe" | "spinning" | "result";

// 3 vibe questions — skippable
const VIBE_QUESTIONS = [
  {
    id: "mood",
    question: "What's your mood?",
    options: [
      { label: "Chill & easy", tags: ["Comedy", "Animation"] },
      { label: "Tense & gripping", tags: ["Thriller", "Crime"] },
      { label: "Big & epic", tags: ["Action", "Adventure"] },
      { label: "Feel something deep", tags: ["Drama", "Romance"] },
    ],
  },
  {
    id: "vibe",
    question: "Pick a vibe:",
    options: [
      { label: "Dark and gritty", tags: ["Crime", "Horror", "Thriller"] },
      { label: "Light and funny", tags: ["Comedy", "Animation"] },
      { label: "Mind-bending", tags: ["Sci-Fi", "Mystery"] },
      { label: "Based on true events", tags: ["Documentary", "Biography"] },
    ],
  },
  {
    id: "social",
    question: "Watching with anyone?",
    options: [
      { label: "Solo, late night", tags: ["Horror", "Thriller", "Drama"] },
      { label: "With friends", tags: ["Comedy", "Action", "Adventure"] },
      { label: "Date night", tags: ["Romance", "Drama", "Comedy"] },
      { label: "Family", tags: ["Animation", "Adventure", "Comedy"] },
    ],
  },
];

export default function WhatsNextTab() {
  const { movieRatings, showRatings, addToWatchlist, setActiveTab, setPendingAddItem, notifications } = useApp();

  const [step, setStep] = useState<VibeStep>("content-type");
  const [contentType, setContentType] = useState<ContentType>("movie");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [result, setResult] = useState<RecResult | null>(null);
  const [suggestions, setSuggestions] = useState<RecResult[]>([]);
  const [spinning, setSpinning] = useState(false);

  // Friend recs (received notifications)
  const friendRecs = notifications.filter(
    (n) => n.type === "recommendation" && n.fromUserId !== "u1" && (n.movie || n.show)
  );

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

  function getVibeRecs(): RecResult[] {
    const pool = contentType === "movie" ? searchableMovies : searchableShows;
    const unrated = pool.filter((item) => !ratedTitles.has(item.title));
    const genrePrefs = getGenrePreferences();

    // Score each item by how much its genres match selected tags + user taste
    const scored = unrated.map((item) => {
      const genres = Array.isArray(item.genre) ? item.genre : [item.genre];
      let score = 0;
      for (const g of genres) {
        if (selectedTags.includes(g)) score += 3;
        if (genrePrefs[g]) score += genrePrefs[g] * 0.5;
      }
      const g = genres[0] ?? "";
      return { item, score, g };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.map(({ item, g }) => ({
      title: item.title,
      year: item.year,
      genre: g,
      reason: selectedTags.includes(g)
        ? `Matches your vibe picks`
        : genrePrefs[g]
          ? `Matches your ${g} taste`
          : `Explore something new`,
      posterPath: (item as any).posterPath,
    }));
  }

  function handleVibeAnswer(tags: string[]) {
    setSelectedTags((prev) => [...prev, ...tags]);
    if (currentQuestion < VIBE_QUESTIONS.length - 1) {
      setCurrentQuestion((q) => q + 1);
    } else {
      // Last question — spin!
      setStep("spinning");
      setSpinning(true);
      setTimeout(() => {
        const recs = getVibeRecs();
        const shuffled = [...recs].sort(() => Math.random() - 0.5);
        setResult(shuffled[0] ?? null);
        setSuggestions(shuffled.slice(1, 5));
        setSpinning(false);
        setStep("result");
      }, 1000);
    }
  }

  function resetFlow() {
    setStep("content-type");
    setCurrentQuestion(0);
    setSelectedTags([]);
    setResult(null);
    setSuggestions([]);
    setSpinning(false);
  }

  function handleWatchlist(rec: RecResult) {
    addToWatchlist({
      id: "wl-" + Date.now(),
      userId: "u1",
      contentId: rec.title,
      contentType,
      title: rec.title,
      year: rec.year,
      genre: rec.genre,
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

  // ── Content type selection ──
  if (step === "content-type") {
    return (
      <div className="pb-24 flex flex-col">
        <div className="px-4 pt-6 pb-5">
          <h1 className="font-display font-bold text-2xl text-text-primary">What&apos;s Next</h1>
          <p className="text-text-muted text-sm mt-1">Answer a few questions, get your next watch</p>
        </div>

        {/* Movie / Show choice */}
        <div className="px-4 flex flex-col gap-3 mb-6">
          <button
            onClick={() => { setContentType("movie"); setStep("vibe"); setCurrentQuestion(0); setSelectedTags([]); }}
            className="bg-bg-surface rounded-xl p-5 flex items-center gap-4 active:scale-[0.98] transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-accent-purple/20 flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round">
                <rect x="2" y="2" width="20" height="20" rx="3" />
                <path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-text-primary">Movie</h3>
              <p className="text-text-muted text-sm">Find your next film</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted shrink-0">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <button
            onClick={() => { setContentType("show"); setStep("vibe"); setCurrentQuestion(0); setSelectedTags([]); }}
            className="bg-bg-surface rounded-xl p-5 flex items-center gap-4 active:scale-[0.98] transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-accent-purple/20 flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round">
                <rect x="2" y="7" width="20" height="15" rx="2" />
                <polyline points="17 2 12 7 7 2" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-text-primary">Show</h3>
              <p className="text-text-muted text-sm">Find your next series</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted shrink-0">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Friend recs section */}
        {friendRecs.length > 0 && (
          <div className="px-4">
            <h3 className="text-text-muted text-xs font-bold uppercase tracking-widest mb-3">Sent to you by friends</h3>
            <div className="flex flex-col gap-2">
              {friendRecs.slice(0, 5).map((notif) => {
                const item = notif.movie ?? notif.show;
                if (!item) return null;
                const fr = friends.find((f) => f.id === notif.fromUserId) ?? notif.fromUser;
                const isMovie = !!notif.movie;
                const rawGenre = (item as any).genre ?? "";
                const genre = Array.isArray(rawGenre) ? rawGenre[0] ?? "" : rawGenre;
                return (
                  <div key={notif.id} className="bg-bg-surface rounded-xl p-3 flex items-center gap-3">
                    <PosterImage title={item.title} year={item.year} posterPath={(item as any).posterPath} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-semibold truncate">{item.title}</p>
                      <p className="text-text-muted text-xs mt-0.5 truncate">
                        {item.year} · {genre}
                      </p>
                      <p className="text-accent-purple text-xs mt-0.5 truncate">
                        from {fr?.displayName ?? fr?.name ?? "a friend"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => handleRate({ title: item.title, year: item.year, genre, reason: "" })}
                        className="text-xs bg-accent-purple text-white px-3 py-1.5 rounded-lg font-semibold active:scale-95 transition-all"
                      >
                        Rate
                      </button>
                      <button
                        onClick={() => handleWatchlist({ title: item.title, year: item.year, genre, reason: "" })}
                        className="text-xs border border-bg-hover text-text-muted px-3 py-1.5 rounded-lg font-semibold active:scale-95 transition-all"
                      >
                        + List
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Vibe quiz ──
  if (step === "vibe") {
    const q = VIBE_QUESTIONS[currentQuestion];
    const progress = ((currentQuestion) / VIBE_QUESTIONS.length) * 100;
    return (
      <div className="pb-24 flex flex-col">
        {/* Header */}
        <div className="px-4 pt-6 pb-4 flex items-center gap-3">
          <button
            onClick={() => currentQuestion === 0 ? resetFlow() : setCurrentQuestion((q) => q - 1)}
            className="w-8 h-8 rounded-full bg-bg-surface flex items-center justify-center active:opacity-70 transition-opacity shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex-1">
            <div className="flex justify-between text-xs text-text-muted mb-1.5">
              <span>{contentType === "movie" ? "Movie" : "Show"}</span>
              <span>{currentQuestion + 1} / {VIBE_QUESTIONS.length}</span>
            </div>
            <div className="w-full h-1 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-purple rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => handleVibeAnswer([])}
            className="text-text-muted text-xs font-medium active:opacity-60 transition-opacity shrink-0"
          >
            Skip
          </button>
        </div>

        {/* Question */}
        <div className="px-4 pb-6 animate-fadeIn" key={currentQuestion}>
          <h2 className="font-display font-bold text-xl text-text-primary mb-5">{q.question}</h2>
          <div className="flex flex-col gap-2.5">
            {q.options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => handleVibeAnswer(opt.tags)}
                className="bg-bg-surface rounded-xl px-5 py-4 text-left font-semibold text-text-primary text-sm active:scale-[0.98] active:bg-accent-purple/10 transition-all border border-transparent active:border-accent-purple/30"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Spinning ──
  if (step === "spinning") {
    return (
      <div className="pb-24 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-28 h-28 rounded-full bg-accent-purple flex items-center justify-center shadow-xl shadow-accent-purple/40 animate-spin-slow">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="3" />
            <circle cx="8" cy="8" r="1.2" fill="white" stroke="none" />
            <circle cx="16" cy="8" r="1.2" fill="white" stroke="none" />
            <circle cx="8" cy="16" r="1.2" fill="white" stroke="none" />
            <circle cx="16" cy="16" r="1.2" fill="white" stroke="none" />
            <circle cx="12" cy="12" r="1.2" fill="white" stroke="none" />
          </svg>
        </div>
        <p className="text-text-primary font-display font-bold text-sm mt-5 tracking-[0.2em] uppercase">Finding your match...</p>
      </div>
    );
  }

  // ── Result ──
  if (step === "result" && result) {
    return (
      <div className="pb-24 flex flex-col">
        <div className="px-4 pt-6 pb-3 flex items-center gap-3">
          <button
            onClick={resetFlow}
            className="w-8 h-8 rounded-full bg-bg-surface flex items-center justify-center active:opacity-70 transition-opacity"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="font-display font-bold text-xl text-text-primary">Your Pick</h1>
        </div>

        {/* Main result card */}
        <div className="px-4 mb-4 animate-scaleIn">
          <div className="bg-bg-surface rounded-xl p-4 flex gap-4">
            <PosterImage title={result.title} year={result.year} posterPath={result.posterPath} size="md" />
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h2 className="font-display font-bold text-lg text-text-primary leading-tight flex-1">{result.title}</h2>
                  {result.rating !== undefined && <RatingBadge rating={result.rating} size="sm" />}
                </div>
                <p className="text-text-muted text-xs mb-1">{result.year} · {result.genre}</p>
                <p className="text-text-secondary text-xs leading-relaxed">{result.reason}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-4 mb-6 flex gap-2">
          <button
            onClick={resetFlow}
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
            onClick={() => handleWatchlist(result)}
            className="flex-1 py-2.5 rounded-xl border border-bg-hover text-text-muted text-sm font-semibold active:scale-95 transition-all"
          >
            + Watchlist
          </button>
        </div>

        {/* More suggestions */}
        {suggestions.length > 0 && (
          <div className="px-4">
            <h3 className="text-text-muted text-xs font-bold uppercase tracking-widest mb-3">More options</h3>
            <div className="flex flex-col gap-2">
              {suggestions.map((item, i) => (
                <div
                  key={`${item.title}-${i}`}
                  className="bg-bg-surface rounded-xl p-3 flex items-center gap-3"
                >
                  <PosterImage title={item.title} year={item.year} posterPath={item.posterPath} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm font-semibold truncate">{item.title}</p>
                    <p className="text-text-muted text-xs mt-0.5 truncate">{item.year} · {item.genre}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.rating !== undefined && (
                      <span className="text-xs font-bold font-display" style={{ color: getRatingColor(item.rating) }}>
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

  return null;
}
