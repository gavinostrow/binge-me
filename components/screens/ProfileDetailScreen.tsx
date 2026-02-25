"use client";
import { useApp } from "@/lib/AppContext";
import { friends, myMovieRatings, myShowRatings, tasteMatchPercentages } from "@/lib/mockData";
import { nowWatching } from "@/lib/mockGroups";
import PosterImage from "@/components/PosterImage";
import RatingBadge from "@/components/RatingBadge";
import { timeAgo } from "@/lib/utils";

type WatchStatus = {
  title: string;
  type: string;
  episode?: string;
  startedAt: string;
} | null;

function WatchingStatusCard({ status }: { status: WatchStatus }) {
  if (!status) return null;
  const isShow = status.type === "show";
  return (
    <div className="bg-bg-card rounded-2xl border border-border px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
        <span className="text-[10px] font-body font-semibold uppercase tracking-widest text-text-muted">
          Watching Now
        </span>
        <span className="ml-auto text-[10px] text-text-muted font-body">
          {timeAgo(status.startedAt)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] font-body font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
          style={{
            backgroundColor: isShow ? "#EC489920" : "#7C5CF620",
            color: isShow ? "#EC4899" : "#7C5CF6",
          }}
        >
          {isShow ? "Show" : "Movie"}
        </span>
        <p className="font-display font-semibold text-text-primary text-sm truncate">
          {status.title}
        </p>
        {status.episode && (
          <span className="text-text-muted text-xs font-body flex-shrink-0">
            · {status.episode}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ProfileDetailScreen({ userId }: { userId: string }) {
  const { pushScreen, popScreen, currentUserData, myNowWatching } = useApp();
  const isSelf = userId === currentUserData.id;
  const user = isSelf ? currentUserData : friends.find((f) => f.id === userId);

  if (!user) return <div className="p-4">User not found</div>;

  const watchingStatus = isSelf
    ? myNowWatching
    : nowWatching.find((f) => f.userId === userId) ?? null;

  const userMovieRatings = isSelf ? myMovieRatings : [];
  const userShowRatings = isSelf ? myShowRatings : [];
  const tasteMatch = isSelf ? undefined : tasteMatchPercentages[userId];
  const topMovies = userMovieRatings.slice(0, 4);
  const avgMovieRating =
    userMovieRatings.length > 0
      ? (
          userMovieRatings.reduce((sum, r) => sum + r.rating, 0) / userMovieRatings.length
        ).toFixed(1)
      : "—";

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-bg-primary">
      {/* Nav bar */}
      <div className="sticky top-0 z-10 bg-bg-primary/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={popScreen}
          className="w-8 h-8 rounded-full bg-bg-card border border-border flex items-center justify-center active:scale-95 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="font-display text-base font-bold text-text-primary">{user.name}</h2>
      </div>

      <div className="px-4 pb-8 space-y-5">
        {/* Avatar + name */}
        <div className="pt-4 text-center space-y-2">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center mx-auto">
            <span className="text-white font-display text-5xl font-bold">
              {user.name.charAt(0)}
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary">{user.name}</h1>
          <p className="text-text-secondary text-sm">@{user.username}</p>
          {user.bio && <p className="text-text-secondary text-sm">{user.bio}</p>}
        </div>

        {/* Watching status */}
        <WatchingStatusCard status={watchingStatus} />

        {/* Taste match (friends only) */}
        {tasteMatch !== undefined && (
          <div className="bg-bg-card rounded-2xl p-4 text-center">
            <p className="text-text-secondary text-xs uppercase tracking-wider font-semibold mb-2">
              Taste Match
            </p>
            <div className="text-4xl font-display font-bold text-accent">{tasteMatch}%</div>
            <p className="text-text-secondary text-sm mt-1">Compatible with you</p>
          </div>
        )}

        {/* Edit profile (self only) */}
        {isSelf && (
          <button
            onClick={() => pushScreen({ screen: "profile-edit" })}
            className="w-full py-3 bg-gradient-to-r from-accent to-accent-light text-white font-display font-bold rounded-2xl active:scale-[0.98] transition-all"
          >
            Edit Profile
          </button>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-bg-card rounded-xl p-3 text-center">
            <p className="text-text-secondary text-xs uppercase tracking-wider font-semibold">Movies</p>
            <p className="text-2xl font-display font-bold text-text-primary mt-1">
              {userMovieRatings.length}
            </p>
          </div>
          <div className="bg-bg-card rounded-xl p-3 text-center">
            <p className="text-text-secondary text-xs uppercase tracking-wider font-semibold">Shows</p>
            <p className="text-2xl font-display font-bold text-text-primary mt-1">
              {userShowRatings.length}
            </p>
          </div>
          <div className="bg-bg-card rounded-xl p-3 text-center">
            <p className="text-text-secondary text-xs uppercase tracking-wider font-semibold">Avg</p>
            <p className="text-2xl font-display font-bold text-accent mt-1">{avgMovieRating}</p>
          </div>
        </div>

        {/* Favorite genres */}
        {user.favoriteGenres && user.favoriteGenres.length > 0 && (
          <div className="space-y-2">
            <p className="text-text-secondary text-xs uppercase tracking-wider font-semibold">
              Favorite Genres
            </p>
            <div className="flex flex-wrap gap-2">
              {user.favoriteGenres.map((g) => (
                <span
                  key={g}
                  className="inline-block px-3 py-1 rounded-full bg-bg-elevated text-text-secondary text-sm font-body"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Top movies (self only) */}
        {isSelf && topMovies.length > 0 && (
          <div className="space-y-3">
            <p className="text-text-secondary text-xs uppercase tracking-wider font-semibold">
              Top Movies
            </p>
            <div className="grid grid-cols-2 gap-3">
              {topMovies.map((rating) => (
                <button
                  key={rating.id}
                  onClick={() => pushScreen({ screen: "movie-detail", movieId: rating.movie.id })}
                  className="space-y-2 active:opacity-80 transition text-left"
                >
                  <PosterImage
                    title={rating.movie.title}
                    year={rating.movie.year}
                    posterPath={rating.movie.posterPath}
                    size="md"
                    className="w-full rounded-xl"
                  />
                  <div>
                    <p className="text-text-primary text-sm font-semibold line-clamp-1">
                      {rating.movie.title}
                    </p>
                    <RatingBadge rating={rating.rating} size="sm" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent movies (self only) */}
        {isSelf && userMovieRatings.length > 4 && (
          <div className="space-y-3">
            <p className="text-text-secondary text-xs uppercase tracking-wider font-semibold">
              Recent Movies
            </p>
            <div className="space-y-2">
              {userMovieRatings.slice(4, 10).map((rating) => (
                <button
                  key={rating.id}
                  onClick={() =>
                    pushScreen({ screen: "movie-detail", movieId: rating.movie.id })
                  }
                  className="w-full bg-bg-card rounded-xl p-3 flex items-center gap-3 active:bg-bg-elevated transition text-left"
                >
                  <PosterImage
                    title={rating.movie.title}
                    year={rating.movie.year}
                    posterPath={rating.movie.posterPath}
                    size="sm"
                    className="w-12 h-16 rounded"
                  />
                  <div className="flex-1">
                    <p className="text-text-primary text-sm font-semibold">{rating.movie.title}</p>
                    <p className="text-text-secondary text-xs">{rating.movie.year}</p>
                  </div>
                  <RatingBadge rating={rating.rating} size="sm" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
