"use client";
import { useApp } from "@/lib/AppContext";
import type { TabId } from "@/lib/types";
const tabs: {
  id: TabId;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}[] = [
  {
    id: "feed",
    label: "Feed",
    icon: (active) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {" "}
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />{" "}
        <polyline points="9 22 9 12 15 12 15 22" />{" "}
      </svg>
    ),
  },
  {
    id: "next",
    label: "Next",
    icon: (active) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {" "}
        <polygon points="5 3 19 12 5 21 5 3" />{" "}
        <line x1="19" y1="3" x2="19" y2="21" />{" "}
      </svg>
    ),
  },
  {
    id: "add",
    label: "Add",
    icon: () => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {" "}
        <line x1="12" y1="5" x2="12" y2="19" />{" "}
        <line x1="5" y1="12" x2="19" y2="12" />{" "}
      </svg>
    ),
  },
  {
    id: "groups",
    label: "Clubs",
    icon: (active) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {" "}
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />{" "}
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profile",
    icon: (active) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {" "}
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />{" "}
        <circle cx="12" cy="7" r="4" />{" "}
      </svg>
    ),
  },
];
export default function BottomNav() {
  const { activeTab, setActiveTab } = useApp();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app border-t border-border z-50 bg-bg-primary">
      {" "}
      <div
        className="flex items-center justify-around px-1"
        style={{
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          paddingTop: "0.5rem",
        }}
      >
        {" "}
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isAdd = tab.id === "add";
          if (isAdd) {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center gap-0.5 -mt-4"
                aria-label="Add"
              >
                {" "}
                <div
                  className="rounded-full flex items-center justify-center active:scale-95 transition-transform"
                  style={{ width: 48, height: 48, backgroundColor: "#7C5CF6" }}
                >
                  {" "}
                  {tab.icon(isActive)}{" "}
                </div>{" "}
                <span className="text-[9px] font-body font-semibold text-text-muted tracking-wide">
                  Add
                </span>{" "}
              </button>
            );
          }
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-0.5 py-1 px-2 transition-colors"
              aria-label={tab.label}
            >
              {" "}
              <span style={{ color: isActive ? "#7C5CF6" : "#55556A" }}>
                {" "}
                {tab.icon(isActive)}{" "}
              </span>{" "}
              <span
                className="text-[9px] font-body font-semibold tracking-wide"
                style={{ color: isActive ? "#7C5CF6" : "#55556A" }}
              >
                {" "}
                {tab.label}{" "}
              </span>{" "}
            </button>
          );
        })}{" "}
      </div>{" "}
    </nav>
  );
}
