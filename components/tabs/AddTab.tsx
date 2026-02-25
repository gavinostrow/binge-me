"use client";

import { useState, useEffect, useRef } from "react";
import { useApp } from "@/lib/AppContext";
import { ContentType, Movie, Show } from "@/lib/types";
import { getRatingColor } from "@/lib/utils";
import PosterImage from "@/components/PosterImage";
import SendRecommendationSheet from "@/components/SendRecommendationSheet";

type Step = "choose" | "search" | "rate" | "rate-seasons" | "confirm" | "send-rec";

export default function AddTab() {
  const {
    addMovieRating,
    addShowRating,
    movieRatings,
    showRatings,
    setActiveTab,
    pendingAddItem,
    setPendingAddItem,
  } = useApp();

  const [step, setStep] = useState<Step>("choose");
  const [contentType, setContentType] = useState<ContentType>("movie");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [rating, setRating] = useState(7.0);
  const [rateSeasons, setRateSeasons] = useState(false);
  const [seasonsWatched, setSeasonsWatched] = useState(1);
  const [seasonRatings, setSeasonRatings] = useState<number[]>([7.0]);
  const [searchResults, setSearchResults] = useState<(Movie | Show)[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/tmdb/search?query=${encodeURIComponent(searchQuery)}&type=${contentType}`
        );
        const data = await res.json();
        setSearchResults(data.results ?? []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, contentType]);

  // Handle pending add item from community deep link
  useEffect(() => {
    if (!pendingAddItem) return;
    const isShow = "totalSeasons" in pendingAddItem;
    setContentType(isShow ? "show" : "movie");
    if (isShow) {
      setSelectedShow(pendingAddItem as Show);
    } else {
      setSelectedMovie(pendingAddItem as Movie);
    }
    setRating(7.0);
    setSeasonsWatched(1);
    setRateSeasons(false);
    setSeasonRatings([7.0]);
    setStep("rate");
    setPendingAddItem(null);
  }, [pendingAddItem, setPendingAddItem]);

  const resetFlow = () => {
    setStep("choose");
    setSearchQuery("");
    setSelectedMovie(null);
    setSelectedShow(null);
    setRating(7.0);
    setRateSeasons(false);
    setSeasonsWatched(1);
    setSeasonRatings([7.0]);
    setSearchResults([]);
  };

  const handleSelectType = (type: ContentType) => {
    setContentType(type);
    setSearchQuery("");
    setStep("search");
  };

  // Check if a movie/show is already rated
  const isAlreadyRated = (item: Movie | Show): boolean => {
    if ("totalSeasons" in item) {
      return showRatings.some((r) => r.show.id === item.id);
    }
    return movieRatings.some((r) => r.movie.id === item.id);
  };

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setRating(7.0);
    setStep("rate");
  };

  const handleSelectShow = (show: Show) => {
    setSelectedShow(show);
    setRating(7.0);
    setSeasonsWatched(1);
    setRateSeasons(false);
    setSeasonRatings([7.0]);
    setStep("rate");
  };

  const handleSeasonsWatchedSelect = (count: number) => {
    setSeasonsWatched(count);
    setSeasonRatings((prev) => {
      const updated = [...prev];
      while (updated.length < count) updated.push(7.0);
      return updated.slice(0, count);
    });
  };

  const handleSeasonRatingChange = (index: number, value: number) => {
    setSeasonRatings((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleAddMovie = () => {
    if (!selectedMovie) return;
    addMovieRating({
      id: "mr-" + Date.now(),
      userId: "u1",
      movie: selectedMovie,
      rating,
      createdAt: new Date().toISOString(),
    });
    setStep("confirm");
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

  const handleAdd = () => {
    if (contentType === "movie") {
      handleAddMovie();
    } else {
      handleAddShow();
    }
  };

  const filteredResults = searchResults;

  const selected = contentType === "movie" ? selectedMovie : selectedShow;
  const isDuplicate = selected ? isAlreadyRated(selected) : false;

  // Step: choose
  if (step === "choose") {
    return (
      <div className="flex flex-col gap-4 p-4">
        <h1 className="font-display font-bold text-xl text-text-primary">
          Add to List
        </h1>

        <button
          onClick={() => handleSelectType("movie")}
          className="bg-bg-surface rounded-xl p-6 w-full text-left flex items-center justify-between hover:bg-bg-hover active:scale-95 active:opacity-80 transition-all"
        >
          <div>
            <h2 className="text-text-primary font-semibold text-lg">Movie</h2>
            <p className="text-text-secondary text-sm">
              Log a movie you watched
            </p>
          </div>
          <span className="text-text-muted text-xl">&rarr;</span>
        </button>

        <button
          onClick={() => handleSelectType("show")}
          className="bg-bg-surface rounded-xl p-6 w-full text-left flex items-center justify-between hover:bg-bg-hover active:scale-95 active:opacity-80 transition-all"
        >
          <div>
            <h2 className="text-text-primary font-semibold text-lg">
              TV Show
            </h2>
            <p className="text-text-secondary text-sm">
              Log a show or season
            </p>
          </div>
          <span className="text-text-muted text-xl">&rarr;</span>
        </button>

        <button
          onClick={() => setStep("send-rec")}
          className="bg-bg-surface rounded-xl p-6 w-full text-left flex items-center justify-between hover:bg-bg-hover active:scale-95 active:opacity-80 transition-all"
        >
          <div>
            <h2 className="text-text-primary font-semibold text-lg">Send a Recommendation</h2>
            <p className="text-text-secondary text-sm">
              Tell a friend what to watch next
            </p>
          </div>
          <span className="text-text-muted text-xl">&rarr;</span>
        </button>
      </div>
    );
  }

  // Step: send-rec
  if (step === "send-rec") {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep("choose")}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-display font-bold text-xl text-text-primary">Send a Rec</h1>
        </div>
        <p className="text-text-muted text-sm">Search for something to recommend to a friend.</p>

        <div className="flex gap-2">
          <button
            onClick={() => { setContentType("movie"); setSearchQuery(""); setSearchResults([]); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${contentType === "movie" ? "bg-accent-purple text-white" : "bg-bg-surface text-text-muted"}`}
          >Movies</button>
          <button
            onClick={() => { setContentType("show"); setSearchQuery(""); setSearchResults([]); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${contentType === "show" ? "bg-accent-purple text-white" : "bg-bg-surface text-text-muted"}`}
          >Shows</button>
        </div>

        <input
          type="text"
          placeholder={`Search ${contentType === "movie" ? "movies" : "TV shows"}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
          className="bg-bg-elevated rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-purple w-full"
        />

        <div className="flex flex-col gap-2">
          {isSearching && (
            <p className="text-text-muted text-sm text-center py-4">Searching...</p>
          )}
          {!isSearching && filteredResults.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (contentType === "movie") {
                  setSelectedMovie(item as Movie);
                  setSelectedShow(null);
                } else {
                  setSelectedShow(item as Show);
                  setSelectedMovie(null);
                }
              }}
              className={`bg-bg-surface rounded-lg p-3 text-left active:scale-[0.98] transition-all w-full flex items-center gap-3 ${
                (selectedMovie?.id === item.id || selectedShow?.id === item.id) ? "ring-2 ring-accent-purple" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="text-text-primary font-medium truncate">{item.title}</div>
                <div className="text-text-secondary text-sm">
                  {item.year}{item.genre ? ` · ${Array.isArray(item.genre) ? item.genre[0] : item.genre}` : ""}
                </div>
              </div>
            </button>
          ))}
          {!isSearching && searchQuery.length >= 2 && filteredResults.length === 0 && (
            <p className="text-text-muted text-sm text-center py-4">No results found</p>
          )}
        </div>

        {(selectedMovie || selectedShow) && (
          <>
            <SendRecommendationSheet
              item={(selectedMovie ?? selectedShow)!}
              itemType={contentType}
              onClose={() => { setSelectedMovie(null); setSelectedShow(null); setStep("choose"); }}
            />
          </>
        )}
      </div>
    );
  }

  // Step: search
  if (step === "search") {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep("choose")}
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
            {contentType === "movie" ? "Add Movie" : "Add TV Show"}
          </h1>
        </div>

        <input
          type="text"
          placeholder={`Search ${contentType === "movie" ? "movies" : "TV shows"}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
          className="bg-bg-elevated rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-purple w-full"
        />

        <div className="flex flex-col gap-2">
          {isSearching && (
            <p className="text-text-muted text-sm text-center py-4">Searching...</p>
          )}
          {!isSearching && filteredResults.map((item) => {
            const alreadyRated = isAlreadyRated(item);
            return (
              <button
                key={item.id}
                onClick={() =>
                  contentType === "movie"
                    ? handleSelectMovie(item as Movie)
                    : handleSelectShow(item as Show)
                }
                className="bg-bg-surface rounded-lg p-3 text-left hover:bg-bg-hover active:scale-[0.98] transition-all w-full flex items-center gap-3"
              >
                <PosterImage
                  title={item.title}
                  year={item.year ?? undefined}
                  posterPath={(item as Movie & Show).posterPath ?? undefined}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-text-primary font-medium truncate">{item.title}</div>
                    {alreadyRated && (
                      <span className="text-xs text-accent-purple bg-accent-purple/10 px-2 py-0.5 rounded-full shrink-0 ml-2">
                        Rated
                      </span>
                    )}
                  </div>
                  <div className="text-text-secondary text-sm">
                    {item.year}{item.genre ? ` · ${item.genre}` : ""}
                  </div>
                </div>
              </button>
            );
          })}
          {!isSearching && searchQuery.length >= 2 && filteredResults.length === 0 && (
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

        {/* Duplicate warning */}
        {isDuplicate && (
          <div className="bg-accent-purple/10 border border-accent-purple/30 rounded-lg p-3 text-sm text-accent-purple">
            You&apos;ve already rated this. Adding again will create a second entry.
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          <div
            className="text-5xl font-display font-bold transition-colors duration-200"
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

        {contentType === "show" && selectedShow && (
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
                <span className="text-text-secondary text-sm">
                  How many seasons did you watch?
                </span>
                {/* Season chip selector */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {Array.from(
                    { length: selectedShow.seasons ?? selectedShow.totalSeasons ?? 1 },
                    (_, i) => i + 1
                  ).map((n) => (
                    <button
                      key={n}
                      onClick={() => handleSeasonsWatchedSelect(n)}
                      className={`shrink-0 w-10 h-10 rounded-full text-sm font-semibold transition-all active:scale-95 ${
                        seasonsWatched === n
                          ? "bg-accent-purple text-white"
                          : "bg-bg-elevated text-text-secondary hover:bg-bg-hover"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setStep("rate-seasons")}
                  className="bg-accent-purple text-white rounded-lg py-3 font-semibold w-full hover:opacity-90 active:scale-95 active:opacity-80 transition-all"
                >
                  Next: Rate Seasons
                </button>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleAdd}
          className="bg-accent-purple text-white rounded-lg py-3 font-semibold w-full hover:opacity-90 active:scale-95 active:opacity-80 transition-all"
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
                    className="font-display font-bold transition-colors duration-200"
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
          onClick={handleAdd}
          className="bg-accent-purple text-white rounded-lg py-3 font-semibold w-full hover:opacity-90 active:scale-95 active:opacity-80 transition-all"
        >
          Add to My List
        </button>
      </div>
    );
  }

  // Step: confirm
  if (step === "confirm") {
    const title =
      contentType === "movie"
        ? selectedMovie?.title
        : selectedShow?.title;
    const [showSendRec, setShowSendRec] = useState(false);

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
            stroke="#8B5CF6"
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
            className="bg-accent-purple text-white rounded-lg py-3 font-semibold w-full hover:opacity-90 active:scale-95 active:opacity-80 transition-all"
          >
            Add Another
          </button>
          {(selectedMovie || selectedShow) && (
            <button
              onClick={() => setShowSendRec(true)}
              className="bg-bg-surface text-text-primary rounded-lg py-3 font-semibold w-full hover:bg-bg-hover active:scale-95 active:opacity-80 transition-all flex items-center justify-center gap-2"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Send to a Friend
            </button>
          )}
          <button
            onClick={() => setActiveTab("profile")}
            className="bg-bg-surface text-text-muted rounded-lg py-3 font-semibold w-full hover:bg-bg-hover active:scale-95 active:opacity-80 transition-all"
          >
            View My Lists
          </button>
        </div>

        {showSendRec && (selectedMovie || selectedShow) && (
          <SendRecommendationSheet
            item={(selectedMovie ?? selectedShow)!}
            itemType={contentType}
            onClose={() => setShowSendRec(false)}
          />
        )}
      </div>
    );
  }

  return null;
}
