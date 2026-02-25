"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import {
  friends,
  tasteMatchPercentages,
  communityMovies,
  communityShows,
  friendRatings,
} from "@/lib/mockData";
import { getRatingColor } from "@/lib/utils";
import RatingBadge from "@/components/RatingBadge";
import SendRecommendationSheet from "@/components/SendRecommendationSheet";
import { Movie, Show } from "@/lib/types";

interface RecItem {
  id: string;
  title: string;
  year: number;
  genre: string;
  type: "movie" | "show";
  reason: string;
  reasonColor?: string;
  rating?: number;
  // keep reference to raw movie/show for send rec
  movie?: Movie;
  show?: Show;
}

// Mini poster placeholder
function MiniPoster({ title, rating, type }: { title: string; rating?: number; type: "movie" | "show" }) {
  const bg = rating ? getRatingColor(rating) + "33" : type === "show" ? "#06B6D433" : "#8B5CF633";
  const color = rating ? getRatingColor(rating) : type === "show" ? "#06B6D4" : "#8B5CF6";
  const initials = title
    .split(" ")
    .filter((w) => w.length > 0)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div
      className="w-10 h-14 rounded-md shrink-0 flex items-center justify-center text-xs font-bold"
      style={{ backgroundColor: bg, color }}
    >
      {initials}
    </div>
  );
}

// Collapsible section
function Section({
  label,
  emoji,
  items,
  onWatchlist,
  onRate,
  onSendRec,
  watchlistTitles,
}: {
  label: string;
  emoji: string;
  items: RecItem[];
  onWatchlist: (item: RecItem) => void;
  onRate: (item: RecItem) => void;
  onSendRec: (item: RecItem) => void;
  watchlistTitles: Set<string>;
}) {
  const [collapsed, setCollapsed] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="mb-2">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-4 py-2.5 active:opacity-70 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{emoji}</span>
          <span className="font-display font-semibold text-text-primary text-sm">{label}</span>
          <span className="text-text-muted text-xs bg-bg-elevated px-1.5 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        <span className="text-text-muted text-xs">{collapsed ? "▼" : "▲"}</span>
      </button>

      {!collapsed && (
        <div className="flex flex-col gap-2 px-4 pb-2">
          {items.map((item) => {
            const onWL = watchlistTitles.has(item.title);
            return (
              <div key={item.id} className="bg-bg-surface rounded-xl p-3 flex items-start gap-3">
                <MiniPoster title={item.title} rating={item.rating} type={item.type} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base text-text-primary truncate">{item.title}</p>
                  <p className="text-text-muted text-sm mt-0.5">
                    {item.year} · {item.genre}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: (item.reasonColor ?? "#8B5CF6") + "22",
                        color: item.reasonColor ?? "#8B5CF6",
                      }}
                    >
                      {item.reason}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <button
                      onClick={() => onRate(item)}
                      className="text-xs bg-accent-purple text-white px-3 py-1.5 rounded-lg font-semibold active:scale-95 transition-all"
                    >
                      Rate
                    </button>
                    <button
                      onClick={() => onWatchlist(item)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold active:scale-95 transition-all border ${
                        onWL
                          ? "border-accent-purple text-accent-purple"
                          : "border-bg-hover text-text-secondary"
                      }`}
                    >
                      {onWL ? "✓ Saved" : "+ Watchlist"}
                    </button>
                    <button
                      onClick={() => onSendRec(item)}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold active:scale-95 transition-all border border-bg-hover text-text-muted flex items-center gap-1"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Send
                    </button>
                  </div>
                </div>
                {item.rating !== undefined && (
                  <div className="shrink-0 mt-0.5">
                    <RatingBadge rating={item.rating} size="sm" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function WhatsNextTab() {
  const {
    movieRatings,
    showRatings,
    watchlist,
    addToWatchlist,
    setActiveTab,
    setPendingAddItem,
  } = useApp();

  const [sendRecItem, setSendRecItem] = useState<{ item: Movie | Show; type: "movie" | "show" } | null>(null);

  const ratedMovieTitles = new Set(movieRatings.map((r) => r.movie.title));
  const ratedShowTitles = new Set(showRatings.map((r) => r.show.title));
  const watchlistTitles = new Set(
    watchlist.map((w) => w.movie?.title ?? w.show?.title ?? (w as any).title ?? "")
  );

  // ── Genre preferences from user's own ratings ──
  const genreScores: Record<string, { total: number; count: number }> = {};
  for (const r of movieRatings) {
    const rawGenre = r.movie.genre;
    const g = Array.isArray(rawGenre) ? rawGenre[0] ?? "" : rawGenre;
    if (!g) continue;
    if (!genreScores[g]) genreScores[g] = { total: 0, count: 0 };
    genreScores[g].total += r.rating;
    genreScores[g].count++;
  }
  for (const r of showRatings) {
    const rawGenre = r.show.genre;
    const g = Array.isArray(rawGenre) ? rawGenre[0] ?? "" : rawGenre;
    if (!g) continue;
    if (!genreScores[g]) genreScores[g] = { total: 0, count: 0 };
    genreScores[g].total += r.overallRating;
    genreScores[g].count++;
  }
  const genreAvg: Record<string, number> = {};
  for (const [g, { total, count }] of Object.entries(genreScores)) {
    genreAvg[g] = total / count;
  }
  const topGenres = Object.entries(genreAvg)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([g]) => g);

  // ── Section 1: Highly Rated by Friends (from friendRatings mock data) ──
  const friendRated: RecItem[] = [];
  for (const [friendId, ratings] of Object.entries(friendRatings)) {
    const friend = friends.find((f) => f.id === friendId);
    if (!friend) continue;
    const match = tasteMatchPercentages[friendId] ?? 70;
    for (const fr of ratings) {
      if (fr.type === "movie" && ratedMovieTitles.has(fr.title)) continue;
      if (fr.type === "show" && ratedShowTitles.has(fr.title)) continue;
      if (fr.rating < 8.0) continue;
      if (friendRated.some((x) => x.title === fr.title)) continue;
      // find the movie/show object from community data
      const communityMovie = communityMovies.find((c) => c.movie?.title === fr.title);
      const communityShow = communityShows.find((c) => c.show?.title === fr.title);
      const rawGenre = communityMovie?.movie?.genre ?? communityShow?.show?.genre ?? "Drama";
      const genre = Array.isArray(rawGenre) ? rawGenre[0] ?? "Drama" : rawGenre;
      friendRated.push({
        id: `fr-${friendId}-${fr.title}`,
        title: fr.title,
        year: fr.year,
        genre,
        type: fr.type,
        reason: `${friend.displayName ?? friend.name} gave it ${fr.rating.toFixed(1)} · ${match}% match`,
        reasonColor: "#A09DB8",
        rating: fr.rating,
        movie: communityMovie?.movie,
        show: communityShow?.show,
      });
    }
  }
  friendRated.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  // ── Section 2: Matches Your Taste (top genre picks from community) ──
  const genreMatch: RecItem[] = [];
  for (const item of communityShows) {
    if (!item.show) continue;
    if (ratedShowTitles.has(item.show.title)) continue;
    if (friendRated.some((fr) => fr.title === item.show!.title)) continue;
    const rawGenre = item.show.genre;
    const g = Array.isArray(rawGenre) ? rawGenre[0] ?? "" : rawGenre;
    if (!topGenres.includes(g)) continue;
    genreMatch.push({
      id: `gm-s-${item.show.id}`,
      title: item.show.title,
      year: item.show.year,
      genre: g,
      type: "show",
      reason: `Top in your ${g} picks · ${item.averageRating.toFixed(1)} avg`,
      reasonColor: "#D4A843",
      rating: item.averageRating,
      show: item.show,
    });
  }
  for (const item of communityMovies) {
    if (!item.movie) continue;
    if (ratedMovieTitles.has(item.movie.title)) continue;
    if (friendRated.some((fr) => fr.title === item.movie!.title)) continue;
    const rawGenre = item.movie.genre;
    const g = Array.isArray(rawGenre) ? rawGenre[0] ?? "" : rawGenre;
    if (!topGenres.includes(g)) continue;
    genreMatch.push({
      id: `gm-m-${item.movie.id}`,
      title: item.movie.title,
      year: item.movie.year,
      genre: g,
      type: "movie",
      reason: `Top in your ${g} picks · ${item.averageRating.toFixed(1)} avg`,
      reasonColor: "#D4A843",
      rating: item.averageRating,
      movie: item.movie,
    });
  }
  genreMatch.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  // ── Section 3: Community Top Picks (highest rated not yet seen) ──
  const communityTop: RecItem[] = [];
  for (const item of [...communityMovies, ...communityShows]) {
    const title = item.movie?.title ?? item.show?.title ?? "";
    if (!title) continue;
    if (ratedMovieTitles.has(title) || ratedShowTitles.has(title)) continue;
    if (friendRated.some((x) => x.title === title)) continue;
    if (genreMatch.some((x) => x.title === title)) continue;
    if (item.averageRating < 8.8) continue;
    const rawGenre = item.movie?.genre ?? item.show?.genre ?? "";
    const genre = Array.isArray(rawGenre) ? rawGenre[0] ?? "" : rawGenre;
    communityTop.push({
      id: `ct-${title}`,
      title,
      year: item.movie?.year ?? item.show?.year ?? 0,
      genre,
      type: item.movie ? "movie" : "show",
      reason: `#${communityTop.length + 1} community · ${item.averageRating.toFixed(1)} avg`,
      reasonColor: "#22C55E",
      rating: item.averageRating,
      movie: item.movie,
      show: item.show,
    });
  }
  communityTop.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  // ── Section 4: Your Watchlist ──
  const watchlistItems: RecItem[] = watchlist.map((w) => {
    const title = w.movie?.title ?? w.show?.title ?? (w as any).title ?? "";
    const year = w.movie?.year ?? w.show?.year ?? (w as any).year ?? 0;
    const rawGenre = w.movie?.genre ?? w.show?.genre ?? (w as any).genre ?? "";
    const genre = Array.isArray(rawGenre) ? rawGenre[0] ?? "" : rawGenre;
    return {
      id: `wl-${w.id}`,
      title,
      year,
      genre,
      type: w.contentType,
      reason: "In your watchlist",
      reasonColor: "#8B5CF6",
      movie: w.movie,
      show: w.show,
    };
  });

  function handleWatchlist(item: RecItem) {
    if (watchlistTitles.has(item.title)) return;
    addToWatchlist({
      id: "wl-" + Date.now(),
      userId: "u1",
      contentId: item.id,
      contentType: item.type,
      title: item.title,
      year: item.year,
      genre: item.genre,
      addedAt: new Date().toISOString(),
      movie: item.movie,
      show: item.show,
    } as any);
  }

  function handleRate(item: RecItem) {
    const isShow = item.type === "show";
    const pendingItem = isShow
      ? { id: item.id, title: item.title, year: item.year, genre: item.genre, totalSeasons: 1 }
      : { id: item.id, title: item.title, year: item.year, genre: item.genre };
    setPendingAddItem(pendingItem as unknown as Parameters<typeof setPendingAddItem>[0]);
    setActiveTab("add");
  }

  function handleSendRec(item: RecItem) {
    const raw = item.movie ?? item.show;
    if (!raw) {
      // fallback: create minimal object
      const minimal = { id: item.id, title: item.title, year: item.year, genre: [item.genre] } as unknown as Movie;
      setSendRecItem({ item: minimal, type: item.type });
      return;
    }
    setSendRecItem({ item: raw, type: item.type });
  }

  const totalRecs = friendRated.length + genreMatch.length + communityTop.length + watchlistItems.length;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="font-display font-bold text-2xl text-text-primary">What&apos;s Next</h1>
        <p className="text-text-muted text-sm mt-0.5">
          {totalRecs > 0
            ? `${totalRecs} picks curated for you`
            : "Start rating to get personalized picks"}
        </p>
      </div>

      {totalRecs === 0 ? (
        <div className="flex flex-col items-center justify-center pt-16 gap-4 px-8 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6B6880" strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <p className="text-text-muted text-sm leading-relaxed">
            Rate a few movies and shows to unlock personalized recommendations
          </p>
          <button
            onClick={() => setActiveTab("add")}
            className="bg-accent-purple text-white px-6 py-2.5 rounded-xl font-semibold text-sm active:scale-95 transition-all"
          >
            Start Rating
          </button>
        </div>
      ) : (
        <div className="pt-1">
          <Section
            label="Friends Recommend"
            emoji="⭐"
            items={friendRated.slice(0, 8)}
            onWatchlist={handleWatchlist}
            onRate={handleRate}
            onSendRec={handleSendRec}
            watchlistTitles={watchlistTitles}
          />
          <Section
            label="Matches Your Taste"
            emoji="🎯"
            items={genreMatch.slice(0, 8)}
            onWatchlist={handleWatchlist}
            onRate={handleRate}
            onSendRec={handleSendRec}
            watchlistTitles={watchlistTitles}
          />
          <Section
            label="Community Top Picks"
            emoji="🔥"
            items={communityTop.slice(0, 8)}
            onWatchlist={handleWatchlist}
            onRate={handleRate}
            onSendRec={handleSendRec}
            watchlistTitles={watchlistTitles}
          />
          <Section
            label="Your Watchlist"
            emoji="🔖"
            items={watchlistItems}
            onWatchlist={handleWatchlist}
            onRate={handleRate}
            onSendRec={handleSendRec}
            watchlistTitles={watchlistTitles}
          />
        </div>
      )}

      {sendRecItem && (
        <SendRecommendationSheet
          item={sendRecItem.item}
          itemType={sendRecItem.type}
          onClose={() => setSendRecItem(null)}
        />
      )}
    </div>
  );
}
