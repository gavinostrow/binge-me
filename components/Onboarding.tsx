"use client";
import { useEffect, useState } from "react";
interface OnboardingProps {
  onDone: () => void;
}
export default function Onboarding({ onDone }: OnboardingProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const cards = [
    {
      emoji: "🎬",
      title: "Rate Everything",
      description:
        "Score every show and every season from 1–10. Build your ranked list.",
      gradient: "from-blue-600 to-blue-400",
    },
    {
      emoji: "👥",
      title: "Watch with Friends",
      description:
        "See what your friends are watching, react to their ratings, join clubs.",
      gradient: "from-purple-600 to-purple-400",
    },
    {
      emoji: "🎲",
      title: "Can't Decide?",
      description: "Tell us your mood and let binge pick what you watch next.",
      gradient: "from-pink-600 to-pink-400",
    },
  ];
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrentCard(Math.min(currentCard + 1, cards.length - 1));
      } else {
        setCurrentCard(Math.max(currentCard - 1, 0));
      }
    }
  };
  const handleGetStarted = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("binge_onboarded", "1");
    }
    onDone();
  };
  return (
    <div className="fixed inset-0 z-50 bg-bg-primary flex flex-col items-center justify-center">
      {" "}
      <div
        className="flex-1 w-full flex items-center justify-center overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {" "}
        <div className="w-full relative">
          {" "}
          {cards.map((card, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 flex flex-col items-center justify-center px-8 transition-all duration-500 ${idx === currentCard ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              {" "}
              <p className="font-mono text-xs text-text-muted tracking-widest mb-4">
                {String(idx + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}
              </p>
              <h2 className="font-display text-2xl font-semibold text-text-primary text-center mb-3">
                {card.title}
              </h2>{" "}
              <p className="text-text-secondary text-center text-base leading-relaxed max-w-xs">
                {card.description}
              </p>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </div>{" "}
      <div className="pb-12 space-y-4 w-full px-4">
        {" "}
        <div className="flex items-center justify-center gap-2">
          {" "}
          {cards.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentCard(idx)}
              className={`h-0.5 w-6 rounded-sm transition ${idx === currentCard ? "bg-text-primary" : "bg-border"}`}
            />
          ))}{" "}
        </div>{" "}
        {currentCard === cards.length - 1 ? (
          <button
            onClick={handleGetStarted}
            className="w-full py-3 bg-accent text-bg-primary font-body font-semibold rounded-lg"
          >
            {" "}
            Get Started{" "}
          </button>
        ) : (
          <button
            onClick={() => setCurrentCard(currentCard + 1)}
            className="w-full py-3 bg-accent text-bg-primary font-body font-semibold rounded-lg"
          >
            {" "}
            Next{" "}
          </button>
        )}{" "}
      </div>{" "}
    </div>
  );
}
