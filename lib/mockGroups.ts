import type { NowWatching } from "./types";

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();

// Friends' live "watching now" status for the Clubs tab.
export const nowWatching: NowWatching[] = [
  { userId: "u2", title: "Succession", type: "show", episode: "S4E3", startedAt: hoursAgo(1.2) },
  { userId: "u3", title: "Andor", type: "show", episode: "S2E1", startedAt: hoursAgo(0.5) },
  { userId: "u5", title: "Silo", type: "show", episode: "S2E4", startedAt: hoursAgo(14.5) },
  { userId: "u4", title: "Slow Horses", type: "show", episode: "S3E2", startedAt: hoursAgo(3) },
];
