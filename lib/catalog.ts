// Single place to look up any show by id.
// Starts with the sample catalog; shows pulled from TMDB get registered here
// so every screen (detail pages, lists, recs) can find them by id.
import type { Show } from "./types";
import { shows } from "./mockData";

const showMap = new Map<string, Show>(shows.map((s) => [s.id, s]));

export function getShow(id: string): Show | undefined {
  return showMap.get(id);
}

export function registerShow(show: Show) {
  const existing = showMap.get(show.id);
  showMap.set(show.id, existing ? { ...existing, ...show } : show);
}

export function allShows(): Show[] {
  return Array.from(showMap.values());
}

/** Finds a sample-catalog show by its TMDB id, so live data maps onto existing ids. */
export function findByTmdb(tmdbId: number): Show | undefined {
  return allShows().find((x) => x.tmdbId === tmdbId);
}
