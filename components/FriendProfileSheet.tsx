"use client";

import { useState } from "react";
import { User } from "@/lib/types";
import { getRatingColor } from "@/lib/utils";
import { tasteMatchPercentages, friendRatings, myMovieRatings, myShowRatings } from "@/lib/mockData";

interface FriendProfileSheetProps {
  friend: User;
  onClose: () => void;
}

function TasteMatchArc({ pct }: { pct: number }) {
  const color =
    pct >= 80 ? "#22C55E" : pct >= 60 ? "#EAB308" : "#9994A8";
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center border-4"
        style={{ borderColor: color }}
      >
        <span className="font-display font-bold text-lg" style={{ color }}>
          {pct}%
        </span>
      </div>
      <span className="text-text-muted text-xs">taste match</span>
    </div>
  );
}

export default function FriendProfileSheet({ friend, onClose }: FriendProfileSheetProps) {
  const [activeSection, setActiveSection] = useState<"both" | "disagree">("both");
  const tasteMatch = tasteMatchPercentages[friend.id] ?? 50;

  // Build a lookup of current user's ratings by title
  const myRatingsByTitle: Record<string, number> = {};
  for (const mr of myMovieRatings) {
    myRatingsByTitle[mr.movie.title] = mr.rating;
  }
  for (const sr of myShowRatings) {
    myRatingsByTitle[sr.show.title] = sr.overallRating;
  }

  // Get friend's ratings
  const theirRatings = friendRatings[friend.id] ?? [];

  // Both rated: titles that appear in both
  const bothRated = theirRatings
    .filter((fr) => myRatingsByTitle[fr.title] !== undefined)
    .map((fr) => ({
      title: fr.title,
      type: fr.type,
      year: fr.year,
      myRating: myRatingsByTitle[fr.title],
      theirRating: fr.rating,
      diff: Math.abs(myRatingsByTitle[fr.title] - fr.rating),
    }));

  // Sort for "Both Love": average highest rated first
  const bothLove = [...bothRated]
    .sort((a, b) => (b.myRating + b.theirRating) - (a.myRating + a.theirRating))
    .slice(0, 5);

  // Sort for disagreements: biggest diff first
  const disagreements = [...bothRated]
    .filter((item) => item.diff >= 1.5)
    .sort((a, b) => b.diff - a.diff)
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-bg-surface rounded-t-2xl w-full max-w-app flex flex-col max-h-[88vh] animate-scaleIn">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-bg-elevated rounded-full" />
        </div>

        <div className="overflow-y-auto px-5 pb-10">
          {/* Header: Avatar + Name + Taste Match */}
          <div className="flex items-center gap-4 py-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
              style={{ backgroundColor: friend.avatarColor }}
            >
              {(friend.displayName ?? friend.name ?? "?").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-semibold text-text-primary text-lg leading-tight">
                {friend.displayName ?? friend.name}
              </h2>
              <p className="text-text-muted text-sm">{friend.handle ?? friend.username ?? ""}</p>
              {friend.bio && (
                <p className="text-text-secondary text-xs mt-1 leading-relaxed">
                  {friend.bio}
                </p>
              )}
            </div>
            <TasteMatchArc pct={tasteMatch} />
          </div>

          {/* Mount Rushmore */}
          {friend.mountRushmore && friend.mountRushmore.length > 0 && (
            <div className="bg-bg-elevated rounded-xl p-4 mb-4">
              <div className="w-6 h-0.5 bg-accent-gold rounded mb-1" />
              <h3 className="text-accent-gold text-xs font-display font-bold tracking-widest uppercase mb-3">
                MOUNT RUSHMORE
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {friend.mountRushmore.map((item, i) => (
                  <div key={i} className="bg-bg-surface rounded-lg p-2.5">
                    <span className="text-text-muted text-xs">{i + 1}</span>
                    <p className="font-medium text-sm text-text-primary leading-tight mt-0.5 truncate">
                      {item.title}
                    </p>
                    <span className="text-xs text-text-muted capitalize">{item.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comparison section */}
          {bothRated.length > 0 && (
            <div className="bg-bg-elevated rounded-xl p-4">
              {/* Sub-tabs */}
              <div className="flex bg-bg-surface rounded-lg p-1 mb-4">
                <button
                  onClick={() => setActiveSection("both")}
                  className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                    activeSection === "both"
                      ? "bg-bg-hover text-text-primary"
                      : "text-text-muted"
                  }`}
                >
                  What We Both Love
                </button>
                <button
                  onClick={() => setActiveSection("disagree")}
                  className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                    activeSection === "disagree"
                      ? "bg-bg-hover text-text-primary"
                      : "text-text-muted"
                  }`}
                >
                  Where We Disagree
                </button>
              </div>

              {activeSection === "both" && (
                <div className="flex flex-col gap-3">
                  {bothLove.length > 0 ? (
                    bothLove.map((item) => (
                      <ComparisonRow
                        key={item.title}
                        title={item.title}
                        year={item.year}
                        myRating={item.myRating}
                        theirRating={item.theirRating}
                        friendName={(friend.displayName ?? friend.name ?? "Friend").split(" ")[0]}
                      />
                    ))
                  ) : (
                    <p className="text-text-muted text-sm text-center py-4">
                      No ratings in common yet.
                    </p>
                  )}
                </div>
              )}

              {activeSection === "disagree" && (
                <div className="flex flex-col gap-3">
                  {disagreements.length > 0 ? (
                    disagreements.map((item) => (
                      <ComparisonRow
                        key={item.title}
                        title={item.title}
                        year={item.year}
                        myRating={item.myRating}
                        theirRating={item.theirRating}
                        friendName={(friend.displayName ?? friend.name ?? "Friend").split(" ")[0]}
                        showDiff
                      />
                    ))
                  ) : (
                    <p className="text-text-muted text-sm text-center py-4">
                      You agree on most things — no big gaps yet!
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full mt-4 bg-bg-elevated text-text-secondary text-sm font-medium py-3 rounded-lg active:scale-[0.98] transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ComparisonRow({
  title,
  year,
  myRating,
  theirRating,
  friendName,
  showDiff = false,
}: {
  title: string;
  year: number;
  myRating: number;
  theirRating: number;
  friendName: string;
  showDiff?: boolean;
}) {
  const diff = Math.abs(myRating - theirRating).toFixed(1);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-text-primary leading-tight flex-1 mr-2 truncate">
          {title}
        </span>
        <span className="text-text-muted text-xs shrink-0">{year}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-text-muted text-xs w-5">You</span>
          <span
            className="font-display font-bold text-sm"
            style={{ color: getRatingColor(myRating) }}
          >
            {myRating.toFixed(1)}
          </span>
        </div>
        <div className="flex-1 h-px bg-bg-surface" />
        <div className="flex items-center gap-1.5">
          <span className="text-text-muted text-xs">{friendName}</span>
          <span
            className="font-display font-bold text-sm"
            style={{ color: getRatingColor(theirRating) }}
          >
            {theirRating.toFixed(1)}
          </span>
        </div>
        {showDiff && (
          <span className="text-text-muted text-xs ml-1">({diff} gap)</span>
        )}
      </div>
    </div>
  );
}
