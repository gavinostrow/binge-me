"use client";

import { TabId } from "@/lib/types";
import { useApp } from "@/lib/AppContext";

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: "profile", label: "Profile", icon: "person" },
  { id: "lists", label: "My Lists", icon: "list" },
  { id: "add", label: "Add", icon: "plus" },
  { id: "next", label: "Next", icon: "shuffle" },
  { id: "feed", label: "Feed", icon: "grid" },
];

function TabIcon({ icon, active }: { icon: string; active: boolean }) {
  const color = active ? "#E8E4DC" : "#5E586E";

  switch (icon) {
    case "grid":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "list":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" strokeLinecap="round" />
          <line x1="3" y1="12" x2="3.01" y2="12" strokeLinecap="round" />
          <line x1="3" y1="18" x2="3.01" y2="18" strokeLinecap="round" />
        </svg>
      );
    case "plus":
      return null;
    case "shuffle":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <polyline points="16 3 21 3 21 8" />
          <line x1="4" y1="20" x2="21" y2="3" />
          <polyline points="21 16 21 21 16 21" />
          <line x1="15" y1="15" x2="21" y2="21" />
          <line x1="4" y1="4" x2="9" y2="9" />
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
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg-surface border-t border-bg-elevated z-50">
      <div className="max-w-app mx-auto flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isAdd = tab.id === "add";

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
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-1 py-2 px-3 transition-colors"
            >
              <TabIcon icon={tab.icon} active={isActive} />
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
