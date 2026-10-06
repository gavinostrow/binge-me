"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/AppContext";
import { useSocial } from "@/lib/SocialContext";
import { Show } from "@/lib/types";
import { searchableShows } from "@/lib/mockData";
import { getShow } from "@/lib/catalog";
import { mergeById, useLiveSearch } from "@/lib/useLiveSearch";
import { getRatingColor } from "@/lib/utils";

type Step = "search" | "rate" | "rate-seasons" | "confirm";

export default function AddTab() {
  const { addShowRating, setActiveTab, getMyShowRating } = useApp();
  const { pendingRate, clearPendingRate } = useSocial();

  const [step, setStep] = useState<Step>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [rating, setRating] = useState(7.0);
  const [rateSeasons, setRateSeasons] = useState(false);
  const [seasonsWatched, setSeasonsWatched] = useState(1);
  const [seasonRatings, setSeasonRatings] = useState<number[]>([7.0]);

  const resetFlow = () => {
    setStep("search");
    setSearchQuery("");
    setSelectedShow(null);
    setRating(7.0);
    setRateSeasons(false);
    setSeasonsWatched(1);
    setSeasonRatings([7.0]);
  };

  const handleSelectShow = (show: Show) => {
    setSelectedShow(show);
    setRating(7.0);
    setSeasonsWatched(1);
    setRateSeasons(false);
    setSeasonRatings([7.0]);
    setStep("rate");
  };

  // Arriving from "Finished Season N" (or another screen asking to rate a title)
  useEffect(() => {
    if (!pendingRate) return;
    {
      const show = getShow(pendingRate.id);
      if (show) {
        setSelectedShow(show);
        const existing = getMyShowRating(show.id);
        const upTo = Math.max(pendingRate.season ?? 1, existing?.seasonRatings.length ?? 0);
        setRating(existing?.overallRating ?? 7.0);
        setSeasonsWatched(upTo);
        setSeasonRatings(
          Array.from({ length: upTo }, (_, i) => existing?.seasonRatings.find((r) => r.season === i + 1)?.rating ?? 7.0),
        );
        setRateSeasons(true);
        setStep(pendingRate.season ? "rate-seasons" : "rate");
      }
    }
    clearPendingRate();
  }, [pendingRate]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSeasonsWatchedChange = (delta: number) => {
    if (!selectedShow) return;
    const newCount = Math.min(
      Math.max(1, seasonsWatched + delta),
      selectedShow.seasons ?? selectedShow.totalSeasons ?? 99
    );
    setSeasonsWatched(newCount);
    setSeasonRatings((prev) => {
      const updated = [...prev];
      while (updated.length < newCount) {
        updated.push(7.0);
      }
      return updated.slice(0, newCount);
    });
  };

  const handleSeasonRatingChange = (index: number, value: number) => {
    setSeasonRatings((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleAddShow = () => {
    if (!selectedShow) return;
    const seasonRatingsArray = rateSeasons
      ? seasonRatings.slice(0, seasonsWatched).map((r, i) => ({
          season: i + 1,
          rating: r,
        }))
      : [];
    addShowRating({
      id: "sr-" + Date.now(),
      userId: "u1",
      show: selectedShow,
      overallRating: rating,
      seasonRatings: seasonRatingsArray,
      createdAt: new Date().toISOString(),
    });
    setStep("confirm");
  };

  const live = useLiveSearch(step === "search" ? searchQuery : "");
  const filteredResults: Show[] =
    searchQuery.length >= 2
      ? mergeById(
          searchableShows.filter((s) =>
            s.title.toLowerCase().includes(searchQuery.toLowerCase())
          ),
          live.shows
        )
      : [];

  // Step: search
  if (step === "search") {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-bold text-xl text-text-primary">
            Rate a show
          </h1>
        </div>

        <input
          type="text"
          placeholder="Search shows..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-bg-elevated rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-purple w-full"
        />

        <div className="flex flex-col gap-2">
          {filteredResults.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectShow(item)}
              className="bg-bg-surface rounded-lg p-3 text-left hover:bg-bg-hover transition-colors w-full"
            >
              <div className="text-text-primary font-medium">{item.title}</div>
              <div className="text-text-secondary text-sm">
                {item.year} &middot; {item.genre.slice(0, 2).join(", ")}
              </div>
            </button>
          ))}
          {searchQuery.length >= 2 && filteredResults.length === 0 && (
            <p className="text-text-muted text-sm text-center py-4">
              No results found
            </p>
          )}
        </div>
      </div>
    );
  }

  // Step: rate
  if (step === "rate") {
    const selected = selectedShow;
    if (!selected) return null;

    const ratingColor = getRatingColor(rating);

    return (
      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep("search")}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="font-display font-bold text-xl text-text-primary">
              {selected.title}
            </h1>
            <p className="text-text-secondary text-sm">
              {selected.year} &middot; {selected.genre}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div
            className="text-5xl font-display font-bold"
            style={{ color: ratingColor }}
          >
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
            style={
              {
                accentColor: ratingColor,
                "--thumb-color": ratingColor,
              } as React.CSSProperties
            }
          />
          <div className="flex justify-between w-full text-text-muted text-xs">
            <span>1</span>
            <span>10</span>
          </div>
        </div>

        {selectedShow && (
          <div className="bg-bg-surface rounded-lg p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-text-primary font-medium">
                Rate individual seasons
              </span>
              <button
                onClick={() => setRateSeasons(!rateSeasons)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  rateSeasons ? "bg-accent-purple" : "bg-bg-elevated"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    rateSeasons ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {rateSeasons && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-sm">
                    How many seasons?
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleSeasonsWatchedChange(-1)}
                      className="w-8 h-8 rounded-full bg-bg-elevated text-text-primary flex items-center justify-center hover:bg-bg-hover transition-colors"
                    >
                      -
                    </button>
                    <span className="text-text-primary font-semibold w-4 text-center">
                      {seasonsWatched}
                    </span>
                    <button
                      onClick={() => handleSeasonsWatchedChange(1)}
                      className="w-8 h-8 rounded-full bg-bg-elevated text-text-primary flex items-center justify-center hover:bg-bg-hover transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setStep("rate-seasons")}
                  className="bg-accent-purple text-bg-primary rounded-lg py-3 font-semibold w-full hover:opacity-90 transition-opacity"
                >
                  Next: Rate Seasons
                </button>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleAddShow}
          className="bg-accent-purple text-bg-primary rounded-lg py-3 font-semibold w-full hover:opacity-90 transition-opacity"
        >
          Add to My List
        </button>
      </div>
    );
  }

  // Step: rate-seasons
  if (step === "rate-seasons") {
    if (!selectedShow) return null;

    return (
      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep("rate")}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-display font-bold text-xl text-text-primary">
            Rate Seasons
          </h1>
        </div>

        <div className="flex flex-col gap-5">
          {Array.from({ length: seasonsWatched }, (_, i) => {
            const seasonRating = seasonRatings[i] ?? 7.0;
            const color = getRatingColor(seasonRating);
            return (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-text-primary font-medium">
                    Season {i + 1}
                  </span>
                  <span
                    className="font-display font-bold"
                    style={{ color }}
                  >
                    {seasonRating.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={seasonRating}
                  onChange={(e) =>
                    handleSeasonRatingChange(i, parseFloat(e.target.value))
                  }
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-bg-elevated"
                  style={
                    {
                      accentColor: color,
                      "--thumb-color": color,
                    } as React.CSSProperties
                  }
                />
              </div>
            );
          })}
        </div>

        <button
          onClick={handleAddShow}
          className="bg-accent-purple text-bg-primary rounded-lg py-3 font-semibold w-full hover:opacity-90 transition-opacity"
        >
          Add to My List
        </button>
      </div>
    );
  }

  // Step: confirm
  if (step === "confirm") {
    const title = selectedShow?.title;

    return (
      <div className="flex flex-col items-center justify-center gap-6 p-4 py-12">
        <div className="w-20 h-20 rounded-full bg-accent-purple/20 flex items-center justify-center">
          <svg
            className="animate-checkmark"
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgb(var(--text-primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <div className="text-center">
          <h1 className="font-display font-bold text-2xl text-text-primary">
            Added!
          </h1>
          <p className="text-text-secondary mt-1">
            {title} &middot;{" "}
            <span style={{ color: getRatingColor(rating) }}>
              {rating.toFixed(1)}
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={resetFlow}
            className="bg-accent-purple text-bg-primary rounded-lg py-3 font-semibold w-full hover:opacity-90 transition-opacity"
          >
            Add Another
          </button>
          <button
            onClick={() => setActiveTab("feed")}
            className="bg-bg-surface text-text-primary rounded-lg py-3 font-semibold w-full hover:bg-bg-hover transition-colors"
          >
            View My Lists
          </button>
        </div>
      </div>
    );
  }

  return null;
}
