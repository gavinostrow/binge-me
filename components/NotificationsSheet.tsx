"use client";

import { Notification as AppNotification } from "@/lib/types";
import { friends } from "@/lib/mockData";
import { timeAgo } from "@/lib/utils";

const NOTIF_ICONS: Record<string, string> = {
  reaction: "★",
  tag: "@",
  friend_rating: "◉",
};

interface NotificationsSheetProps {
  notifications: AppNotification[];
  onClose: () => void;
}

export default function NotificationsSheet({ notifications, onClose }: NotificationsSheetProps) {
  const getFriend = (userId: string) =>
    friends.find((f) => f.id === userId);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-bg-surface rounded-t-2xl w-full max-w-app flex flex-col max-h-[75vh]">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-bg-elevated rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-bg-elevated">
          <h2 className="font-display font-semibold text-text-primary">Notifications</h2>
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

        {/* List */}
        <div className="overflow-y-auto pb-8">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-sm">
              No notifications yet.
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif) => {
                const friend = notif.fromUserId ? getFriend(notif.fromUserId) : notif.fromUser ?? null;
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-5 py-4 border-b border-bg-elevated transition-colors ${
                      !notif.seen ? "bg-accent-purple/5" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ backgroundColor: friend?.avatarColor ?? "#8B5CF6" }}
                      >
                        {(friend?.displayName ?? friend?.name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      {/* Type icon badge */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-bg-surface rounded-full flex items-center justify-center text-[9px]">
                        {NOTIF_ICONS[notif.type] ?? "•"}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary leading-snug">{notif.message}</p>
                      <p className="text-xs text-text-muted mt-0.5">{timeAgo(notif.timestamp ?? notif.createdAt ?? "")}</p>
                    </div>

                    {/* Unread dot */}
                    {!notif.seen && (
                      <div className="w-2 h-2 rounded-full bg-accent-purple shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
