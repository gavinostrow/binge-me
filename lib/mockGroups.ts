"use client";
import type { GroupClub, GroupMessage, Prediction, NowWatching } from "./types";
import { movies, shows } from "./mockData";

const now = new Date();
const minsAgo = (m: number) =>
  new Date(now.getTime() - m * 60000).toISOString();
const hoursAgo = (h: number) =>
  new Date(now.getTime() - h * 3600000).toISOString();
const daysAgo = (d: number) =>
  new Date(now.getTime() - d * 86400000).toISOString();

// ─── Prestige Picture Club ────────────────────────────────────────────────────
// Gavin + Emma + Marcus — currently watching Succession S4

const prestigeMessages: GroupMessage[] = [
  {
    id: "pm1",
    userId: "u3",
    text: "OK episode 3 of S4... I need to sit with this for a minute",
    timestamp: hoursAgo(1),
    reactions: { "😭": ["u1", "u2"], "🔥": ["u1"] },
  },
  {
    id: "pm2",
    userId: "u2",
    text: "The dinner scene?? I screamed out loud",
    timestamp: hoursAgo(0.9),
    reactions: { "😂": ["u3"], "💀": ["u1"] },
  },
  {
    id: "pm3",
    userId: "u1",
    text: "Roman's arc this season is genuinely one of the best things on TV",
    timestamp: hoursAgo(0.7),
    reactions: { "👏": ["u2", "u3"] },
    contentRef: { title: "Succession", type: "show" },
  },
  {
    id: "pm4",
    userId: "u2",
    text: "Still think Kendall wins in the end. Locking that prediction in 🔒",
    timestamp: hoursAgo(0.5),
    reactions: { "👀": ["u1", "u3"] },
  },
  {
    id: "pm5",
    userId: "u3",
    text: "Absolutely not. Logan was always the only one who could run it. Watch the finale change everything",
    timestamp: hoursAgo(0.3),
    reactions: { "🤔": ["u1"] },
  },
  {
    id: "pm6",
    userId: "u1",
    text: "Can we do ep 4 Thursday night? I'm free after 8",
    timestamp: minsAgo(20),
    reactions: { "👍": ["u2", "u3"] },
  },
];

const prestigePredictions: Prediction[] = [
  {
    id: "pp1",
    userId: "u2",
    contentTitle: "Succession S4",
    text: "Kendall ends up running Waystar by the finale",
    locked: true,
    lockedAt: daysAgo(5),
    revealed: false,
  },
  {
    id: "pp2",
    userId: "u3",
    contentTitle: "Succession S4",
    text: "None of the Roy kids get the company. It goes to someone outside the family",
    locked: true,
    lockedAt: daysAgo(4),
    revealed: false,
  },
  {
    id: "pp3",
    userId: "u1",
    contentTitle: "Succession S4",
    text: "Roman has a complete breakdown by episode 6 and exits",
    locked: true,
    lockedAt: daysAgo(3),
    revealed: false,
  },
  {
    id: "pp4",
    userId: "u2",
    contentTitle: "Succession S3",
    text: "Shiv will betray Kendall at the shareholder vote",
    locked: true,
    lockedAt: daysAgo(30),
    revealed: true,
    result: "She did exactly that 💀",
    votes: { u1: "right", u3: "right" },
  },
];

// ─── Horror Heads ────────────────────────────────────────────────────────────
// Gavin + Jake + Sofia — working through Ari Aster films

const horrorMessages: GroupMessage[] = [
  {
    id: "hm1",
    userId: "u5",
    text: "Just finished Hereditary. I have to be at work in 3 hours and I can't sleep",
    timestamp: hoursAgo(14),
    reactions: { "💀": ["u1", "u4"], "😂": ["u1"] },
    contentRef: { title: "Hereditary", type: "movie", rating: 9.0 },
  },
  {
    id: "hm2",
    userId: "u4",
    text: "I told you. The attic scene lives rent free in my head",
    timestamp: hoursAgo(13.5),
    reactions: { "😭": ["u5"], "💀": ["u1"] },
  },
  {
    id: "hm3",
    userId: "u1",
    text: "Midsommar next right? That one's more unsettling than scary imo",
    timestamp: hoursAgo(13),
    reactions: { "👀": ["u5", "u4"] },
  },
  {
    id: "hm4",
    userId: "u5",
    text: "No spoilers but the bear scene... my jaw hit the floor. Gavin's prediction incoming",
    timestamp: hoursAgo(12),
    reactions: { "🫣": ["u1", "u4"] },
    spoilerWarning: true,
  },
  {
    id: "hm5",
    userId: "u4",
    text: "Rate it Jake. Do it. I need to see the number",
    timestamp: hoursAgo(11),
    reactions: {},
  },
  {
    id: "hm6",
    userId: "u5",
    text: "9.0. Instant all-timer.",
    timestamp: hoursAgo(10.5),
    reactions: { "🔥": ["u1", "u4"] },
    contentRef: { title: "Hereditary", type: "movie", rating: 9.0 },
  },
];

const horrorPredictions: Prediction[] = [
  {
    id: "hp1",
    userId: "u1",
    contentTitle: "Midsommar",
    text: "Dani doesn't make it out — she becomes part of the ritual",
    locked: false,
    revealed: false,
  },
  {
    id: "hp2",
    userId: "u5",
    contentTitle: "Midsommar",
    text: "Christian survives but wishes he hadn't",
    locked: true,
    lockedAt: daysAgo(1),
    revealed: false,
  },
  {
    id: "hp3",
    userId: "u4",
    contentTitle: "Hereditary",
    text: "The grandma is the true villain — the whole family is already doomed",
    locked: true,
    lockedAt: daysAgo(8),
    revealed: true,
    result: "100% right. Paimon was the plan all along.",
    votes: { u1: "right", u5: "right" },
  },
];

// ─── Assembled Clubs ─────────────────────────────────────────────────────────

export const mockGroups: GroupClub[] = [
  {
    id: "g1",
    name: "Prestige Picture Club",
    emoji: "🎭",
    description: "Only the serious stuff. No Marvel.",
    memberIds: ["u1", "u2", "u3"],
    currentWatch: {
      title: "Succession",
      type: "show",
      show: shows[2],
      episode: "S4E3",
    },
    messages: prestigeMessages,
    predictions: prestigePredictions,
    createdAt: daysAgo(60),
    lastActivity: minsAgo(20),
  },
  {
    id: "g2",
    name: "Horror Heads",
    emoji: "🩸",
    description: "Ari Aster completionist run. No skipping.",
    memberIds: ["u1", "u5", "u4"],
    currentWatch: {
      title: "Midsommar",
      type: "movie",
      movie: movies[14],
    },
    messages: horrorMessages,
    predictions: horrorPredictions,
    createdAt: daysAgo(21),
    lastActivity: hoursAgo(10.5),
  },
];

// ─── Now Watching ─────────────────────────────────────────────────────────────

export const nowWatching: NowWatching[] = [
  {
    userId: "u2",
    title: "Succession",
    type: "show",
    episode: "S4E3",
    startedAt: hoursAgo(1.2),
  },
  {
    userId: "u3",
    title: "Andor",
    type: "show",
    episode: "S2E1",
    startedAt: hoursAgo(0.5),
  },
  {
    userId: "u5",
    title: "Hereditary",
    type: "movie",
    startedAt: hoursAgo(14.5),
  },
  {
    userId: "u4",
    title: "Slow Horses",
    type: "show",
    episode: "S3E2",
    startedAt: hoursAgo(3),
  },
];
