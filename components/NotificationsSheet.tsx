"use client";

import { Notification as AppNotification } from "@/lib/types";
import { friends } from "@/lib/mockData";
import { timeAgo } from "@/lib/utils";
import PosterImage from "@/components/PosterImage";

interface NotificationsSheetProps {
  notifications: AppNotification[];
  onClose: () => void;
}

function NotifIcon({ type }: { type: string }) {
  if (type === "recommendation") {
    return (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    );
  }
  if (type === "reaction") {
    return (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    );
  }
  if (type === "comment") {
    return (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  if (type === "follow") {
    return (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    );
  }
  return <span className="text-[9px]">•</span>;
}

function notifLabel(type: string) {
  if (type === "recommendation") return "recommended";
  if (type === "reaction") return "reacted";
  if (type === "comment") return "commented";
  if (type === "follow") return "followed you";
  return type;
}

export default function NotificationsSheet({ notifications, onClose }: NotificationsSheetProps) {
  const getFriend = (userId: string) => friends.find((f) => f.id === userId);

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
            className="text-text-muted active:opacity-60 transition-opacity"
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
                const friend = notif.fromUserId
                  ? getFriend(notif.fromUserId)
                  : notif.fromUser ?? null;
                const contentItem = notif.movie ?? notif.show ?? null;
                const isRec = notif.type === "recommendation";

                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-5 py-4 border-b border-bg-elevated ${
                      !notif.seen ? "bg-accent-purple/5" : ""
                    }`}
                  >
                    {/* Avatar with type badge */}
                    <div className="relative shrink-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ backgroundColor: friend?.avatarColor ?? "#8B5CF6" }}
                      >
                        {(friend?.displayName ?? friend?.name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-bg-primary rounded-full flex items-center justify-center text-accent-purple">
                        <NotifIcon type={notif.type} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary leading-snug">
                        <span className="font-semibold">
                          {friend?.displayName ?? friend?.name ?? "Someone"}
                        </span>
                        {" "}
                        <span className="text-text-muted">{notifLabel(notif.type)}</span>
                        {isRec && contentItem && (
                          <span className="text-text-primary font-semibold"> {contentItem.title}</span>
                        )}
                      </p>
                      {notif.message && (
                        <p className="text-xs text-text-secondary mt-0.5 italic">
                          &ldquo;{notif.message}&rdquo;
                        </p>
                      )}
                      <p className="text-xs text-text-muted mt-0.5" suppressHydrationWarning>
                        {timeAgo(notif.timestamp ?? notif.createdAt ?? "")}
                      </p>
                    </div>

                    {/* Poster thumbnail for recs */}
                    {isRec && contentItem && (
                      <PosterImage
                        title={contentItem.title}
                        year={contentItem.year}
                        posterPath={(contentItem as any).posterPath}
                        size="sm"
                      />
                    )}

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
