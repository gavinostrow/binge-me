"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { friends } from "@/lib/mockData";
import { Movie, Show } from "@/lib/types";

interface SendRecommendationSheetProps {
  item: Movie | Show;
  itemType: "movie" | "show";
  onClose: () => void;
}

export default function SendRecommendationSheet({
  item,
  itemType,
  onClose,
}: SendRecommendationSheetProps) {
  const { sendRecommendation, notifications } = useApp();
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  const toggleFriend = (id: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    if (selectedFriendIds.length === 0) return;
    for (const friendId of selectedFriendIds) {
      const friend = friends.find((f) => f.id === friendId);
      if (!friend) continue;
      sendRecommendation({
        id: `rec_${Date.now()}_${friendId}`,
        type: "recommendation",
        fromUserId: "u1",
        message: `You recommended ${item.title} to ${friend.displayName ?? friend.name}${note ? ` — "${note}"` : ""}`,
        timestamp: new Date().toISOString(),
        seen: false,
      });
    }
    setSent(true);
    setTimeout(onClose, 1200);
  };

  const title = item.title;
  const year = item.year;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-bg-surface rounded-t-2xl w-full max-w-app flex flex-col max-h-[80vh] animate-scaleIn">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-bg-elevated rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-bg-elevated">
          <div>
            <h2 className="font-display font-semibold text-text-primary">
              Send Recommendation
            </h2>
            <p className="text-text-muted text-xs mt-0.5 truncate max-w-[220px]">
              {title} · {year}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-secondary active:opacity-60 transition-opacity"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-14 h-14 rounded-full bg-accent-purple/20 flex items-center justify-center text-2xl">
              ✓
            </div>
            <p className="text-text-primary font-semibold">Recommendation sent!</p>
          </div>
        ) : (
          <div className="overflow-y-auto pb-8">
            {/* Friend list */}
            <div className="px-5 pt-4">
              <p className="text-text-muted text-xs uppercase tracking-wide font-semibold mb-3">
                Choose friends
              </p>
              <div className="flex flex-col gap-2">
                {friends.map((friend) => {
                  const selected = selectedFriendIds.includes(friend.id);
                  return (
                    <button
                      key={friend.id}
                      onClick={() => toggleFriend(friend.id)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all active:scale-[0.98] ${
                        selected
                          ? "bg-accent-purple/15 border border-accent-purple/40"
                          : "bg-bg-elevated border border-transparent"
                      }`}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ backgroundColor: friend.avatarColor ?? "#8B5CF6" }}
                      >
                        {(friend.displayName ?? friend.name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-text-primary text-sm font-medium truncate">
                          {friend.displayName ?? friend.name}
                        </p>
                        <p className="text-text-muted text-xs truncate">
                          {friend.handle ?? friend.username ?? ""}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selected
                            ? "border-accent-purple bg-accent-purple"
                            : "border-text-muted/40"
                        }`}
                      >
                        {selected && (
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note */}
            <div className="px-5 pt-4">
              <p className="text-text-muted text-xs uppercase tracking-wide font-semibold mb-2">
                Add a note (optional)
              </p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="You have to watch this..."
                maxLength={140}
                rows={2}
                className="w-full bg-bg-elevated text-text-primary text-sm rounded-xl px-4 py-3 resize-none outline-none placeholder:text-text-muted border border-transparent focus:border-accent-purple/40 transition-colors"
              />
            </div>

            {/* Send button */}
            <div className="px-5 pt-4">
              <button
                onClick={handleSend}
                disabled={selectedFriendIds.length === 0}
                className={`w-full py-3.5 rounded-xl font-display font-bold text-sm transition-all active:scale-[0.98] ${
                  selectedFriendIds.length > 0
                    ? "bg-accent-purple text-white"
                    : "bg-bg-elevated text-text-muted cursor-not-allowed"
                }`}
              >
                {selectedFriendIds.length > 0
                  ? `Send to ${selectedFriendIds.length} friend${selectedFriendIds.length > 1 ? "s" : ""}`
                  : "Select a friend to send"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
