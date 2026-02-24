"use client";

import { useApp } from "@/lib/AppContext";
import { currentUser, friends, tasteMatchPercentages } from "@/lib/mockData";
import { getRatingColor, getInitial, timeAgo } from "@/lib/utils";
import RatingBadge from "@/components/RatingBadge";

export default function ProfileTab() {
  const { movieRatings, showRatings } = useApp();

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

  return (
    <div className="px-4">
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
          { count: episodeCount, label: "Episodes" },
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
