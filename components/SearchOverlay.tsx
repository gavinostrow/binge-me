"use client";

import { useState, useEffect, useRef } from "react";
import { useApp } from "@/lib/AppContext";
import { searchableMovies, searchableShows, communityMovies, communityShows } from "@/lib/mockData";
import { getRatingColor } from "@/lib/utils";
import RatingBadge from "@/components/RatingBadge";

interface SearchOverlayProps {
  initialQuery?: string;
  onClose: () => void;
}

type SearchSection = {
  label: string;
  items: SearchResult[];
};

type SearchResult = {
  id: string;
  title: string;
  year: number;
  genre: string;
  type: "movie" | "show";
  source: "mylist" | "watchlist" | "community";
  rating?: number;
};

export default function SearchOverlay({ initialQuery = "", onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const { movieRatings, showRatings, watchlist, setActiveTab, setPendingAddItem } = useApp();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const q = query.toLowerCase().trim();

  // Build result sections
  const sections: SearchSection[] = [];

  if (q.length > 0) {
    // In Your Lists
    const inLists: SearchResult[] = [
      ...movieRatings
        .filter((mr) => mr.movie.title.toLowerCase().includes(q) || [mr.movie.genre].flat().some(g => g.toLowerCase().includes(q)))
        .map((mr) => ({
          id: mr.id,
          title: mr.movie.title,
          year: mr.movie.year,
          genre: Array.isArray(mr.movie.genre) ? mr.movie.genre[0] : mr.movie.genre,
          type: "movie" as const,
          source: "mylist" as const,
          rating: mr.rating,
        })),
      ...showRatings
        .filter((sr) => sr.show.title.toLowerCase().includes(q) || [sr.show.genre].flat().some(g => g.toLowerCase().includes(q)))
        .map((sr) => ({
          id: sr.id,
          title: sr.show.title,
          year: sr.show.year,
          genre: Array.isArray(sr.show.genre) ? sr.show.genre[0] : sr.show.genre,
          type: "show" as const,
          source: "mylist" as const,
          rating: sr.overallRating,
        })),
    ].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    if (inLists.length > 0) {
      sections.push({ label: "In Your Lists", items: inLists.slice(0, 5) });
    }

    // Watchlist
    const inWatchlist: SearchResult[] = watchlist
      .filter((w) => (w.title ?? "").toLowerCase().includes(q) || [w.genre ?? ""].flat().some(g => g.toLowerCase().includes(q)))
      .map((w) => ({
        id: w.id,
        title: w.title ?? "",
        year: w.year ?? 0,
        genre: Array.isArray(w.genre) ? w.genre[0] ?? "" : (w.genre ?? ""),
        type: w.contentType,
        source: "watchlist" as const,
      }));

    if (inWatchlist.length > 0) {
      sections.push({ label: "Watchlist", items: inWatchlist.slice(0, 5) });
    }

    // Community Top 100
    const inCommunity: SearchResult[] = [
      ...communityMovies
        .filter((cm) => (cm.movie?.title ?? "").toLowerCase().includes(q) || [cm.movie?.genre ?? ""].flat().some(g => g.toLowerCase().includes(q)))
        .map((cm) => ({
          id: cm.movie?.id ?? `cm-${Math.random()}`,
          title: cm.movie?.title ?? "",
          year: cm.movie?.year ?? 0,
          genre: Array.isArray(cm.movie?.genre) ? cm.movie!.genre[0] ?? "" : (cm.movie?.genre ?? ""),
          type: "movie" as const,
          source: "community" as const,
          rating: cm.averageRating,
        })),
      ...communityShows
        .filter((cs) => (cs.show?.title ?? "").toLowerCase().includes(q) || [cs.show?.genre ?? ""].flat().some(g => g.toLowerCase().includes(q)))
        .map((cs) => ({
          id: cs.show?.id ?? `cs-${Math.random()}`,
          title: cs.show?.title ?? "",
          year: cs.show?.year ?? 0,
          genre: Array.isArray(cs.show?.genre) ? cs.show!.genre[0] ?? "" : (cs.show?.genre ?? ""),
          type: "show" as const,
          source: "community" as const,
          rating: cs.averageRating,
        })),
    ].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    if (inCommunity.length > 0) {
      sections.push({ label: "Community Top 100", items: inCommunity.slice(0, 5) });
    }

    // All movies+shows (broader search)
    const allContent: SearchResult[] = [
      ...searchableMovies
        .filter((m) =>
          m.title.toLowerCase().includes(q) &&
          !inLists.some((r) => r.title === m.title) &&
          !inCommunity.some((r) => r.title === m.title)
        )
        .map((m) => ({
          id: m.id,
          title: m.title,
          year: m.year,
          genre: Array.isArray(m.genre) ? m.genre[0] ?? "" : m.genre,
          type: "movie" as const,
          source: "community" as const,
        })),
      ...searchableShows
        .filter((s) =>
          s.title.toLowerCase().includes(q) &&
          !inLists.some((r) => r.title === s.title) &&
          !inCommunity.some((r) => r.title === s.title)
        )
        .map((s) => ({
          id: s.id,
          title: s.title,
          year: s.year,
          genre: Array.isArray(s.genre) ? s.genre[0] ?? "" : s.genre,
          type: "show" as const,
          source: "community" as const,
        })),
    ];

    if (allContent.length > 0 && inCommunity.length === 0) {
      sections.push({ label: "All Content", items: allContent.slice(0, 8) });
    }
  }

  function handleTap(result: SearchResult) {
    if (result.source === "mylist") {
      setActiveTab("profile");
      onClose();
      return;
    }
    // For watchlist or community: open AddTab with item pre-filled
    const isShow = result.type === "show";
    const pendingItem = isShow
      ? { id: result.id, title: result.title, year: result.year ?? 0, genre: result.genre, seasons: 1, totalSeasons: 1 }
      : { id: result.id, title: result.title, year: result.year ?? 0, genre: result.genre };
    setPendingAddItem(pendingItem as unknown as Parameters<typeof setPendingAddItem>[0]);
    setActiveTab("add");
    onClose();
  }

  const SOURCE_LABELS = {
    mylist: "Rated",
    watchlist: "Watchlist",
    community: "Community",
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg-primary animate-fadeIn">
      {/* Search bar */}
      <div className="flex items-center gap-3 px-4 pt-safe-top pt-4 pb-3 border-b border-bg-elevated">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9994A8" strokeWidth="2" className="shrink-0">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, shows, genres..."
          className="flex-1 bg-transparent text-text-primary placeholder-text-muted text-base outline-none"
        />
        <button
          onClick={onClose}
          className="text-text-muted text-sm font-medium active:opacity-60 transition-opacity shrink-0"
        >
          Cancel
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {q.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 gap-3 text-center px-8">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#5E586E" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p className="text-text-muted text-sm">
              Search your ratings, watchlist, and top community picks
            </p>
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center pt-20 text-text-muted text-sm">
            No results for &ldquo;{query}&rdquo;
          </div>
        ) : (
          <div className="py-2">
            {sections.map((section) => (
              <div key={section.label}>
                <div className="px-4 py-2">
                  <span className="text-text-muted text-xs font-medium uppercase tracking-wider">
                    {section.label}
                  </span>
                </div>
                {section.items.map((result) => (
                  <button
                    key={result.id + result.source}
                    onClick={() => handleTap(result)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg-elevated active:bg-bg-elevated active:scale-[0.99] transition-all"
                  >
                    {/* Mini poster */}
                    <div
                      className="w-9 h-12 rounded-md shrink-0 flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: result.rating ? `${getRatingColor(result.rating)}22` : "#8B5CF622",
                        color: result.rating ? getRatingColor(result.rating) : "#8B5CF6",
                      }}
                    >
                      {result.title.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium text-text-primary text-sm truncate">{result.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-text-muted text-xs">{result.year}</span>
                        <span className="text-text-muted text-xs">·</span>
                        <span className="text-text-muted text-xs">{result.genre}</span>
                        <span className="text-text-muted text-xs">·</span>
                        <span className="text-xs capitalize" style={{ color: result.type === "movie" ? "#8B5CF6" : "#06B6D4" }}>
                          {result.type}
                        </span>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {result.rating && <RatingBadge rating={result.rating} size="sm" />}
                      <span className="text-text-muted text-[10px]">{SOURCE_LABELS[result.source]}</span>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
