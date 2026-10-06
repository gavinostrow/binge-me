"use client";
import { useState } from "react";

/** Blurs text until tapped. Used for reviews of seasons you haven't finished. */
export default function SpoilerText({ text, hidden, reason }: { text: string; hidden: boolean; reason: string }) {
  const [revealed, setRevealed] = useState(false);
  if (!hidden || revealed) {
    return <p className="text-text-secondary text-sm italic font-display leading-relaxed">&ldquo;{text}&rdquo;</p>;
  }
  return (
    <button onClick={() => setRevealed(true)} className="relative w-full text-left rounded-lg overflow-hidden" aria-label={`Spoiler hidden: ${reason}. Tap to reveal.`}>
      <p className="text-text-secondary text-sm italic font-display leading-relaxed blur-sm select-none" aria-hidden>
        &ldquo;{text}&rdquo;
      </p>
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="bg-bg-primary/85 border border-border rounded-md px-3 py-1 text-[11px] font-body font-semibold text-text-secondary">
          Spoiler shield · {reason} · tap to show
        </span>
      </span>
    </button>
  );
}
