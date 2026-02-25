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
        "Give every movie and show a score from 1–10. Build your ranked list.",
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
              <div
                className={`bg-gradient-to-br ${card.gradient} rounded-full w-32 h-32 flex items-center justify-center mb-8`}
              >
                {" "}
                <span className="text-7xl">{card.emoji}</span>{" "}
              </div>{" "}
              <h2 className="font-display text-3xl font-bold text-text-primary text-center mb-4">
                {card.title}
              </h2>{" "}
              <p className="text-text-secondary text-center text-lg leading-relaxed">
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
              className={`w-2 h-2 rounded-full transition ${idx === currentCard ? "bg-accent w-8" : "bg-text-muted"}`}
            />
          ))}{" "}
        </div>{" "}
        {currentCard === cards.length - 1 ? (
          <button
            onClick={handleGetStarted}
            className="w-full py-3 bg-gradient-to-r from-accent to-accent-light text-white font-display font-bold rounded-2xl"
          >
            {" "}
            Get Started{" "}
          </button>
        ) : (
          <button
            onClick={() => setCurrentCard(currentCard + 1)}
            className="w-full py-3 bg-accent text-white font-display font-bold rounded-2xl"
          >
            {" "}
            Next{" "}
          </button>
        )}{" "}
      </div>{" "}
    </div>
  );
}
