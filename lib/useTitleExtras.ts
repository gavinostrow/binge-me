"use client";
import { useEffect, useState } from "react";
import type { Movie, Show } from "./types";
import { sampleExtras, type TitleExtras } from "./showExtras";
import { fetchMovieExtras, fetchShowExtras } from "./tmdb";

type Extras = TitleExtras & { similar?: (Movie | Show)[] };

const cache = new Map<string, Extras>();

/** Next season + streaming providers + similar titles. Sample data first, live TMDB data when available. */
export function useTitleExtras(type: "movie" | "show", item: Movie | Show | undefined): Extras {
  const key = item ? `${type}:${item.id}` : "";
  const [extras, setExtras] = useState<Extras>(() =>
    item ? cache.get(key) ?? sampleExtras(type, item.id, type === "show" ? (item as Show) : undefined) : { providers: [], source: "sample" },
  );

  useEffect(() => {
    if (!item) return;
    const cached = cache.get(key);
    if (cached) {
      setExtras(cached);
      return;
    }
    setExtras(sampleExtras(type, item.id, type === "show" ? (item as Show) : undefined));
    if (!item.tmdbId) return;
    let cancelled = false;
    const load = type === "show" ? fetchShowExtras(item.tmdbId) : fetchMovieExtras(item.tmdbId);
    load.then((live) => {
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
export function knownExtras(type: "movie" | "show", item: Movie | Show): Extras {
  return cache.get(`${type}:${item.id}`) ?? sampleExtras(type, item.id, type === "show" ? (item as Show) : undefined);
}
