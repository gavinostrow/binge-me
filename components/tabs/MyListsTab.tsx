"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { genres } from "@/lib/mockData";
import { getRatingColor } from "@/lib/utils";
import RatingBadge from "@/components/RatingBadge";

type ListTab = "movies" | "shows" | "watchlist";

// Season trajectory SVG sparkline
function SeasonSparkline({ seasonRatings }: { seasonRatings: { season?: number; seasonNumber?: number; rating: number }[] }) {
  if (seasonRatings.length < 2) return null;
  const W = 200;
  const H = 48;
  const PAD = 8;
  const chartW = W - PAD * 2;
  const chartH = H - PAD * 2;
  const minR = Math.min(...seasonRatings.map((s) => s.rating));
  const maxR = Math.max(...seasonRatings.map((s) => s.rating));
  const range = maxR - minR || 1;
  const pts = seasonRatings.map((s, i) => ({
    x: PAD + (i / (seasonRatings.length - 1)) * chartW,
    y: PAD + chartH - ((s.rating - minR) / range) * chartH,
    rating: s.rating,
    season: s.seasonNumber,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const best = [...seasonRatings].sort((a, b) => b.rating - a.rating)[0];
  const latest = seasonRatings[seasonRatings.length - 1];
  const prev = seasonRatings[seasonRatings.length - 2];
  const trend = latest.rating - prev.rating;

  return (
    <div className="mt-2 bg-bg-surface rounded-lg p-3">
      <div className="flex items-start justify-between mb-2">
        <p className="text-text-muted text-xs">Season trajectory</p>
        <div className="flex gap-3">
          <div className="text-right">
            <p className="text-text-muted text-[10px]">Best</p>
            <p className="text-xs font-semibold" style={{ color: getRatingColor(best.rating) }}>
              S{best.seasonNumber} · {best.rating}
            </p>
          </div>
          <div className="text-right">
            <p className="text-text-muted text-[10px]">Trend</p>
            <p className="text-xs font-semibold" style={{ color: trend >= 0 ? "#22C55E" : "#EF4444" }}>
              {trend >= 0 ? "+" : ""}{trend.toFixed(1)}
            </p>
          </div>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 56 }}>
        {/* Gradient fill */}
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Fill area */}
        <path
          d={`${pathD} L${pts[pts.length - 1].x.toFixed(1)},${(H - PAD).toFixed(1)} L${pts[0].x.toFixed(1)},${(H - PAD).toFixed(1)} Z`}
          fill="url(#sparkGrad)"
        />
        {/* Line */}
        <path d={pathD} fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {pts.map((p) => (
          <circle key={p.season} cx={p.x} cy={p.y} r="3" fill={getRatingColor(p.rating)} stroke="#0D0D12" strokeWidth="1.5" />
        ))}
      </svg>
      {/* Season labels */}
      <div className="flex justify-between px-2">
        {seasonRatings.map((s) => (
          <span key={s.seasonNumber} className="text-[10px] text-text-muted">
            S{s.seasonNumber}
          </span>
        ))}
      </div>
    </div>
  );
}

// Genre breakdown bar
function GenreBreakdown({ genres }: { genres: { name: string; count: number }[] }) {
  const total = genres.reduce((sum, g) => sum + g.count, 0);
  if (total === 0) return null;
  const top = genres.slice(0, 5);
  const COLORS = ["#8B5CF6", "#22C55E", "#EAB308", "#EC4899", "#06B6D4"];
  return (
    <div className="px-4 pb-3">
      <div className="bg-bg-surface rounded-xl p-3.5">
        <p className="text-text-muted text-xs font-medium mb-2">Genre breakdown</p>
        {/* Stacked bar */}
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-3">
          {top.map((g, i) => (
            <div
              key={g.name}
              style={{ width: `${(g.count / total) * 100}%`, backgroundColor: COLORS[i] }}
            />
          ))}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {top.map((g, i) => (
            <div key={g.name} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
              <span className="text-text-secondary text-xs">{g.name}</span>
              <span className="text-text-muted text-xs">({g.count})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Inline mini poster placeholder
function MiniPoster({
  title,
  rating,
}: {
  title: string;
  rating?: number;
}) {
  const bg = rating
    ? getRatingColor(rating) + "33"
    : "#8B5CF633";
  const color = rating ? getRatingColor(rating) : "#8B5CF6";
  const initials = title
    .split(" ")
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

// Inline edit modal for a movie rating
function EditMovieModal({
  id,
  title,
  currentRating,
  onSave,
  onCancel,
}: {
  id: string;
  title: string;
  currentRating: number;
  onSave: (id: string, rating: number) => void;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(currentRating);
  const color = getRatingColor(rating);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-bg-surface rounded-t-2xl w-full max-w-app p-6 pb-8 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-text-primary text-lg">
            Edit Rating
          </h2>
          <button onClick={onCancel} className="text-text-muted hover:text-text-primary transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <p className="text-text-secondary text-sm">{title}</p>
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl font-display font-bold transition-colors duration-200" style={{ color }}>
            {rating.toFixed(1)}
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="0.1"
            value={rating}
            onChange={(e) => setRating(parseFloat(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-bg-elevated"
            style={{ accentColor: color, "--thumb-color": color } as React.CSSProperties}
          />
          <div className="flex justify-between w-full text-text-muted text-xs">
            <span>1</span><span>10</span>
          </div>
        </div>
        <button
          onClick={() => onSave(id, rating)}
          className="bg-accent-purple text-white rounded-lg py-3 font-semibold w-full hover:opacity-90 active:scale-95 transition-all"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default function MyListsTab() {
  const {
    movieRatings,
    showRatings,
    watchlist,
    removeFromWatchlist,
    deleteMovieRating,
    deleteShowRating,
    updateMovieRating,
    setActiveTab,
    setPendingAddItem,
  } = useApp();

  const [listTab, setListTab] = useState<ListTab>("movies");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [expandedShowId, setExpandedShowId] = useState<string | null>(null);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [editingMovie, setEditingMovie] = useState<{
    id: string;
    title: string;
    rating: number;
  } | null>(null);

  const filteredMovies = movieRatings
    .filter((mr) => selectedGenre === "All" || [mr.movie.genre].flat().includes(selectedGenre))
    .sort((a, b) => b.rating - a.rating);

  const filteredShows = showRatings
    .filter((sr) => selectedGenre === "All" || [sr.show.genre].flat().includes(selectedGenre))
    .sort((a, b) => b.overallRating - a.overallRating);

  const sortedWatchlist = [...watchlist].sort(
    (a, b) => new Date(b.addedAt ?? b.addedDate ?? 0).getTime() - new Date(a.addedAt ?? a.addedDate ?? 0).getTime()
  );

  // Genre breakdown for movies/shows
  function getGenreBreakdown(items: { genre: string }[]) {
    const counts: Record<string, number> = {};
    for (const item of items) {
      counts[item.genre] = (counts[item.genre] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  const movieGenres = getGenreBreakdown(movieRatings.map((mr) => ({ genre: Array.isArray(mr.movie.genre) ? mr.movie.genre[0] ?? "" : mr.movie.genre })));
  const showGenres = getGenreBreakdown(showRatings.map((sr) => ({ genre: Array.isArray(sr.show.genre) ? sr.show.genre[0] ?? "" : sr.show.genre })));

  function handleRateFromWatchlist(item: typeof watchlist[0]) {
    const isShow = item.contentType === "show";
    // Build a minimal Movie/Show shape for AddTab pendingAddItem
    const pendingItem = isShow
      ? {
          id: item.contentId,
          title: item.title,
          year: item.year,
          genre: item.genre,
          totalSeasons: 1,
        }
      : {
          id: item.contentId,
          title: item.title,
          year: item.year,
          genre: item.genre,
        };
    setPendingAddItem(pendingItem as Parameters<typeof setPendingAddItem>[0]);
    setActiveTab("add");
  }

  return (
    <div className="min-h-full pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="font-display font-bold text-xl">My Lists</h1>
      </div>

      {/* 3-way tab: Movies / Shows / Watchlist */}
      <div className="px-4">
        <div className="flex bg-bg-elevated rounded-lg p-1">
          {(["movies", "shows", "watchlist"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setListTab(tab);
                setSelectedGenre("All");
                setSwipedId(null);
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                listTab === tab
                  ? "bg-bg-hover text-text-primary"
                  : "text-text-secondary"
              }`}
            >
              {tab === "watchlist" ? (
                <span className="flex items-center justify-center gap-1">
                  Watchlist
                  {watchlist.length > 0 && (
                    <span className="bg-accent-purple text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                      {watchlist.length}
                    </span>
                  )}
                </span>
              ) : (
                tab.charAt(0).toUpperCase() + tab.slice(1)
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Genre filter — only for movies/shows */}
      {listTab !== "watchlist" && (
        <div className="px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`whitespace-nowrap text-sm px-3 py-1.5 rounded-full transition-colors active:scale-95 ${
                  selectedGenre === genre
                    ? "bg-accent-purple/20 text-accent-purple"
                    : "bg-bg-elevated text-text-secondary"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Genre breakdown */}
      {listTab === "movies" && movieRatings.length > 0 && (
        <GenreBreakdown genres={movieGenres} />
      )}
      {listTab === "shows" && showRatings.length > 0 && (
        <GenreBreakdown genres={showGenres} />
      )}

      {/* Movies list */}
      {listTab === "movies" && (
        <div className="flex flex-col gap-2 px-4 pt-2">
          {filteredMovies.length > 0 ? (
            filteredMovies.map((mr, index) => (
              <div key={mr.id} className="relative">
                {/* Swipe action buttons */}
                {swipedId === mr.id && (
                  <div className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-2 z-10">
                    <button
                      onClick={() => {
                        setEditingMovie({
                          id: mr.id,
                          title: mr.movie.title,
                          rating: mr.rating,
                        });
                        setSwipedId(null);
                      }}
                      className="bg-accent-purple text-white text-xs font-semibold px-3 py-2 rounded-lg active:scale-95 transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        deleteMovieRating(mr.id);
                        setSwipedId(null);
                      }}
                      className="bg-red-500/80 text-white text-xs font-semibold px-3 py-2 rounded-lg active:scale-95 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                )}
                <div
                  onClick={() =>
                    setSwipedId(swipedId === mr.id ? null : mr.id)
                  }
                  className={`bg-bg-surface rounded-xl p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all ${
                    swipedId === mr.id ? "opacity-50" : ""
                  }`}
                >
                  <span className="text-text-muted font-display text-base w-6 shrink-0 text-center">
                    {index + 1}
                  </span>
                  <MiniPoster title={mr.movie.title} rating={mr.rating} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-text-primary">
                      {mr.movie.title}
                    </p>
                    <p className="text-text-muted text-sm">
                      {mr.movie.year} &middot; {mr.movie.genre}
                    </p>
                  </div>
                  <div className="shrink-0 ml-2">
                    <RatingBadge rating={mr.rating} size="sm" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-text-muted text-sm">No movies rated yet.</p>
              <button
                onClick={() => setActiveTab("add")}
                className="mt-3 text-accent-purple text-sm font-medium active:opacity-70 transition-opacity"
              >
                Rate your first movie →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Shows list */}
      {listTab === "shows" && (
        <div className="flex flex-col gap-2 px-4 pt-2">
          {filteredShows.length > 0 ? (
            filteredShows.map((sr, index) => (
              <div key={sr.id} className="relative">
                {swipedId === sr.id && (
                  <div className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-2 z-10">
                    <button
                      onClick={() => {
                        deleteShowRating(sr.id);
                        setSwipedId(null);
                      }}
                      className="bg-red-500/80 text-white text-xs font-semibold px-3 py-2 rounded-lg active:scale-95 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                )}
                <div>
                  <div
                    onClick={() => {
                      if (swipedId === sr.id) {
                        setSwipedId(null);
                      } else if (swipedId) {
                        setSwipedId(null);
                      } else {
                        setExpandedShowId(
                          expandedShowId === sr.id ? null : sr.id
                        );
                      }
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSwipedId(swipedId === sr.id ? null : sr.id);
                    }}
                    className={`bg-bg-surface rounded-xl p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all ${
                      swipedId === sr.id ? "opacity-50" : ""
                    }`}
                  >
                    <span className="text-text-muted font-display text-base w-6 shrink-0 text-center">
                      {index + 1}
                    </span>
                    <MiniPoster title={sr.show.title} rating={sr.overallRating} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-text-primary">
                        {sr.show.title}
                      </p>
                      <p className="text-text-muted text-sm">
                        {sr.show.year} &middot; {sr.show.genre}
                      </p>
                      <p className="text-text-muted text-xs">
                        {sr.show.totalSeasons} seasons
                      </p>
                    </div>
                    <div className="shrink-0 ml-2 flex flex-col items-end gap-1">
                      <RatingBadge rating={sr.overallRating} size="sm" />
                      {sr.seasonRatings.length > 0 && (
                        <span className="text-text-muted text-xs">
                          {expandedShowId === sr.id ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded season ratings */}
                  {expandedShowId === sr.id && sr.seasonRatings.length > 0 && (
                    <div className="bg-bg-elevated rounded-lg p-3 mt-1">
                      <div className="space-y-2 mb-1">
                        {sr.seasonRatings.map((season) => (
                          <div
                            key={season.seasonNumber}
                            className="flex items-center gap-3"
                          >
                            <span className="text-text-secondary text-sm whitespace-nowrap w-20 shrink-0">
                              S{season.seasonNumber}
                            </span>
                            <div className="flex-1 h-1.5 bg-bg-hover rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${(season.rating / 10) * 100}%`,
                                  backgroundColor: getRatingColor(season.rating),
                                }}
                              />
                            </div>
                            <span
                              className="text-sm font-medium w-8 text-right shrink-0"
                              style={{ color: getRatingColor(season.rating) }}
                            >
                              {season.rating.toFixed(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                      {sr.seasonRatings.length >= 2 && (
                        <SeasonSparkline seasonRatings={sr.seasonRatings} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-text-muted text-sm">No shows rated yet.</p>
              <button
                onClick={() => setActiveTab("add")}
                className="mt-3 text-accent-purple text-sm font-medium active:opacity-70 transition-opacity"
              >
                Rate your first show →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Watchlist */}
      {listTab === "watchlist" && (
        <div className="flex flex-col gap-2 px-4 pt-4">
          {sortedWatchlist.length > 0 ? (
            sortedWatchlist.map((item) => (
              <div
                key={item.id}
                className="bg-bg-surface rounded-xl p-3 flex items-center gap-3"
              >
                <MiniPoster title={item.title ?? ""} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-text-primary">
                    {item.title ?? ""}
                  </p>
                  <p className="text-text-muted text-sm">
                    {item.year} &middot; {item.genre} &middot;{" "}
                    <span className="capitalize">{item.contentType}</span>
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => handleRateFromWatchlist(item)}
                    className="text-xs bg-accent-purple text-white px-2.5 py-1.5 rounded-lg font-semibold active:scale-95 transition-all"
                  >
                    Rate
                  </button>
                  <button
                    onClick={() => removeFromWatchlist(item.id)}
                    className="text-xs text-text-muted hover:text-text-secondary px-2.5 py-1 active:opacity-60 transition-opacity text-center"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-text-muted text-sm">
                Your watchlist is empty.
              </p>
              <button
                onClick={() => setActiveTab("next")}
                className="mt-3 text-accent-purple text-sm font-medium active:opacity-70 transition-opacity"
              >
                Spin for a recommendation →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Edit movie modal */}
      {editingMovie && (
        <EditMovieModal
          id={editingMovie.id}
          title={editingMovie.title}
          currentRating={editingMovie.rating}
          onSave={(id, rating) => {
            updateMovieRating(id, rating);
            setEditingMovie(null);
          }}
          onCancel={() => setEditingMovie(null)}
        />
      )}
    </div>
  );
}
