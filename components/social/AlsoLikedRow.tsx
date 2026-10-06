"use client";
import { useMemo } from "react";
import { useApp } from "@/lib/AppContext";
import { useSocial } from "@/lib/SocialContext";
import { alsoLiked } from "@/lib/social";
import { getShow } from "@/lib/catalog";
import { knownExtras } from "@/lib/useTitleExtras";
import type { Show } from "@/lib/types";
import PosterImage from "@/components/PosterImage";
import { ProviderLogos } from "./ProviderChips";

/**
 * "People who liked this also liked". Built from Binge users' ratings; while the app
 * is small, it tops up with TMDB's similar shows (or same-genre picks) so the row isn't empty.
 */
export default function AlsoLikedRow({ id, fallback }: { id: string; fallback: Show[] }) {
  const { pushScreen } = useApp();
  const { myRows } = useSocial();

  const items = useMemo(() => {
    const fromPeople = alsoLiked(id, myRows)
      .map((x) => ({ item: getShow(x.id), fans: x.fans }))
      .filter((x): x is { item: Show; fans: number } => Boolean(x.item));
    const seen = new Set(fromPeople.map((x) => x.item.id));
    const topUp = fallback.filter((f) => !seen.has(f.id) && f.id !== id).map((item) => ({ item, fans: 0 }));
    return [...fromPeople, ...topUp].slice(0, 10);
  }, [id, myRows, fallback]);

  if (items.length === 0) return null;

  return (
    <div>
      <p className="text-text-muted text-xs font-body uppercase tracking-wider mb-3 px-1">People who liked this also liked</p>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {items.map(({ item, fans }) => (
          <button
            key={item.id}
            onClick={() => pushScreen({ screen: "show-detail", showId: item.id })}
            className="flex-shrink-0 w-28 active:opacity-75 transition-opacity text-left"
          >
            <PosterImage title={item.title} year={item.year} posterPath={item.posterPath} size="md" className="w-28 h-40 rounded-xl object-cover" />
            <p className="text-text-primary text-xs font-display font-semibold mt-1.5 truncate leading-tight">{item.title}</p>
            <div className="flex items-center gap-1.5 mt-1 min-h-[16px]">
              <ProviderLogos providers={knownExtras(item).providers} max={1} />
              {fans > 0 && (
                <span className="text-[10px] font-body text-accent-light truncate">
                  {fans} {fans === 1 ? "fan" : "fans"} loved it
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
