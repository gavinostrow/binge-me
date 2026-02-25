"use client";

import { useApp } from "@/lib/AppContext";
import { TabId } from "@/lib/types";

// Order matches screenshot: Feed | Next | + Add | Groups/Clubs | Profile
const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: "feed", label: "Feed", icon: "feed" },
  { id: "next", label: "Next", icon: "next" },
  { id: "add", label: "Add", icon: "plus" },
  { id: "groups", label: "Clubs", icon: "clubs" },
  { id: "profile", label: "Profile", icon: "person" },
];

function TabIcon({ icon, active }: { icon: string; active: boolean }) {
  const color = active ? "#E8E4DC" : "#5E586E";

  switch (icon) {
    case "feed":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
          <polyline points="9 21 9 12 15 12 15 21" />
        </svg>
      );
    case "next":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
          <polygon points="5 3 19 12 5 21 5 3" />
          <line x1="19" y1="3" x2="19" y2="21" />
        </svg>
      );
    case "plus":
      return null;
    case "clubs":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "person":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    default:
      return null;
  }
}

export default function BottomNav() {
  const { activeTab, setActiveTab, unreadCount } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg-surface border-t border-bg-elevated z-50">
      <div className="max-w-app mx-auto flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isAdd = tab.id === "add";
          const isFeed = tab.id === "feed";

          if (isAdd) {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative -mt-5 w-14 h-14 rounded-full bg-accent-purple flex items-center justify-center shadow-lg shadow-accent-purple/30 active:scale-95 transition-transform"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="absolute -bottom-5 text-[10px] font-medium text-text-muted">Add</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center gap-1 py-2 px-3 transition-all active:scale-95 active:opacity-70"
            >
              <div className="relative">
                <TabIcon icon={tab.icon} active={isActive} />
                {isFeed && unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-text-primary" : "text-text-muted"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
