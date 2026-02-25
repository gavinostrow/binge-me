"use client";
import { useApp } from "@/lib/AppContext";
import {
  shows,
  friends,
  friendsShowRatings,
  communityShows,
  communitySeasons,
  friendsNowWatching,
} from "@/lib/mockData";
import { getInitial } from "@/lib/utils";
import PosterImage from "@/components/PosterImage";
import RatingBadge from "@/components/RatingBadge";
import SendRecommendationSheet from "@/components/SendRecommendationSheet";
import { useState } from "react";

const FRIEND_COLORS = ["#7C5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"];
function friendColor(userId: string) {
  return FRIEND_COLORS[
    parseInt(userId.replace(/\D/g, "")) % FRIEND_COLORS.length
  ];
}

export default function ShowDetailScreen({ showId }: { showId: string }) {
  const {
    setActiveTab,
    pushScreen,
    popScreen,
    watchlist,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    getMyShowRating,
    myNowWatching,
    currentUserData,
  } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [showSendRec, setShowSendRec] = useState(false);

  const show = shows.find((s) => s.id === showId);
  if (!show) return <div className="p-4">Show not found</div>;

  const myRating = getMyShowRating(showId);
  const friendRatings = friendsShowRatings[showId] || [];
  const communityItem = communityShows.find((c) => c.show?.id === showId);
  const inWatchlist = isInWatchlist("show", showId);
  const seasonCommunityRatings = communitySeasons.filter(
    (c) => c.show?.id === showId,
  );

  // Similar shows: same genre(s), exclude current
  const similarShows = shows
    .filter(
      (s) => s.id !== showId && s.genre.some((g) => show.genre.includes(g)),
    )
    .sort((a, b) => {
      const aMatch = a.genre.filter((g) => show.genre.includes(g)).length;
      const bMatch = b.genre.filter((g) => show.genre.includes(g)).length;
      return bMatch - aMatch;
    })
    .slice(0, 8);

  // Who is currently watching this show
  const friendsWatchingThis = friendsNowWatching.filter(
    (f) =>
      f.type === "show" && f.title.toLowerCase() === show.title.toLowerCase(),
  );
  const iSelfWatchingThis =
    myNowWatching?.type === "show" &&
    myNowWatching.title.toLowerCase() === show.title.toLowerCase();
  const watchingNow = [
    ...(iSelfWatchingThis
      ? [
          {
            ...myNowWatching!,
            userId: currentUserData.id,
            user: currentUserData,
          },
        ]
      : []),
    ...friendsWatchingThis,
  ];

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      const item = watchlist.find((w) => w.show?.id === showId);
      if (item) removeFromWatchlist(item.id);
    } else {
      addToWatchlist({
        id: `wl_${Date.now()}`,
        contentType: "show",
        show,
        addedDate: new Date().toISOString(),
      });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrolled(e.currentTarget.scrollTop > 80);
  };

  const handleActorSearch = (actor: string) => {
    pushScreen({ screen: "search", query: actor });
  };

  return (
    <div
      className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-bg-primary"
      onScroll={handleScroll}
    >
      {/* Sticky condensed header — appears on scroll */}
      {scrolled && (
        <div className="sticky top-0 z-20 bg-bg-primary/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3 animate-fadeIn">
          <button
            onClick={popScreen}
            className="w-8 h-8 rounded-full bg-bg-card border border-border flex items-center justify-center flex-shrink-0 active:scale-95 transition-all"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2 className="font-display text-base text-text-primary font-bold flex-1 truncate">
            {show.title}
          </h2>
          {myRating && (
            <RatingBadge rating={myRating.overallRating} size="sm" />
          )}
        </div>
      )}

      {/* Hero poster */}
      <div className="relative">
        <PosterImage
          title={show.title}
          year={show.year}
          posterPath={show.posterPath}
          size="xl"
          className="w-full aspect-[2/3] object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/30 to-transparent" />

        {/* Back button */}
        <button
          onClick={popScreen}
          className="absolute top-4 left-4 z-10 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-95 transition-all"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth={2.5}
            strokeLinecap="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Watchlist button on poster */}
        <button
          onClick={handleWatchlistToggle}
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-95 transition-all"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={inWatchlist ? "white" : "none"}
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        {/* Title block overlaying bottom of poster */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <h1 className="font-display text-3xl font-bold text-white leading-tight drop-shadow-lg">
            {show.title}
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-white/70 text-sm font-body">{show.year}</span>
            {show.seasons && (
              <>
                <span className="text-white/40 text-xs">·</span>
                <span className="text-white/70 text-sm font-body">
                  {show.seasons} season{show.seasons !== 1 ? "s" : ""}
                </span>
              </>
            )}
            {show.network && (
              <>
                <span className="text-white/40 text-xs">·</span>
                <span className="text-white/70 text-sm font-body">
                  {show.network}
                </span>
              </>
            )}
            {show.status && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold backdrop-blur-sm ${
                  show.status === "ongoing"
                    ? "bg-green-500/20 text-green-300 border border-green-400/30"
                    : "bg-white/15 text-white/70 border border-white/20"
                }`}
              >
                {show.status === "ongoing" ? "Ongoing" : "Ended"}
              </span>
            )}
          </div>
          {/* Genre chips */}
          <div className="flex gap-2 mt-2 flex-wrap">
            {show.genre.map((g) => (
              <span
                key={g}
                className="px-2.5 py-1 rounded-full text-xs font-body font-semibold bg-white/15 backdrop-blur-sm text-white border border-white/20"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pb-28 space-y-5 -mt-1">
        {/* Rate / Edit CTA */}
        {myRating ? (
          <div className="bg-bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-text-muted text-xs font-body uppercase tracking-wider">
                  Your Rating
                </p>
                {myRating.review && (
                  <p className="text-text-secondary text-sm mt-1 italic line-clamp-2">
                    "{myRating.review}"
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                <RatingBadge rating={myRating.overallRating} size="lg" />
                <button
                  onClick={() => setActiveTab("add")}
                  className="text-accent text-sm font-body font-semibold"
                >
                  Edit
                </button>
              </div>
            </div>
            {/* Season ratings mini-grid */}
            {myRating.seasonRatings && myRating.seasonRatings.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-text-muted text-[10px] font-body uppercase tracking-wider mb-2">
                  Season Ratings
                </p>
                <div className="flex gap-2 flex-wrap">
                  {myRating.seasonRatings.map((sr) => (
                    <div
                      key={sr.season}
                      className="bg-bg-elevated rounded-lg px-2.5 py-1.5 flex items-center gap-1.5"
                    >
                      <span className="text-text-muted text-[10px] font-body">
                        S{sr.season}
                      </span>
                      <RatingBadge rating={sr.rating} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setActiveTab("add")}
            className="w-full py-3.5 bg-gradient-to-r from-accent to-accent-light text-white font-display font-bold text-base rounded-2xl active:scale-[0.98] transition-all"
          >
            Rate This Show
          </button>
        )}

        {/* Watching Now */}
        {watchingNow.length > 0 && (
          <div className="bg-bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              <p className="text-text-muted text-xs font-body uppercase tracking-wider">
                Watching Now
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {watchingNow.map((w) => {
                const isSelf = w.userId === currentUserData.id;
                return (
                  <button
                    key={w.userId}
                    onClick={() =>
                      !isSelf &&
                      pushScreen({ screen: "profile", userId: w.userId })
                    }
                    className="flex items-center gap-2 bg-bg-elevated rounded-xl px-3 py-2 active:opacity-80 transition-opacity"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: friendColor(w.userId) }}
                    >
                      {getInitial(w.user.name)}
                    </div>
                    <div className="text-left">
                      <p className="text-text-primary text-xs font-display font-semibold">
                        {isSelf ? "You" : w.user.name}
                      </p>
                      {w.episode && (
                        <p className="text-text-muted text-[10px] font-body">
                          {w.episode}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Community Stats */}
        {communityItem && (
          <div className="bg-bg-card rounded-2xl p-4 border border-border">
            <p className="text-text-muted text-xs font-body uppercase tracking-wider mb-3">
              Community
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <RatingBadge rating={communityItem.averageRating} size="lg" />
                <div>
                  <p className="text-text-primary text-sm font-display font-bold">
                    {communityItem.averageRating.toFixed(1)} avg
                  </p>
                  <p className="text-text-muted text-xs font-body">
                    {communityItem.ratingCount.toLocaleString()} ratings
                  </p>
                </div>
              </div>
              {communityItem.pct9plus && (
                <div className="flex-1 flex justify-end">
                  <div className="bg-accent/10 border border-accent/30 rounded-xl px-3 py-2 text-center">
                    <p className="font-display font-bold text-accent text-lg leading-none">
                      {communityItem.pct9plus}%
                    </p>
                    <p className="text-accent/80 text-[10px] font-body mt-0.5">
                      gave it a 9+
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Season community ratings */}
            {show.seasons &&
              show.seasons > 1 &&
              seasonCommunityRatings.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-text-muted text-[10px] font-body uppercase tracking-wider mb-2">
                    Season Ratings
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: show.seasons }).map((_, i) => {
                      const season = i + 1;
                      const mySeasonRating = myRating?.seasonRatings?.find(
                        (sr) => sr.season === season,
                      );
                      const commSeasonRating = seasonCommunityRatings.find(
                        (c) => c.season === season,
                      );
                      return (
                        <div
                          key={season}
                          className="bg-bg-elevated rounded-xl p-2.5 text-center"
                        >
                          <p className="text-text-muted text-[10px] font-body mb-1">
                            S{season}
                          </p>
                          {mySeasonRating ? (
                            <RatingBadge
                              rating={mySeasonRating.rating}
                              size="sm"
                            />
                          ) : commSeasonRating ? (
                            <span className="text-text-secondary text-xs font-display font-bold">
                              {commSeasonRating.averageRating.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-text-muted text-xs">—</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Friends' Ratings */}
        {friendRatings.length > 0 && (
          <div>
            <p className="text-text-muted text-xs font-body uppercase tracking-wider mb-3 px-1">
              Friends' Takes
            </p>
            <div className="space-y-2">
              {friendRatings.map((fr, idx) => {
                const friend = friends.find((f) => f.id === fr.userId);
                if (!friend) return null;
                return (
                  <button
                    key={idx}
                    onClick={() =>
                      pushScreen({ screen: "profile", userId: fr.userId })
                    }
                    className="w-full bg-bg-card rounded-2xl p-4 border border-border flex items-start gap-3 active:opacity-80 transition-opacity text-left"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-display font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: friendColor(friend.id) }}
                    >
                      {friend.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-display font-semibold">
                        {friend.name}
                      </p>
                      {fr.review && (
                        <p className="text-text-secondary text-xs mt-1 italic leading-relaxed line-clamp-2">
                          "{fr.review}"
                        </p>
                      )}
                    </div>
                    <RatingBadge rating={fr.rating} size="md" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Description */}
        {show.description && (
          <div>
            <p className="text-text-muted text-xs font-body uppercase tracking-wider mb-2 px-1">
              About
            </p>
            <p className="text-text-secondary text-sm leading-relaxed font-body">
              {show.description}
            </p>
          </div>
        )}

        {/* Cast */}
        {show.cast && show.cast.length > 0 && (
          <div>
            <p className="text-text-muted text-xs font-body uppercase tracking-wider mb-3 px-1">
              Cast
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {show.cast.map((actor) => (
                <button
                  key={actor}
                  onClick={() => handleActorSearch(actor)}
                  className="flex-shrink-0 px-3.5 py-2 bg-bg-card border border-border rounded-xl text-text-primary text-sm font-body font-medium active:bg-bg-elevated active:border-accent transition-all"
                >
                  {actor}
                </button>
              ))}
            </div>
            <p className="text-text-muted text-[10px] font-body mt-2 px-1">
              Tap a name to find more of their work
            </p>
          </div>
        )}

        {/* Similar Shows */}
        {similarShows.length > 0 && (
          <div>
            <p className="text-text-muted text-xs font-body uppercase tracking-wider mb-3 px-1">
              You Might Also Like
            </p>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {similarShows.map((s) => {
                const communityRating = communityShows.find(
                  (c) => c.show?.id === s.id,
                );
                return (
                  <button
                    key={s.id}
                    onClick={() =>
                      pushScreen({ screen: "show-detail", showId: s.id })
                    }
                    className="flex-shrink-0 w-28 active:opacity-75 transition-opacity text-left"
                  >
                    <PosterImage
                      title={s.title}
                      year={s.year}
                      posterPath={s.posterPath}
                      size="md"
                      className="w-28 h-40 rounded-xl object-cover"
                    />
                    <p className="text-text-primary text-xs font-display font-semibold mt-1.5 truncate leading-tight">
                      {s.title}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-text-muted text-[10px] font-body">
                        {s.year}
                      </span>
                      {communityRating && (
                        <>
                          <span className="text-text-muted text-[10px]">·</span>
                          <span
                            className="text-[10px] font-body font-semibold"
                            style={{ color: "#A78BFA" }}
                          >
                            {communityRating.averageRating.toFixed(1)}
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Watchlist button */}
        <button
          onClick={handleWatchlistToggle}
          className={`w-full py-3 rounded-2xl font-body font-semibold transition-all active:scale-[0.98] ${
            inWatchlist
              ? "bg-accent/10 text-accent border border-accent"
              : "bg-bg-card text-text-secondary border border-border"
          }`}
        >
          {inWatchlist ? "✓ In Watchlist" : "Add to Watchlist"}
        </button>

        {/* Send Recommendation */}
        <button
          onClick={() => setShowSendRec(true)}
          className="w-full py-3 rounded-2xl font-body font-semibold transition-all active:scale-[0.98] bg-bg-card text-text-secondary border border-border flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          Send to a Friend
        </button>
      </div>

      {showSendRec && (
        <SendRecommendationSheet
          item={show}
          itemType="show"
          onClose={() => setShowSendRec(false)}
        />
      )}
    </div>
  );
}
