"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { useApp } from "@/lib/AppContext";
import PosterImage from "@/components/PosterImage";
import RatingBadge from "@/components/RatingBadge";
import {
  movies,
  shows,
  friends,
  friendsMovieRatings,
  friendsShowRatings,
  communityMovies,
  communityShows,
} from "@/lib/mockData";
import type { Movie, Show, User } from "@/lib/types";
import { getInitial } from "@/lib/utils";

type SearchTab = "all" | "movies" | "shows" | "friends";

const FRIEND_COLORS = ["#7C5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"];
function friendColor(userId: string) {
  return FRIEND_COLORS[parseInt(userId.replace(/\D/g, "")) % FRIEND_COLORS.length];
}

function getFriendAvgMovie(movieId: string): number | null {
  const ratings = friendsMovieRatings[movieId];
  if (!ratings || ratings.length === 0) return null;
  return ratings.reduce((s, r) => s + r.rating, 0) / ratings.length;
}

function getFriendAvgShow(showId: string): number | null {
  const ratings = friendsShowRatings[showId];
  if (!ratings || ratings.length === 0) return null;
  return ratings.reduce((s, r) => s + r.rating, 0) / ratings.length;
}

function getCommunityMovie(movieId: string) {
  return communityMovies.find((c) => c.movie?.id === movieId);
}

function getCommunityShow(showId: string) {
  return communityShows.find((c) => c.show?.id === showId);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] font-body font-semibold uppercase tracking-widest text-text-muted mb-3 px-1">
        {title}
      </p>
      <div className="bg-bg-card rounded-2xl border border-border divide-y divide-border px-4">
        {children}
      </div>
    </div>
  );
}

function RatingLegend() {
  const legend = [
    { label: "Friends avg", color: "#7C5CF6", icon: "👥" },
    { label: "Community avg", color: "#D4A843", icon: "🌐" },
  ];
  return (
    <div className="flex gap-4 mb-4 px-1">
      {legend.map((l) => (
        <div key={l.label} className="flex items-center gap-1.5">
          <span className="text-xs">{l.icon}</span>
          <span className="text-[10px] font-body text-text-muted">{l.label}</span>
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: l.color }}
          />
        </div>
      ))}
    </div>
  );
}

function FriendRow({ user, onPress }: { user: User; onPress: () => void }) {
  const tasteMatchMap: Record<string, number> = { u2: 87, u3: 74, u4: 62, u5: 79 };
  const match = tasteMatchMap[user.id];
  return (
    <button
      onClick={onPress}
      className="flex items-center gap-3 py-3 border-b border-border last:border-0 w-full text-left active:opacity-80 transition-opacity"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-display font-bold text-white flex-shrink-0"
        style={{ backgroundColor: friendColor(user.id) }}
      >
        {getInitial(user.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-text-primary text-sm">{user.name}</p>
        <p className="text-text-muted text-xs font-body">@{user.username}</p>
      </div>
      {match && (
        <span
          className="text-xs font-body font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: "#7C5CF620", color: "#7C5CF6" }}
        >
          {match}% match
        </span>
      )}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#55556A"
        strokeWidth={2}
        strokeLinecap="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}

function MovieRow({ movie, onPress }: { movie: Movie; onPress: () => void }) {
  const friendAvg = getFriendAvgMovie(movie.id);
  const community = getCommunityMovie(movie.id);
  return (
    <button
      onClick={onPress}
      className="flex items-center gap-3 py-3 border-b border-border last:border-0 w-full text-left active:opacity-80 transition-opacity"
    >
      <PosterImage
        title={movie.title}
        year={movie.year}
        posterPath={movie.posterPath}
        size="sm"
        className="w-10 h-14 rounded-lg flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-text-primary text-sm truncate">{movie.title}</p>
        <p className="text-text-muted text-xs mt-0.5">{movie.year} · {movie.genre[0]}</p>
        <div className="flex items-center gap-3 mt-1.5">
          {friendAvg !== null && (
            <span className="text-[10px] font-body font-semibold" style={{ color: "#7C5CF6" }}>
              👥 {friendAvg.toFixed(1)}
            </span>
          )}
          {community && (
            <span className="text-[10px] font-body font-semibold" style={{ color: "#D4A843" }}>
              🌐 {community.averageRating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#55556A" strokeWidth={2} strokeLinecap="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}

function ShowRow({ show, onPress }: { show: Show; onPress: () => void }) {
  const friendAvg = getFriendAvgShow(show.id);
  const community = getCommunityShow(show.id);
  return (
    <button
      onClick={onPress}
      className="flex items-center gap-3 py-3 border-b border-border last:border-0 w-full text-left active:opacity-80 transition-opacity"
    >
      <PosterImage
        title={show.title}
        year={show.year}
        posterPath={show.posterPath}
        size="sm"
        className="w-10 h-14 rounded-lg flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-text-primary text-sm truncate">{show.title}</p>
        <p className="text-text-muted text-xs mt-0.5">
          {show.year} · {show.seasons ?? show.totalSeasons} seasons
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          {friendAvg !== null && (
            <span className="text-[10px] font-body font-semibold" style={{ color: "#7C5CF6" }}>
              👥 {friendAvg.toFixed(1)}
            </span>
          )}
          {community && (
            <span className="text-[10px] font-body font-semibold" style={{ color: "#D4A843" }}>
              🌐 {community.averageRating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#55556A" strokeWidth={2} strokeLinecap="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}

export default function SearchScreen({ initialQuery }: { initialQuery?: string }) {
  const { pushScreen, popScreen } = useApp();
  const [query, setQuery] = useState(initialQuery ?? "");
  const [tab, setTab] = useState<SearchTab>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 120);
  }, []);

  const q = query.trim().toLowerCase();

  const matchedFriends = useMemo(
    () => friends.filter((f) => f.name.toLowerCase().includes(q) || f.username.toLowerCase().includes(q)),
    [q]
  );

  const matchedMovies = useMemo(
    () =>
      movies.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.genre.some((g) => g.toLowerCase().includes(q)) ||
          m.director?.toLowerCase().includes(q) ||
          m.cast?.some((a) => a.toLowerCase().includes(q))
      ),
    [q]
  );

  const matchedShows = useMemo(
    () =>
      shows.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.genre.some((g) => g.toLowerCase().includes(q)) ||
          s.network?.toLowerCase().includes(q) ||
          s.cast?.some((a) => a.toLowerCase().includes(q))
      ),
    [q]
  );

  const showEmpty = !q;
  const tabs: { id: SearchTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "movies", label: "Movies" },
    { id: "shows", label: "Shows" },
    { id: "friends", label: "Friends" },
  ];

  const showFriends = tab === "all" || tab === "friends";
  const showMovies = tab === "all" || tab === "movies";
  const showShows = tab === "all" || tab === "shows";

  const displayFriends = showEmpty ? friends : matchedFriends;
  const displayMovies = showEmpty ? movies.slice(0, 10) : matchedMovies;
  const displayShows = showEmpty ? shows.slice(0, 10) : matchedShows;
  const hasResults =
    displayFriends.length > 0 || displayMovies.length > 0 || displayShows.length > 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-bg-primary">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-bg-primary/95 backdrop-blur-md px-4 pt-6 pb-3 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={popScreen}
            className="w-8 h-8 rounded-full bg-bg-card border border-border flex items-center justify-center flex-shrink-0 active:scale-95 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Movies, shows, actors, friends..."
              className="w-full bg-bg-card border border-border rounded-xl pl-9 pr-9 py-2.5 text-text-primary placeholder-text-muted font-body text-sm focus:outline-none focus:border-accent transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-body font-semibold border transition-all ${
                tab === t.id
                  ? "bg-accent border-accent text-white"
                  : "border-border text-text-secondary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-24">
        {showEmpty && (
          <p className="text-[10px] font-body font-semibold uppercase tracking-widest text-text-muted mb-4 px-1">
            Browse
          </p>
        )}
        {!hasResults && q && (
          <div className="text-center py-16 text-text-muted flex flex-col items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" className="opacity-40">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p className="font-body text-sm">No results for &ldquo;{query}&rdquo;</p>
          </div>
        )}
        {(showMovies || showShows) && hasResults && <RatingLegend />}
        {showFriends && displayFriends.length > 0 && (
          <Section title="Friends">
            {displayFriends.map((f) => (
              <FriendRow
                key={f.id}
                user={f}
                onPress={() => pushScreen({ screen: "profile", userId: f.id })}
              />
            ))}
          </Section>
        )}
        {showMovies && displayMovies.length > 0 && (
          <Section title="Movies">
            {displayMovies.map((m) => (
              <MovieRow
                key={m.id}
                movie={m}
                onPress={() => pushScreen({ screen: "movie-detail", movieId: m.id })}
              />
            ))}
          </Section>
        )}
        {showShows && displayShows.length > 0 && (
          <Section title="Shows">
            {displayShows.map((s) => (
              <ShowRow
                key={s.id}
                show={s}
                onPress={() => pushScreen({ screen: "show-detail", showId: s.id })}
              />
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}
