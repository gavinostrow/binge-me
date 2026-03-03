"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { Club } from "@/lib/types";
import { getInitial } from "@/lib/utils";
import RatingBadge from "@/components/RatingBadge";

type ClubsView = "my" | "discover";

export default function ClubsTab() {
  const { myClubs, discoverClubs, joinClub, leaveClub } = useApp();
  const [view, setView] = useState<ClubsView>("my");
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  if (selectedClub) {
    const isMember = myClubs.some((c) => c.id === selectedClub.id);
    const club = isMember
      ? myClubs.find((c) => c.id === selectedClub.id)!
      : discoverClubs.find((c) => c.id === selectedClub.id) ?? selectedClub;

    return (
      <div className="flex flex-col gap-4 px-4 pb-24">
        {/* Header */}
        <div className="pt-4 flex items-center gap-3">
          <button
            onClick={() => setSelectedClub(null)}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-xl truncate">{club.name}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              club.type === "private"
                ? "bg-accent-purple/20 text-accent-purple"
                : "bg-accent-gold/20 text-accent-gold"
            }`}>
              {club.type === "private" ? "Private" : "Public"}
            </span>
          </div>
        </div>

        {/* Club icon + description */}
        <div className="bg-bg-surface rounded-xl p-5 flex flex-col items-center gap-3 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white font-display"
            style={{ backgroundColor: club.iconColor }}
          >
            {club.name.charAt(0)}
          </div>
          <p className="text-text-secondary text-sm">{club.description}</p>
          <div className="text-text-muted text-xs">
            {club.members.length} member{club.members.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Top pick */}
        {club.topPick && (
          <div className="bg-bg-surface rounded-xl p-4">
            <h3 className="text-text-muted text-xs font-display font-bold tracking-widest uppercase mb-2">
              TOP PICK
            </h3>
            <div className="flex items-center justify-between">
              <span className="font-medium">{club.topPick.title}</span>
              <RatingBadge rating={club.topPick.rating} size="sm" />
            </div>
          </div>
        )}

        {/* Members */}
        <div className="bg-bg-surface rounded-xl p-4">
          <h3 className="font-display font-semibold mb-3">Members</h3>
          <div className="flex flex-col gap-3">
            {club.members.map((member) => (
              <div key={member.userId} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: member.user.avatarColor }}
                >
                  {getInitial(member.user.displayName)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate block">
                    {member.user.displayName}
                  </span>
                  <span className="text-xs text-text-muted">{member.user.handle}</span>
                </div>
                {member.role === "owner" && (
                  <span className="text-xs bg-accent-gold/20 text-accent-gold px-2 py-0.5 rounded-full">
                    Owner
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Join/Leave button */}
        {isMember ? (
          <button
            onClick={() => {
              leaveClub(club.id);
              setSelectedClub(null);
            }}
            className="bg-bg-surface border border-bg-elevated text-text-secondary rounded-lg py-3 font-semibold w-full text-center"
          >
            Leave Club
          </button>
        ) : (
          <button
            onClick={() => {
              joinClub(club.id);
              setSelectedClub(null);
            }}
            className="bg-accent-purple text-white rounded-lg py-3 font-semibold w-full hover:opacity-90 transition-opacity"
          >
            Join Club
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-24">
      {/* Header */}
      <div className="pt-4 px-1">
        <h1 className="text-2xl font-bold font-display text-text-primary">Clubs</h1>
      </div>

      {/* My Clubs / Discover toggle */}
      <div className="flex bg-bg-elevated rounded-lg p-1">
        <button
          onClick={() => setView("my")}
          className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
            view === "my"
              ? "bg-bg-hover text-text-primary"
              : "text-text-muted"
          }`}
        >
          My Clubs
        </button>
        <button
          onClick={() => setView("discover")}
          className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
            view === "discover"
              ? "bg-bg-hover text-text-primary"
              : "text-text-muted"
          }`}
        >
          Discover
        </button>
      </div>

      {/* Club list */}
      {view === "my" ? (
        <div className="flex flex-col gap-3 animate-fadeIn">
          {myClubs.length > 0 ? (
            myClubs.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                onSelect={() => setSelectedClub(club)}
              />
            ))
          ) : (
            <div className="text-center text-text-muted text-sm py-8">
              You haven&apos;t joined any clubs yet. Discover some!
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 animate-fadeIn">
          {discoverClubs.length > 0 ? (
            discoverClubs.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                onSelect={() => setSelectedClub(club)}
                showJoin
                onJoin={() => joinClub(club.id)}
              />
            ))
          ) : (
            <div className="text-center text-text-muted text-sm py-8">
              No more clubs to discover. You&apos;re in them all!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ClubCard({
  club,
  onSelect,
  showJoin,
  onJoin,
}: {
  club: Club;
  onSelect: () => void;
  showJoin?: boolean;
  onJoin?: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className="bg-bg-surface rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-bg-hover transition-colors"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white font-display shrink-0"
        style={{ backgroundColor: club.iconColor }}
      >
        {club.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-text-primary truncate">{club.name}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
            club.type === "private"
              ? "bg-accent-purple/20 text-accent-purple"
              : "bg-accent-gold/20 text-accent-gold"
          }`}>
            {club.type === "private" ? "Private" : "Public"}
          </span>
        </div>
        <p className="text-text-muted text-xs mt-0.5 truncate">{club.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-text-muted text-xs">
            {club.members.length} member{club.members.length !== 1 ? "s" : ""}
          </span>
          {club.topPick && (
            <>
              <span className="text-text-muted text-xs">&middot;</span>
              <span className="text-text-secondary text-xs truncate">
                Top: {club.topPick.title}
              </span>
            </>
          )}
        </div>
      </div>
      {showJoin && onJoin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onJoin();
          }}
          className="bg-accent-purple text-white text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 hover:opacity-90 transition-opacity"
        >
          Join
        </button>
      )}
    </div>
  );
}
