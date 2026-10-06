"use client";
import { useEffect, useState } from "react";
import type { Show } from "./types";
import { sampleExtras, type TitleExtras } from "./showExtras";
import { fetchShowExtras } from "./tmdb";

type Extras = TitleExtras & { similar?: Show[] };

const cache = new Map<string, Extras>();

/** Next season + streaming providers + similar shows. Sample data first, live TMDB data when available. */
export function useTitleExtras(show: Show | undefined): Extras {
  const key = show?.id ?? "";
  const [extras, setExtras] = useState<Extras>(() =>
    show ? cache.get(key) ?? sampleExtras(show.id, show) : { providers: [], source: "sample" },
  );

  useEffect(() => {
    if (!show) return;
    const cached = cache.get(key);
    if (cached) {
      setExtras(cached);
      return;
    }
    setExtras(sampleExtras(show.id, show));
    if (!show.tmdbId) return;
    let cancelled = false;
    fetchShowExtras(show.tmdbId).then((live) => {
      if (!live || cancelled) return;
      cache.set(key, live);
      setExtras(live);
    });
    return () => {
      cancelled = true;
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return extras;
}

/** Synchronous best-known extras (cache or sample) for lists where a hook per row is overkill. */
export function knownExtras(show: Show): Extras {
  return cache.get(show.id) ?? sampleExtras(show.id, show);
}
