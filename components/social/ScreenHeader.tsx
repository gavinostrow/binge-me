"use client";
import { useApp } from "@/lib/AppContext";

/** Sticky back-button header used by pushed screens. */
export default function ScreenHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  const { popScreen } = useApp();
  return (
    <div className="sticky top-0 z-10 bg-bg-primary/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
      <button
        onClick={popScreen}
        aria-label="Back"
        className="w-8 h-8 -ml-2 flex items-center justify-center flex-shrink-0 text-text-primary"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="font-display font-bold text-xl text-text-primary leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-text-muted text-xs font-body truncate">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
