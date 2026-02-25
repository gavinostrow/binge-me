"use client";
import { useMemo, useState, useRef } from "react";
import { useApp } from "@/lib/AppContext";
import RatingBadge from "@/components/RatingBadge";
import PosterImage from "@/components/PosterImage";
import { genres } from "@/lib/mockData";
import { timeAgo, getRatingColor, getInitial } from "@/lib/utils";
import type { MovieRating, ShowRating, ListContentType } from "@/lib/types";
// ─── Member Level ─────────────────────────────────────────────────────────────
function getMemberLevel(total: number): { label: string; color: string; next: number | null } {
  if (total >= 100) return { label: "Platinum", color: "#E5E4E2", next: null };
  if (total >= 50) return { label: "Gold", color: "#F5A623", next: 100 };
  if (total >= 25) return { label: "Silver", color: "#A8A9AD", next: 50 };
  return { label: "Bronze", color: "#CD7F32", next: 25 };
}
// ─── SVG Icons ────────────────────────────────────────────────────────────────
const FilmIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {" "}
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />{" "}
    <line x1="7" y1="2" x2="7" y2="22" />
    <line x1="17" y1="2" x2="17" y2="22" /> <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="2" y1="7" x2="7" y2="7" /> <line x1="2" y1="17" x2="7" y2="17" />
    <line x1="17" y1="17" x2="22" y2="17" /> <line x1="17" y1="7" x2="22" y2="7" />{" "}
  </svg>
);
const TvIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {" "}
    <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />{" "}
    <polyline points="17 2 12 7 7 2" />{" "}
  </svg>
);
const StarIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {" "}
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />{" "}
  </svg>
);
const ClockIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {" "}
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />{" "}
  </svg>
);
const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {" "}
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />{" "}
  </svg>
);
const PencilIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {" "}
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />{" "}
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />{" "}
  </svg>
);
const BookmarkIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {" "}
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />{" "}
  </svg>
);
const XIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
  >
    {" "}
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />{" "}
  </svg>
);
// ─── Helpers ─────────────────────────────────────────────────────────────────
function calcStats(movieRatings: MovieRating[], showRatings: ShowRating[]) {
  const allRatings = [
    ...movieRatings.map((r) => r.rating),
    ...showRatings.map((r) => r.overallRating),
  ];
  const avg = allRatings.length > 0 ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : 0;
  const totalRuntime = movieRatings.reduce((sum, r) => sum + (r.movie.runtime ?? 100), 0);
  const hours = Math.floor(totalRuntime / 60);
  return { totalMovies: movieRatings.length, totalShows: showRatings.length, avg, hours };
}
function calcGenreBreakdown(movieRatings: MovieRating[], showRatings: ShowRating[]) {
  const counts: Record<string, number> = {};
  movieRatings.forEach((r) =>
    r.movie.genre.forEach((g) => {
      counts[g] = (counts[g] ?? 0) + 1;
    }),
  );
  showRatings.forEach((r) =>
    r.show.genre.forEach((g) => {
      counts[g] = (counts[g] ?? 0) + 1;
    }),
  );
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
}
// ─── Now Watching ─────────────────────────────────────────────────────────────
const FRIEND_COLORS = ["#7C5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"];
function friendColor(userId: string) {
  return FRIEND_COLORS[parseInt(userId.replace(/\D/g, "")) % FRIEND_COLORS.length];
}
function MyWatchingStatus() {
  const { currentUserData, myNowWatching, setMyNowWatching, clearNowWatching } = useApp();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draftType, setDraftType] = useState<"movie" | "show">("show");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftEpisode, setDraftEpisode] = useState("");
  const openSheet = () => {
    if (myNowWatching) {
      setDraftType(myNowWatching.type as "movie" | "show");
      setDraftTitle(myNowWatching.title);
      setDraftEpisode(myNowWatching.episode ?? "");
    } else {
      setDraftType("show");
      setDraftTitle("");
      setDraftEpisode("");
    }
    setSheetOpen(true);
  };
  const handleShare = () => {
    if (!draftTitle.trim()) return;
    setMyNowWatching({
      userId: currentUserData.id,
      title: draftTitle.trim(),
      type: draftType,
      episode: draftType === "show" && draftEpisode.trim() ? draftEpisode.trim() : undefined,
      startedAt: new Date().toISOString(),
    });
    setSheetOpen(false);
  };
  return (
    <div className="space-y-2">
      {" "}
      <div className="flex items-center justify-between px-0.5">
        {" "}
        <div className="flex items-center gap-2">
          {" "}
          {myNowWatching && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
          )}{" "}
          <span className="text-[10px] font-body font-semibold uppercase tracking-widest text-text-muted">
            {" "}
            {myNowWatching ? "Now Watching" : "Watching Status"}{" "}
          </span>{" "}
        </div>{" "}
        <button
          onClick={openSheet}
          className="text-[10px] font-body font-semibold text-accent active:opacity-70 transition-opacity"
        >
          {" "}
          {myNowWatching ? "Update" : "+ Set Status"}{" "}
        </button>{" "}
      </div>{" "}
      {myNowWatching ? (
        /* Active status card */ <div className="bg-bg-card rounded-2xl border border-border px-4 py-3 flex items-center gap-3">
          {" "}
          <div className="flex-1 min-w-0">
            {" "}
            <div className="flex items-center gap-2 mb-0.5">
              {" "}
              <span
                className="text-[10px] font-body font-semibold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: myNowWatching.type === "movie" ? "#7C5CF620" : "#EC489920",
                  color: myNowWatching.type === "movie" ? "#7C5CF6" : "#EC4899",
                }}
              >
                {" "}
                {myNowWatching.type === "movie" ? "Movie" : "Show"}{" "}
              </span>{" "}
              <span className="text-text-muted text-[10px] font-body">
                {timeAgo(myNowWatching.startedAt)}
              </span>{" "}
            </div>{" "}
            <p className="text-text-primary font-display font-semibold text-sm truncate">
              {myNowWatching.title}
            </p>{" "}
            {myNowWatching.episode && (
              <p className="text-text-muted text-xs font-body mt-0.5">{myNowWatching.episode}</p>
            )}{" "}
          </div>{" "}
          <button
            onClick={clearNowWatching}
            className="text-text-muted active:text-text-secondary transition-colors flex-shrink-0 p-1"
            aria-label="Clear status"
          >
            {" "}
            <XIcon />{" "}
          </button>{" "}
        </div>
      ) : (
        /* Empty prompt */ <button
          onClick={openSheet}
          className="w-full flex items-center gap-3 bg-bg-card border border-border rounded-2xl px-4 py-3 active:bg-bg-elevated transition-colors"
        >
          {" "}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-text-muted flex-shrink-0"
          >
            {" "}
            <circle cx="12" cy="12" r="10" />
            <polygon points="10 8 16 12 10 16 10 8" />{" "}
          </svg>{" "}
          <span className="text-text-muted font-body text-sm">
            What are you watching right now?
          </span>{" "}
          <svg
            className="ml-auto text-text-muted flex-shrink-0"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            {" "}
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />{" "}
          </svg>{" "}
        </button>
      )}{" "}
      {/* Bottom sheet */}{" "}
      {sheetOpen && (
        <>
          {" "}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setSheetOpen(false)}
          />{" "}
          <div className="fixed bottom-0 left-0 right-0 z-50 max-w-app mx-auto bg-bg-card border-t border-border rounded-t-3xl p-5 pb-8 animate-slideUp">
            {" "}
            <div className="w-10 h-1 rounded-full bg-border mx-auto mb-5" />{" "}
            <p className="font-display font-bold text-text-primary text-base mb-4">
              {" "}
              {myNowWatching ? "Update your status" : "What are you watching?"}{" "}
            </p>{" "}
            <div className="flex gap-2 mb-4">
              {" "}
              {(["show", "movie"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setDraftType(t);
                    setDraftEpisode("");
                  }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-display font-semibold transition-all"
                  style={
                    draftType === t
                      ? { background: "linear-gradient(135deg, #7C5CF6, #a78bfa)", color: "#fff" }
                      : { backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }
                  }
                >
                  {" "}
                  {t === "show" ? "TV Show" : "Movie"}{" "}
                </button>
              ))}{" "}
            </div>{" "}
            <div className="mb-3">
              {" "}
              <label className="text-[10px] font-body font-semibold uppercase tracking-wider text-text-muted block mb-1.5">
                Title
              </label>{" "}
              <input
                type="text"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder={draftType === "show" ? "e.g. The Bear" : "e.g. Dune: Part Two"}
                className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm font-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                autoFocus
              />{" "}
            </div>{" "}
            {draftType === "show" && (
              <div className="mb-5">
                {" "}
                <label className="text-[10px] font-body font-semibold uppercase tracking-wider text-text-muted block mb-1.5">
                  {" "}
                  Episode{" "}
                  <span className="normal-case font-normal text-text-muted/60">
                    (optional)
                  </span>{" "}
                </label>{" "}
                <input
                  type="text"
                  value={draftEpisode}
                  onChange={(e) => setDraftEpisode(e.target.value)}
                  placeholder="e.g. S3E4"
                  className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm font-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                />{" "}
              </div>
            )}{" "}
            {draftType === "movie" && <div className="mb-5" />}{" "}
            <button
              onClick={handleShare}
              disabled={!draftTitle.trim()}
              className="w-full py-3.5 rounded-2xl font-display font-bold text-sm text-white transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #7C5CF6, #a78bfa)" }}
            >
              {" "}
              {myNowWatching ? "Update Status" : "Share"}{" "}
            </button>{" "}
          </div>{" "}
        </>
      )}{" "}
    </div>
  );
}
// ─── Sub-components ───────────────────────────────────────────────────────────
function UserHeader() {
  const { currentUserData, pushScreen, isAuthenticated, movieRatings, showRatings, updateProfile } =
    useApp();
  const total = movieRatings.length + showRatings.length;
  const level = getMemberLevel(total);
  const colors = ["#7C5CF6", "#8B5CF6"];
  const [copied, setCopied] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const handleShare = () => {
    const url = `binge.app/@${currentUserData.username}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateProfile({ avatarUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className="flex flex-col items-center gap-3 pt-2 pb-4">
      {" "}
      {/* Tappable avatar with camera overlay */}{" "}
      <button
        onClick={() => avatarInputRef.current?.click()}
        className="relative group active:scale-95 transition-transform"
        aria-label="Change profile photo"
      >
        {" "}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl font-display font-bold text-white shadow-lg overflow-hidden"
          style={{
            background: currentUserData.avatarUrl
              ? undefined
              : `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
            boxShadow: `0 4px 24px ${colors[0]}50`,
          }}
        >
          {" "}
          {currentUserData.avatarUrl ? (
            <img
              src={currentUserData.avatarUrl}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            currentUserData.name[0]
          )}{" "}
        </div>{" "}
        {/* Camera overlay */}{" "}
        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
          {" "}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {" "}
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />{" "}
            <circle cx="12" cy="13" r="4" />{" "}
          </svg>{" "}
        </div>{" "}
      </button>{" "}
      {/* Hidden file input */}{" "}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
      />{" "}
      <div className="text-center">
        {" "}
        <h2 className="font-display font-bold text-xl text-text-primary">
          {currentUserData.name}
        </h2>{" "}
        <p className="text-text-secondary text-sm font-body">@{currentUserData.username}</p>{" "}
        {/* Member Level Badge — text pill, no emoji */}{" "}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {" "}
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-body font-bold tracking-widest uppercase"
            style={{
              backgroundColor: `${level.color}18`,
              color: level.color,
              border: `1px solid ${level.color}40`,
            }}
          >
            {" "}
            {level.label} · {total} rated{" "}
          </span>{" "}
        </div>{" "}
        {/* Progress to next level */}{" "}
        {level.next && (
          <p className="text-text-muted text-[10px] font-body mt-1">
            {" "}
            {level.next - total} more to{" "}
            {level.next === 50 ? "Gold" : level.next === 100 ? "Platinum" : "Silver"}{" "}
          </p>
        )}{" "}
        {currentUserData.bio && (
          <p className="text-text-secondary text-xs font-body mt-2 italic max-w-[260px]">
            {" "}
            "{currentUserData.bio}"{" "}
          </p>
        )}{" "}
      </div>{" "}
      {/* Edit / Auth / Share buttons */}{" "}
      <div className="flex gap-2">
        {" "}
        {isAuthenticated ? (
          <button
            onClick={() => pushScreen({ screen: "profile-edit" })}
            className="px-4 py-1.5 rounded-full border border-border text-text-secondary text-xs font-body font-semibold hover:border-accent hover:text-accent transition-colors"
          >
            {" "}
            Edit Profile{" "}
          </button>
        ) : (
          <button
            onClick={() => pushScreen({ screen: "auth" })}
            className="px-4 py-1.5 rounded-full bg-accent text-white text-xs font-body font-semibold hover:bg-accent-light transition-colors"
          >
            {" "}
            Sign In / Sign Up{" "}
          </button>
        )}{" "}
        <button
          onClick={handleShare}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-body font-semibold transition-all ${copied ? "border-green-500 text-green-500 bg-green-500/10" : "border-border text-text-secondary hover:border-accent hover:text-accent"}`}
        >
          {" "}
          {copied ? (
            <>
              {" "}
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>{" "}
              Copied!{" "}
            </>
          ) : (
            <>
              {" "}
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>{" "}
              Share Profile{" "}
            </>
          )}{" "}
        </button>{" "}
      </div>{" "}
    </div>
  );
}
function StatsGrid({ stats }: { stats: ReturnType<typeof calcStats> }) {
  const items = [
    { label: "Movies", value: stats.totalMovies, icon: <FilmIcon /> },
    { label: "Shows", value: stats.totalShows, icon: <TvIcon /> },
    { label: "Avg Rating", value: stats.avg.toFixed(1), icon: <StarIcon /> },
    { label: "Hours", value: `${stats.hours}h`, icon: <ClockIcon /> },
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {" "}
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-bg-card rounded-xl p-3 border border-border text-center"
        >
          {" "}
          <div className="flex justify-center mb-1.5 text-text-muted">{item.icon}</div>{" "}
          <p className="font-display font-bold text-text-primary text-base leading-none">
            {item.value}
          </p>{" "}
          <p className="text-text-muted text-[10px] font-body mt-1">{item.label}</p>{" "}
        </div>
      ))}{" "}
    </div>
  );
}
function FavoritesSection({
  movieRatings,
  showRatings,
}: {
  movieRatings: MovieRating[];
  showRatings: ShowRating[];
}) {
  const { toggleMovieFavorite, toggleShowFavorite, pushScreen } = useApp();
  const favMovies = movieRatings.filter((r) => r.isFavorite);
  const favShows = showRatings.filter((r) => r.isFavorite);
  const hasFavorites = favMovies.length > 0 || favShows.length > 0;
  return (
    <div className="bg-bg-card rounded-2xl p-4 border border-border">
      {" "}
      <div className="flex items-center gap-2 mb-3">
        {" "}
        <span className="text-[10px] font-body font-semibold uppercase tracking-widest text-text-muted">
          Favorites
        </span>{" "}
      </div>{" "}
      {!hasFavorites ? (
        <p className="text-text-muted text-sm font-body text-center py-3">
          {" "}
          Heart titles in your lists to add them here{" "}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {" "}
          {favMovies.map((r) => (
            <div key={r.id} className="flex items-center gap-3">
              {" "}
              <button
                onClick={() => pushScreen({ screen: "movie-detail", movieId: r.movie.id })}
                className="flex items-center gap-3 flex-1 text-left active:opacity-80"
              >
                {" "}
                <PosterImage
                  title={r.movie.title}
                  year={r.movie.year}
                  posterPath={r.movie.posterPath}
                  size="sm"
                  className="w-9 h-12 rounded-lg flex-shrink-0"
                />{" "}
                <div className="flex-1 min-w-0">
                  {" "}
                  <p className="font-display font-semibold text-text-primary text-xs truncate">
                    {r.movie.title}
                  </p>{" "}
                  <p className="text-text-muted text-[10px] font-body">
                    {r.movie.year} · Movie
                  </p>{" "}
                </div>{" "}
                <RatingBadge rating={r.rating} size="sm" />{" "}
              </button>{" "}
              <button
                onClick={() => toggleMovieFavorite(r.id)}
                className="text-accent flex-shrink-0 hover:scale-110 transition-transform"
              >
                {" "}
                <HeartIcon filled />{" "}
              </button>{" "}
            </div>
          ))}{" "}
          {favShows.map((r) => (
            <div key={r.id} className="flex items-center gap-3">
              {" "}
              <button
                onClick={() => pushScreen({ screen: "show-detail", showId: r.show.id })}
                className="flex items-center gap-3 flex-1 text-left active:opacity-80"
              >
                {" "}
                <PosterImage
                  title={r.show.title}
                  year={r.show.year}
                  posterPath={r.show.posterPath}
                  size="sm"
                  className="w-9 h-12 rounded-lg flex-shrink-0"
                />{" "}
                <div className="flex-1 min-w-0">
                  {" "}
                  <p className="font-display font-semibold text-text-primary text-xs truncate">
                    {r.show.title}
                  </p>{" "}
                  <p className="text-text-muted text-[10px] font-body">{r.show.year} · Show</p>{" "}
                </div>{" "}
                <RatingBadge rating={r.overallRating} size="sm" />{" "}
              </button>{" "}
              <button
                onClick={() => toggleShowFavorite(r.id)}
                className="text-accent flex-shrink-0 hover:scale-110 transition-transform"
              >
                {" "}
                <HeartIcon filled />{" "}
              </button>{" "}
            </div>
          ))}{" "}
        </div>
      )}{" "}
    </div>
  );
}
// ─── Genre Filter ─────────────────────────────────────────────────────────────
function GenreFilter({
  selected,
  onChange,
}: {
  selected: string | null;
  onChange: (g: string | null) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {" "}
      <button
        onClick={() => onChange(null)}
        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-body font-semibold border transition-all ${selected === null ? "bg-accent border-accent text-white" : "border-border text-text-secondary"}`}
      >
        {" "}
        All{" "}
      </button>{" "}
      {genres.map((g) => (
        <button
          key={g}
          onClick={() => onChange(selected === g ? null : g)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-body font-semibold border transition-all ${selected === g ? "bg-accent border-accent text-white" : "border-border text-text-secondary"}`}
        >
          {" "}
          {g}{" "}
        </button>
      ))}{" "}
    </div>
  );
}
// ─── Inline Re-Rate Panel ─────────────────────────────────────────────────────
function InlineReRatePanel({
  currentRating,
  onSave,
  onCancel,
}: {
  currentRating: number;
  onSave: (rating: number) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(currentRating);
  const color = getRatingColor(draft);
  return (
    <div className="mx-0 mb-2 px-3 py-3 bg-bg-elevated rounded-xl border border-border animate-scaleIn">
      {" "}
      <div className="flex items-center gap-3 mb-2">
        {" "}
        <span className="text-text-muted text-xs font-body flex-shrink-0">Rating</span>{" "}
        <input
          type="range"
          min={1}
          max={10}
          step={0.1}
          value={draft}
          onChange={(e) => setDraft(parseFloat(e.target.value))}
          className="flex-1"
          style={{ accentColor: color }}
        />{" "}
        <span
          className="font-display font-bold text-sm w-8 text-right flex-shrink-0"
          style={{ color }}
        >
          {" "}
          {draft.toFixed(1)}{" "}
        </span>{" "}
      </div>{" "}
      <div className="flex items-center gap-2 justify-end">
        {" "}
        <button
          onClick={onCancel}
          className="text-text-muted text-xs font-body hover:text-text-secondary transition-colors px-2 py-1"
        >
          {" "}
          Cancel{" "}
        </button>{" "}
        <button
          onClick={() => onSave(draft)}
          className="px-4 py-1.5 bg-accent text-white text-xs font-body font-semibold rounded-full hover:bg-accent-light transition-colors active:scale-95"
        >
          {" "}
          Save{" "}
        </button>{" "}
      </div>{" "}
    </div>
  );
}
// ─── Movie / Show Row ─────────────────────────────────────────────────────────
function MovieRow({
  rating,
  rank,
  onPress,
  onFavorite,
}: {
  rating: MovieRating;
  rank: number;
  onPress: () => void;
  onFavorite: () => void;
}) {
  const { updateMovieRating } = useApp();
  const [editing, setEditing] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      {" "}
      <div className="flex items-center gap-2 py-3 w-full min-w-0">
        {" "}
        <button
          onClick={onPress}
          className="flex items-center gap-2 flex-1 min-w-0 text-left active:opacity-80 transition-opacity"
        >
          {" "}
          <span
            className="font-display font-bold w-5 text-center flex-shrink-0 text-xs"
            style={{ color: rank <= 3 ? "#F5A623" : "#606080" }}
          >
            {" "}
            {rank}{" "}
          </span>{" "}
          <PosterImage
            title={rating.movie.title}
            year={rating.movie.year}
            posterPath={rating.movie.posterPath}
            size="sm"
            className="w-9 h-12 rounded-lg flex-shrink-0"
          />{" "}
          <div className="flex-1 min-w-0">
            {" "}
            <p className="font-display font-semibold text-text-primary text-sm truncate">
              {rating.movie.title}
            </p>{" "}
            <div className="flex items-center gap-1.5 mt-0.5">
              {" "}
              <span className="text-text-muted text-xs">{rating.movie.year}</span>{" "}
              <span className="text-text-muted text-xs">·</span>{" "}
              <span className="text-text-muted text-xs">{rating.movie.genre[0]}</span>{" "}
            </div>{" "}
            {rating.review && (
              <p className="text-text-secondary text-xs mt-1 italic truncate">"{rating.review}"</p>
            )}{" "}
          </div>{" "}
          <RatingBadge rating={rating.rating} size="sm" />{" "}
        </button>{" "}
        {/* Edit + Favorite */}{" "}
        <button
          onClick={() => setEditing((v) => !v)}
          className={`flex-shrink-0 p-1 rounded-lg transition-colors ${editing ? "text-accent" : "text-text-muted/40 hover:text-text-muted"}`}
        >
          {" "}
          <PencilIcon />{" "}
        </button>{" "}
        <button
          onClick={onFavorite}
          className={`flex-shrink-0 p-1 rounded-lg transition-colors ${rating.isFavorite ? "text-accent" : "text-text-muted/30 hover:text-text-muted"}`}
        >
          {" "}
          <HeartIcon filled={rating.isFavorite} />{" "}
        </button>{" "}
      </div>{" "}
      {editing && (
        <InlineReRatePanel
          currentRating={rating.rating}
          onSave={(r) => {
            updateMovieRating(rating.id, r);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      )}{" "}
    </div>
  );
}
function ShowRow({
  rating,
  rank,
  onPress,
  onFavorite,
}: {
  rating: ShowRating;
  rank: number;
  onPress: () => void;
  onFavorite: () => void;
}) {
  const { updateShowRating } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      {" "}
      <div className="flex items-center gap-2 py-3 w-full min-w-0">
        {" "}
        <button
          onClick={onPress}
          className="flex items-center gap-2 flex-1 min-w-0 text-left active:opacity-80 transition-opacity"
        >
          {" "}
          <span
            className="font-display font-bold w-5 text-center flex-shrink-0 text-xs"
            style={{ color: rank <= 3 ? "#F5A623" : "#606080" }}
          >
            {" "}
            {rank}{" "}
          </span>{" "}
          <PosterImage
            title={rating.show.title}
            year={rating.show.year}
            posterPath={rating.show.posterPath}
            size="sm"
            className="w-9 h-12 rounded-lg flex-shrink-0"
          />{" "}
          <div className="flex-1 min-w-0">
            {" "}
            <p className="font-display font-semibold text-text-primary text-sm truncate">
              {rating.show.title}
            </p>{" "}
            <div className="flex items-center gap-1.5 mt-0.5">
              {" "}
              <span className="text-text-muted text-xs">{rating.show.year}</span>{" "}
              <span className="text-text-muted text-xs">·</span>{" "}
              <span className="text-text-muted text-xs">{rating.show.genre[0]}</span>{" "}
              <span className="text-text-muted text-xs">·</span>{" "}
              <span className="text-text-muted text-xs">{rating.seasonRatings.length}S</span>{" "}
            </div>{" "}
            {rating.review && (
              <p className="text-text-secondary text-xs mt-1 italic truncate">"{rating.review}"</p>
            )}{" "}
          </div>{" "}
        </button>{" "}
        <div className="flex items-center gap-1 flex-shrink-0">
          {" "}
          <RatingBadge rating={rating.overallRating} size="sm" />{" "}
          {rating.seasonRatings.length > 1 && (
            <button onClick={() => setExpanded((v) => !v)} className="p-1">
              {" "}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#606080"
                strokeWidth={2}
                strokeLinecap="round"
                className={`transition-transform ${expanded ? "rotate-180" : ""}`}
              >
                {" "}
                <polyline points="6 9 12 15 18 9" />{" "}
              </svg>{" "}
            </button>
          )}{" "}
          <button
            onClick={() => setEditing((v) => !v)}
            className={`p-1 rounded-lg transition-colors ${editing ? "text-accent" : "text-text-muted/40 hover:text-text-muted"}`}
          >
            {" "}
            <PencilIcon />{" "}
          </button>{" "}
          <button
            onClick={onFavorite}
            className={`p-1 rounded-lg transition-colors ${rating.isFavorite ? "text-accent" : "text-text-muted/30 hover:text-text-muted"}`}
          >
            {" "}
            <HeartIcon filled={rating.isFavorite} />{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      {editing && (
        <InlineReRatePanel
          currentRating={rating.overallRating}
          onSave={(r) => {
            updateShowRating(rating.id, r);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      )}{" "}
      {expanded && (
        <div className="pl-12 pr-4 pb-3 grid grid-cols-3 gap-2 animate-fadeIn">
          {" "}
          {rating.seasonRatings.map((sr) => (
            <div
              key={sr.season}
              className="bg-bg-elevated rounded-xl p-2 text-center border border-border"
            >
              {" "}
              <p className="text-text-muted text-xs font-body">S{sr.season}</p>{" "}
              <RatingBadge rating={sr.rating} size="sm" />{" "}
            </div>
          ))}{" "}
        </div>
      )}{" "}
    </div>
  );
}
// ─── Watchlist Row ────────────────────────────────────────────────────────────
function WatchlistRow({ item }: { item: ReturnType<typeof useApp>["watchlist"][number] }) {
  const { removeFromWatchlist, pushScreen } = useApp();
  const title = item.movie?.title ?? item.show?.title ?? "";
  const year = item.movie?.year ?? item.show?.year ?? 0;
  const posterPath = item.movie?.posterPath ?? item.show?.posterPath;
  const isMovie = item.contentType === "movie";
  const handlePress = () => {
    if (item.movie) pushScreen({ screen: "movie-detail", movieId: item.movie.id });
    else if (item.show) pushScreen({ screen: "show-detail", showId: item.show.id });
  };
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0 w-full min-w-0">
      {" "}
      <button
        onClick={handlePress}
        className="flex items-center gap-3 flex-1 min-w-0 text-left active:opacity-80 transition-opacity"
      >
        {" "}
        <PosterImage
          title={title}
          year={year}
          posterPath={posterPath}
          size="sm"
          className="w-9 h-12 rounded-lg flex-shrink-0"
        />{" "}
        <div className="flex-1 min-w-0">
          {" "}
          <p className="font-display font-semibold text-text-primary text-sm truncate">
            {title}
          </p>{" "}
          <div className="flex items-center gap-1.5 mt-0.5">
            {" "}
            <span className="text-text-muted text-xs">{year}</span>{" "}
            <span className="text-text-muted text-xs">·</span>{" "}
            <span
              className="text-[10px] font-body font-semibold px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: isMovie ? "#7C5CF620" : "#F056A820",
                color: isMovie ? "#7C5CF6" : "#F056A8",
              }}
            >
              {" "}
              {isMovie ? "Movie" : "Show"}{" "}
            </span>{" "}
          </div>{" "}
          {item.recommendedBy && (
            <p className="text-text-muted text-[10px] font-body mt-0.5">
              {" "}
              via {item.recommendedBy}{" "}
            </p>
          )}{" "}
        </div>{" "}
      </button>{" "}
      <button
        onClick={() => removeFromWatchlist(item.id)}
        className="flex-shrink-0 p-1.5 rounded-full text-text-muted/40 hover:text-text-muted hover:bg-bg-elevated transition-all"
        aria-label="Remove from watchlist"
      >
        {" "}
        <XIcon />{" "}
      </button>{" "}
    </div>
  );
}
// ─── Lists Section ────────────────────────────────────────────────────────────
function MyListsSection() {
  const {
    movieRatings,
    showRatings,
    watchlist,
    pushScreen,
    toggleMovieFavorite,
    toggleShowFavorite,
  } = useApp();
  const [contentType, setContentType] = useState<ListContentType>("movies");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"rating" | "recent">("rating");
  const filteredMovies = movieRatings
    .filter((r) => !selectedGenre || r.movie.genre.includes(selectedGenre))
    .sort((a, b) =>
      sortBy === "rating"
        ? b.rating - a.rating
        : new Date(b.dateWatched ?? b.createdAt ?? 0).getTime() - new Date(a.dateWatched ?? a.createdAt ?? 0).getTime(),
    );
  const filteredShows = showRatings
    .filter((r) => !selectedGenre || r.show.genre.includes(selectedGenre))
    .sort((a, b) =>
      sortBy === "rating"
        ? b.overallRating - a.overallRating
        : new Date(b.dateWatched ?? b.createdAt ?? 0).getTime() - new Date(a.dateWatched ?? a.createdAt ?? 0).getTime(),
    );
  const tabs: { id: ListContentType; label: string }[] = [
    { id: "movies", label: `Movies (${movieRatings.length})` },
    { id: "shows", label: `Shows (${showRatings.length})` },
    { id: "watchlist", label: `Saved (${watchlist.length})` },
  ];
  return (
    <div className="bg-bg-card rounded-2xl border border-border">
      {" "}
      {/* List header */}{" "}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        {" "}
        <span className="text-[10px] font-body font-semibold uppercase tracking-widest text-text-muted">
          My Lists
        </span>{" "}
        {contentType !== "watchlist" && (
          <button
            onClick={() => setSortBy((v) => (v === "rating" ? "recent" : "rating"))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-elevated border border-border text-text-secondary text-xs font-body"
          >
            {" "}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              {" "}
              <line x1="3" y1="6" x2="21" y2="6" /> <line x1="6" y1="12" x2="18" y2="12" />{" "}
              <line x1="10" y1="18" x2="14" y2="18" />{" "}
            </svg>{" "}
            {sortBy === "rating" ? "By Rating" : "Recent"}{" "}
          </button>
        )}{" "}
      </div>{" "}
      {/* Content type toggle — 3 tabs */}{" "}
      <div className="flex bg-bg-elevated mx-4 rounded-xl p-1 gap-1 mb-3">
        {" "}
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setContentType(t.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-body font-semibold transition-all ${contentType === t.id ? "bg-accent text-white shadow-sm" : "text-text-secondary"}`}
          >
            {" "}
            {t.label}{" "}
          </button>
        ))}{" "}
      </div>{" "}
      {/* Genre filter — only for movies/shows */}{" "}
      {contentType !== "watchlist" && (
        <div className="px-4 mb-3">
          {" "}
          <GenreFilter selected={selectedGenre} onChange={setSelectedGenre} />{" "}
        </div>
      )}{" "}
      {/* List content */}{" "}
      <div className="px-4 pb-4">
        {" "}
        {contentType === "movies" ? (
          filteredMovies.length === 0 ? (
            <div className="py-10 text-center text-text-muted">
              {" "}
              <div className="flex justify-center mb-2 opacity-40">
                <FilmIcon />
              </div>{" "}
              <p className="font-body text-sm">No movies yet. Add some!</p>{" "}
            </div>
          ) : (
            filteredMovies.map((r, i) => (
              <MovieRow
                key={r.id}
                rating={r}
                rank={i + 1}
                onPress={() => pushScreen({ screen: "movie-detail", movieId: r.movie.id })}
                onFavorite={() => toggleMovieFavorite(r.id)}
              />
            ))
          )
        ) : contentType === "shows" ? (
          filteredShows.length === 0 ? (
            <div className="py-10 text-center text-text-muted">
              {" "}
              <div className="flex justify-center mb-2 opacity-40">
                <TvIcon />
              </div>{" "}
              <p className="font-body text-sm">No shows yet. Add some!</p>{" "}
            </div>
          ) : (
            filteredShows.map((r, i) => (
              <ShowRow
                key={r.id}
                rating={r}
                rank={i + 1}
                onPress={() => pushScreen({ screen: "show-detail", showId: r.show.id })}
                onFavorite={() => toggleShowFavorite(r.id)}
              />
            ))
          )
        ) : watchlist.length === 0 ? (
          <div className="py-10 text-center text-text-muted">
            {" "}
            <div className="flex justify-center mb-2 opacity-40">
              <BookmarkIcon />
            </div>{" "}
            <p className="font-body text-sm">Nothing saved yet.</p>{" "}
            <p className="text-xs mt-1">Add titles from What's Next.</p>{" "}
          </div>
        ) : (
          watchlist.map((item) => <WatchlistRow key={item.id} item={item} />)
        )}{" "}
      </div>{" "}
    </div>
  );
}
// ─── Taste Profile ────────────────────────────────────────────────────────────
function GenreBreakdown({ breakdown }: { breakdown: [string, number][] }) {
  const max = breakdown[0]?.[1] ?? 1;
  return (
    <div className="bg-bg-card rounded-2xl p-4 border border-border">
      {" "}
      <p className="text-[10px] font-body font-semibold uppercase tracking-widest text-text-muted mb-3">
        Taste Profile
      </p>{" "}
      <div className="flex flex-col gap-2.5">
        {" "}
        {breakdown.map(([genre, count]) => {
          const pct = (count / max) * 100;
          return (
            <div key={genre}>
              {" "}
              <div className="flex justify-between mb-1">
                {" "}
                <span className="text-text-primary text-xs font-body">{genre}</span>{" "}
                <span className="text-text-muted text-xs font-body">{count} titles</span>{" "}
              </div>{" "}
              <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                {" "}
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background: "linear-gradient(90deg, #7C5CF6AA, #7C5CF6)",
                  }}
                />{" "}
              </div>{" "}
            </div>
          );
        })}{" "}
      </div>{" "}
    </div>
  );
}
function RatingDistribution({
  movieRatings,
  showRatings,
}: {
  movieRatings: MovieRating[];
  showRatings: ShowRating[];
}) {
  const allRatings = [
    ...movieRatings.map((r) => r.rating),
    ...showRatings.map((r) => r.overallRating),
  ];
  const buckets = [
    { label: "9–10", min: 9, max: 10.1 },
    { label: "7–8.9", min: 7, max: 9 },
    { label: "5–6.9", min: 5, max: 7 },
    { label: "<5", min: 0, max: 5 },
  ];
  const counts = buckets.map((b) => ({
    ...b,
    count: allRatings.filter((r) => r >= b.min && r < b.max).length,
  }));
  const maxCount = Math.max(...counts.map((c) => c.count), 1);
  return (
    <div className="bg-bg-card rounded-2xl p-4 border border-border">
      {" "}
      <p className="text-[10px] font-body font-semibold uppercase tracking-widest text-text-muted mb-3">
        Rating Distribution
      </p>{" "}
      <div className="flex items-end gap-2 h-16">
        {" "}
        {counts.map((b) => {
          const height = (b.count / maxCount) * 100;
          const color = getRatingColor(b.min + 0.5);
          return (
            <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
              {" "}
              <span className="text-text-muted text-[10px] font-body">{b.count}</span>{" "}
              <div
                className="w-full rounded-t-md transition-all"
                style={{
                  height: `${Math.max(height, 8)}%`,
                  backgroundColor: color,
                  minHeight: b.count > 0 ? "8px" : "2px",
                  opacity: b.count === 0 ? 0.3 : 1,
                }}
              />{" "}
              <span className="text-text-muted text-[9px] font-body">{b.label}</span>{" "}
            </div>
          );
        })}{" "}
      </div>{" "}
    </div>
  );
}
function ActivityTimeline() {
  const { currentUserData, pushScreen, feedActivities } = useApp();
  const myActivities = feedActivities
    .filter((a) => a.user?.id === currentUserData.id || a.userId === currentUserData.id)
    .slice(0, 8)
    .sort((a, b) => new Date(b.timestamp ?? b.createdAt ?? 0).getTime() - new Date(a.timestamp ?? a.createdAt ?? 0).getTime());
  return (
    <div className="bg-bg-card rounded-2xl p-4 border border-border">
      {" "}
      <p className="text-[10px] font-body font-semibold uppercase tracking-widest text-text-muted mb-3">
        Recent Activity
      </p>{" "}
      {myActivities.length === 0 ? (
        <p className="text-text-muted text-sm font-body text-center py-4">
          No ratings yet — start rating!
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {" "}
          {myActivities.map((a) => {
            const title = a.movie?.title ?? a.show?.title ?? "";
            return (
              <div key={a.id} className="flex items-center gap-3">
                {" "}
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    backgroundColor: ["#7C5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"][
                      parseInt((a.user?.id ?? a.userId ?? "0").replace(/\D/g, "")) % 5
                    ],
                  }}
                >
                  {" "}
                  {(a.user?.name ?? "?")[0]}{" "}
                </div>{" "}
                <button
                  onClick={() => {
                    if (a.movie) pushScreen({ screen: "movie-detail", movieId: a.movie.id });
                    else if (a.show) pushScreen({ screen: "show-detail", showId: a.show.id });
                  }}
                  className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                >
                  {" "}
                  <p className="text-text-primary text-xs font-body truncate">
                    {" "}
                    <span className="font-semibold">{a.user?.name ?? "?"}</span>{" "}
                    {a.type === "watchlist_add" ? "saved" : "rated"}{" "}
                    <span className="text-accent">{title}</span>{" "}
                  </p>{" "}
                  <p className="text-text-muted text-[10px] font-body">
                    {timeAgo(a.timestamp ?? a.createdAt ?? "")}
                  </p>{" "}
                </button>{" "}
                {a.rating && <RatingBadge rating={a.rating} size="sm" />}{" "}
              </div>
            );
          })}{" "}
        </div>
      )}{" "}
    </div>
  );
}
// ─── Main ProfileTab ──────────────────────────────────────────────────────────
export default function ProfileTab() {
  const { movieRatings, showRatings, pushScreen } = useApp();
  const stats = useMemo(() => calcStats(movieRatings, showRatings), [movieRatings, showRatings]);
  const genreBreakdown = useMemo(
    () => calcGenreBreakdown(movieRatings, showRatings),
    [movieRatings, showRatings],
  );
  return (
    <div className="min-h-screen bg-bg-primary">
      {" "}
      {/* Header */}{" "}
      <div className="px-4 pt-6 pb-2 flex items-center justify-between">
        {" "}
        <h1 className="font-display font-semibold text-xl text-text-primary">Profile</h1>{" "}
        <button
          onClick={() => pushScreen({ screen: "settings" })}
          className="w-8 h-8 flex items-center justify-center text-text-secondary active:text-text-primary transition-colors"
          aria-label="Settings"
        >
          {" "}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {" "}
            <circle cx="12" cy="12" r="3" />{" "}
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />{" "}
          </svg>{" "}
        </button>{" "}
      </div>{" "}
      <div className="px-4 pb-24 space-y-3">
        {" "}
        <UserHeader /> <MyWatchingStatus /> <StatsGrid stats={stats} />{" "}
        <FavoritesSection movieRatings={movieRatings} showRatings={showRatings} />{" "}
        <MyListsSection />{" "}
        {genreBreakdown.length > 0 && <GenreBreakdown breakdown={genreBreakdown} />}{" "}
        <RatingDistribution movieRatings={movieRatings} showRatings={showRatings} />{" "}
        <ActivityTimeline />{" "}
      </div>{" "}
    </div>
  );
}
