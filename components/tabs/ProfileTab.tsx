"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { ContentType } from "@/lib/types";
import { currentUser, friends, genres } from "@/lib/mockData";
import { getRatingColor, getInitial, timeAgo } from "@/lib/utils";
import RatingBadge from "@/components/RatingBadge";

export default function ProfileTab() {
  const { movieRatings, showRatings } = useApp();

  // Lists state (moved from MyListsTab)
  const [contentType, setContentType] = useState<ContentType>("movie");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [expandedShowId, setExpandedShowId] = useState<string | null>(null);

  // Stats
  const movieCount = movieRatings.length;
  const showCount = showRatings.length;
  const episodeCount = showRatings.reduce(
    (sum, sr) => sum + sr.seasonRatings.length,
    0
  );
  const friendCount = friends.length;

  // Genre calculation
  const genreMap: Record<string, number> = {};
  let totalGenreEntries = 0;

  movieRatings.forEach((mr) => {
    const g = mr.movie.genre;
    if (g) {
      genreMap[g] = (genreMap[g] || 0) + 1;
      totalGenreEntries++;
    }
  });

  showRatings.forEach((sr) => {
    const g = sr.show.genre;
    if (g) {
      genreMap[g] = (genreMap[g] || 0) + 1;
      totalGenreEntries++;
    }
  });

  const topGenres = Object.entries(genreMap)
    .map(([genre, count]) => ({
      genre,
      percentage: totalGenreEntries > 0 ? Math.round((count / totalGenreEntries) * 100) : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  // Average rating
  const allRatings = [
    ...movieRatings.map((mr) => mr.rating),
    ...showRatings.map((sr) => sr.overallRating),
  ];
  const avgRating =
    allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
      : 0;
  const totalRatings = allRatings.length;

  // Recent activity
  const recentActivity = [
    ...movieRatings.map((mr) => ({
      title: mr.movie.title,
      rating: mr.rating,
      createdAt: mr.createdAt,
      type: "movie" as const,
    })),
    ...showRatings.map((sr) => ({
      title: sr.show.title,
      rating: sr.overallRating,
      createdAt: sr.createdAt,
      type: "show" as const,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  // Filtered lists
  const filteredMovies = movieRatings
    .filter((mr) => selectedGenre === "All" || mr.movie.genre === selectedGenre)
    .sort((a, b) => b.rating - a.rating);

  const filteredShows = showRatings
    .filter((sr) => selectedGenre === "All" || sr.show.genre === selectedGenre)
    .sort((a, b) => b.overallRating - a.overallRating);

  return (
    <div className="px-4 pb-24">
      {/* Profile Header */}
      <div className="pt-8 pb-4 flex flex-col items-center text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: currentUser.avatarColor }}
        >
          <span className="text-2xl font-bold text-white">
            {getInitial(currentUser.displayName)}
          </span>
        </div>
        <h2 className="font-display font-bold text-xl mt-3">
          {currentUser.displayName}
        </h2>
        <p className="text-text-secondary text-sm">{currentUser.handle}</p>
        <p className="text-text-muted text-sm mt-1 text-center max-w-[280px] mx-auto">
          {currentUser.bio}
        </p>
      </div>

      {/* Mount Rushmore */}
      <div className="bg-bg-surface rounded-xl p-4 mt-4">
        <div className="w-8 h-0.5 bg-accent-gold rounded mb-3"></div>
        <h3 className="text-accent-gold text-xs font-display font-bold tracking-widest uppercase">
          MOUNT RUSHMORE
        </h3>
        <div className="grid grid-cols-2 gap-3 mt-3">
          {currentUser.mountRushmore.map((item, index) => (
            <div key={index} className="bg-bg-elevated rounded-lg p-3">
              <span className="text-text-muted text-xs">{index + 1}</span>
              <p className="font-medium text-sm">{item.title}</p>
              <span className="text-xs text-text-muted">
                {item.type === "movie" ? "Movie" : "Show"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Button */}
      <button className="w-full mt-4 bg-bg-surface border border-bg-elevated rounded-lg py-2.5 text-text-secondary text-sm font-medium text-center">
        Edit Profile
      </button>

      {/* Stats Grid */}
      <div className="mt-6 grid grid-cols-4 gap-2">
        {[
          { count: movieCount, label: "Movies" },
          { count: showCount, label: "Shows" },
          { count: episodeCount, label: "Seasons" },
          { count: friendCount, label: "Friends" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-bg-surface rounded-lg p-3 text-center"
          >
            <div className="font-display font-bold text-lg">{stat.count}</div>
            <div className="text-text-muted text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* My Rankings (moved from MyListsTab) */}
      <div className="mt-6">
        <h3 className="font-display font-semibold mb-3">My Rankings</h3>

        {/* Movie / Show toggle */}
        <div className="flex bg-bg-elevated rounded-lg p-1">
          <button
            onClick={() => {
              setContentType("movie");
              setSelectedGenre("All");
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              contentType === "movie"
                ? "bg-bg-hover text-text-primary"
                : "text-text-secondary"
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => {
              setContentType("show");
              setSelectedGenre("All");
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              contentType === "show"
                ? "bg-bg-hover text-text-primary"
                : "text-text-secondary"
            }`}
          >
            Shows
          </button>
        </div>

        {/* Genre filter */}
        <div className="py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`whitespace-nowrap text-sm px-3 py-1.5 rounded-full transition-colors ${
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

        {/* Ranked list */}
        <div>
          {contentType === "movie" ? (
            filteredMovies.length > 0 ? (
              filteredMovies.map((mr, index) => (
                <div
                  key={mr.id}
                  className="bg-bg-surface rounded-xl p-3 mb-2 flex items-center gap-3"
                >
                  <span className="text-text-muted font-display text-base w-6 shrink-0 text-center">
                    {index + 1}
                  </span>
                  {mr.movie.posterUrl ? (
                    <img
                      src={mr.movie.posterUrl}
                      alt={mr.movie.title}
                      className="w-10 h-14 rounded object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-14 rounded bg-bg-elevated shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{mr.movie.title}</p>
                    <p className="text-text-muted text-sm">
                      {mr.movie.year} &middot; {mr.movie.genre}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <RatingBadge rating={mr.rating} size="sm" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-text-muted text-sm text-center py-8">
                No movies rated yet.
              </p>
            )
          ) : filteredShows.length > 0 ? (
            filteredShows.map((sr, index) => (
              <div key={sr.id} className="mb-2">
                <div
                  onClick={() =>
                    setExpandedShowId(
                      expandedShowId === sr.id ? null : sr.id
                    )
                  }
                  className="bg-bg-surface rounded-xl p-3 flex items-center gap-3 cursor-pointer"
                >
                  <span className="text-text-muted font-display text-base w-6 shrink-0 text-center">
                    {index + 1}
                  </span>
                  {sr.show.posterUrl ? (
                    <img
                      src={sr.show.posterUrl}
                      alt={sr.show.title}
                      className="w-10 h-14 rounded object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-14 rounded bg-bg-elevated shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{sr.show.title}</p>
                    <p className="text-text-muted text-sm">
                      {sr.show.year} &middot; {sr.show.genre}
                    </p>
                    <p className="text-text-muted text-sm">
                      {sr.show.totalSeasons} seasons
                    </p>
                  </div>
                  <div className="shrink-0">
                    <RatingBadge rating={sr.overallRating} size="sm" />
                  </div>
                </div>

                {/* Expanded season ratings */}
                {expandedShowId === sr.id && sr.seasonRatings.length > 0 && (
                  <div className="bg-bg-elevated rounded-lg p-3 mt-2">
                    <div className="space-y-2">
                      {sr.seasonRatings.map((season) => (
                        <div
                          key={season.seasonNumber}
                          className="flex items-center gap-3"
                        >
                          <span className="text-text-secondary text-sm whitespace-nowrap w-20 shrink-0">
                            Season {season.seasonNumber}
                          </span>
                          <div className="flex-1 h-2 bg-bg-hover rounded-full overflow-hidden">
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
                            {season.rating}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-text-muted text-sm text-center py-8">
              No shows rated yet.
            </p>
          )}
        </div>
      </div>

      {/* Top Genres */}
      <div className="mt-6 bg-bg-surface rounded-xl p-4">
        <h3 className="font-display font-semibold mb-3">Top Genres</h3>
        <div className="space-y-3">
          {topGenres.map((g) => (
            <div key={g.genre}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">{g.genre}</span>
                <span className="text-text-muted text-sm">{g.percentage}%</span>
              </div>
              <div className="h-2 rounded-full bg-bg-elevated">
                <div
                  className="h-2 rounded-full bg-accent-purple"
                  style={{ width: `${g.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Avg. Rating Given */}
      <div className="mt-4 bg-bg-surface rounded-xl p-4">
        <h3 className="font-display font-semibold mb-3">Avg. Rating Given</h3>
        <div className="flex items-baseline gap-2">
          <span
            className="text-3xl font-display font-bold"
            style={{ color: getRatingColor(avgRating) }}
          >
            {avgRating.toFixed(1)}
          </span>
        </div>
        <p className="text-text-muted text-sm">
          {totalRatings} total ratings
        </p>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 mb-4">
        <h3 className="font-display font-semibold mb-3">Recent Activity</h3>
        <div>
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-accent-purple mt-2 shrink-0"></div>
              <div>
                <p className="text-sm">
                  Rated {activity.title}{" "}
                  <span style={{ color: getRatingColor(activity.rating) }} className="font-bold">
                    {activity.rating.toFixed(1)}
                  </span>
                </p>
                <p className="text-text-muted text-xs" suppressHydrationWarning>
                  {timeAgo(activity.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
