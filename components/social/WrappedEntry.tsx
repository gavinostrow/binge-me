"use client";
import { useApp } from "@/lib/AppContext";
import { lastFinishedQuarter } from "@/lib/wrapped";

/** Profile entry point for yearly and quarterly Wrapped. */
export default function WrappedEntry() {
  const { pushScreen } = useApp();
  const now = new Date();
  const year = now.getFullYear();
  const quarter = lastFinishedQuarter(now);

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => pushScreen({ screen: "wrapped", period: `${year}` })}
        className="rounded-2xl p-4 text-left bg-bg-card border border-border transition-transform"
      >
        <p className="text-accent-light text-[10px] font-body uppercase tracking-widest">Wrapped</p>
        <p className="text-text-primary font-display font-bold text-xl leading-tight mt-1">{year}</p>
        <p className="text-text-secondary text-xs font-body mt-1">Your year so far</p>
      </button>
      {quarter && (
        <button
          onClick={() => pushScreen({ screen: "wrapped", period: quarter.key })}
          className="rounded-2xl p-4 text-left bg-bg-card border border-border transition-transform"
        >
          <p className="text-accent-gold text-[10px] font-body uppercase tracking-widest">Quarterly</p>
          <p className="text-text-primary font-display font-bold text-xl leading-tight mt-1">{quarter.label}</p>
          <p className="text-text-secondary text-xs font-body mt-1">Your recap is ready</p>
        </button>
      )}
    </div>
  );
}
