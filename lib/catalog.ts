// Single place to look up any movie or show by id.
// Starts with the sample catalog; titles pulled from TMDB get registered here
// so every screen (detail pages, lists, recs) can find them by id.
import type { Movie, Show } from "./types";
import { movies, shows } from "./mockData";

const movieMap = new Map<string, Movie>(movies.map((m) => [m.id, m]));
const showMap = new Map<string, Show>(shows.map((s) => [s.id, s]));

export function getMovie(id: string): Movie | undefined {
  return movieMap.get(id);
}

export function getShow(id: string): Show | undefined {
  return showMap.get(id);
}

export function registerMovie(movie: Movie) {
  const existing = movieMap.get(movie.id);
  movieMap.set(movie.id, existing ? { ...existing, ...movie } : movie);
}

export function registerShow(show: Show) {
  const existing = showMap.get(show.id);
  showMap.set(show.id, existing ? { ...existing, ...show } : show);
}

export function allMovies(): Movie[] {
  return Array.from(movieMap.values());
}

export function allShows(): Show[] {
  return Array.from(showMap.values());
}

/** Finds a sample-catalog title by its TMDB id, so live data maps onto existing ids. */
export function findByTmdb(type: "movie" | "show", tmdbId: number): Movie | Show | undefined {
  const pool: (Movie | Show)[] = type === "movie" ? allMovies() : allShows();
  return pool.find((x) => x.tmdbId === tmdbId);
}

export type ItemKey = `${"movie" | "show"}:${string}`;
export const itemKey = (type: "movie" | "show", id: string): ItemKey => `${type}:${id}`;
