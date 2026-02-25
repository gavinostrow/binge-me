"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { ContentType } from "@/lib/types";
import { genres } from "@/lib/mockData";
import { getRatingColor } from "@/lib/utils";
import RatingBadge from "@/components/RatingBadge";

export default function MyListsTab() {
  const { movieRatings, showRatings } = useApp();
  const [contentType, setContentType] = useState<ContentType>("movie");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [expandedShowId, setExpandedShowId] = useState<string | null>(null);

  const filteredMovies = movieRatings
    .filter((mr) => selectedGenre === "All" || mr.movie.genre.includes(selectedGenre))
    .sort((a, b) => b.rating - a.rating);

  const filteredShows = showRatings
    .filter((sr) => selectedGenre === "All" || sr.show.genre.includes(selectedGenre))
    .sort((a, b) => b.overallRating - a.overallRating);

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="font-display font-bold text-xl">My Lists</h1>
      </div>

      {/* Movie / Show toggle */}
      <div className="px-4">
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
      </div>

      {/* Genre filter */}
      <div className="px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
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
      <div className="pb-4">
        {contentType === "movie" ? (
          filteredMovies.length > 0 ? (
            filteredMovies.map((mr, index) => (
              <div
                key={mr.id}
                className="bg-bg-surface rounded-xl p-3 mx-4 mb-2 flex items-center gap-3"
              >
                <span className="text-text-muted font-display text-base w-6 shrink-0 text-center">
                  {index + 1}
                </span>
                {mr.movie.posterPath ? (
                  <img
                    src={mr.movie.posterPath}
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
            <p className="text-text-muted text-sm text-center py-8 px-4">
              No movies rated yet.
            </p>
          )
        ) : filteredShows.length > 0 ? (
          filteredShows.map((sr, index) => (
            <div key={sr.id} className="mx-4 mb-2">
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
                {sr.show.posterPath ? (
                  <img
                    src={sr.show.posterPath}
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
                    {sr.show.seasons ?? sr.show.totalSeasons} seasons
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
          <p className="text-text-muted text-sm text-center py-8 px-4">
            No shows rated yet.
          </p>
        )}
      </div>
    </div>
  );
}
