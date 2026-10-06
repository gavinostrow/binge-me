"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/AppContext";
import { useSocial } from "@/lib/SocialContext";
import { tasteMatch } from "@/lib/social";
import ScreenHeader from "@/components/social/ScreenHeader";
import UserAvatar from "@/components/social/UserAvatar";
import type { User } from "@/lib/types";

/** Find people by username, invite friends by link, manage who you follow. */
export default function FindFriendsScreen() {
  const { pushScreen, currentUserData } = useApp();
  const { allUsers, followingIds, follow, unfollow, isFollowing, myRows, showToast } = useSocial();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase().replace(/^@/, "");
  const results = useMemo(
    () => (q ? allUsers.filter((u) => u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q)) : []),
    [q, allUsers],
  );
  const following = allUsers.filter((u) => followingIds.includes(u.id));
  const suggested = allUsers.filter((u) => !followingIds.includes(u.id));

  const inviteUrl =
    typeof window !== "undefined" ? `${window.location.origin}/?invite=${encodeURIComponent(currentUserData.username)}` : "";

  const invite = async () => {
    const text = `I'm on Binge — rate shows and movies with me. Add me: @${currentUserData.username}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Join me on Binge", text, url: inviteUrl });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${inviteUrl}`);
      showToast("Invite link copied");
    } catch {
      /* share sheet dismissed */
    }
  };

  const Row = ({ u }: { u: User }) => {
    const on = isFollowing(u.id);
    const match = tasteMatch(myRows, u.id);
    return (
      <div className="flex items-center gap-3 py-2.5">
        <button onClick={() => pushScreen({ screen: "profile", userId: u.id })} className="flex items-center gap-3 flex-1 min-w-0 text-left">
          <UserAvatar user={u} size="md" />
          <div className="min-w-0">
            <p className="text-text-primary text-sm font-display font-semibold truncate">{u.name}</p>
            <p className="text-text-muted text-xs font-body truncate">
              @{u.username}
              {on && ` · ${match.pct}% taste match`}
            </p>
          </div>
        </button>
        <button
          onClick={() => {
            if (on) {
              unfollow(u.id);
            } else {
              follow(u.id);
              showToast(`Added ${u.name.split(" ")[0]}`);
            }
          }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-display font-bold flex-shrink-0 ${
            on ? "bg-bg-elevated text-text-secondary border border-border" : "bg-accent text-white"
          }`}
        >
          {on ? "Friends" : "Add"}
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-bg-primary">
      <ScreenHeader title="Find friends" />
      <div className="px-4 pt-4 pb-28 space-y-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or @username"
          autoCapitalize="none"
          autoCorrect="off"
          className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent font-body"
        />

        {q ? (
          <div>
            {results.length === 0 ? (
              <p className="text-text-secondary text-sm text-center py-6">No one with that username yet. Invite them below.</p>
            ) : (
              <div className="divide-y divide-border">{results.map((u) => <Row key={u.id} u={u} />)}</div>
            )}
          </div>
        ) : null}

        <button
          onClick={invite}
          className="w-full rounded-2xl p-4 text-left bg-bg-card border border-border flex items-center gap-3 transition-transform"
        >
          <span className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white font-display font-bold text-lg">+</span>
          <div className="flex-1">
            <p className="text-text-primary font-display font-bold">Invite friends</p>
            <p className="text-text-secondary text-xs font-body">Text them a link to add you · @{currentUserData.username}</p>
          </div>
        </button>

        {!q && suggested.length > 0 && (
          <div>
            <p className="text-text-muted text-xs font-body uppercase tracking-wider mb-1">People you may know</p>
            <div className="divide-y divide-border">{suggested.map((u) => <Row key={u.id} u={u} />)}</div>
          </div>
        )}

        {!q && (
          <div>
            <p className="text-text-muted text-xs font-body uppercase tracking-wider mb-1">Your friends · {following.length}</p>
            <div className="divide-y divide-border">{following.map((u) => <Row key={u.id} u={u} />)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
