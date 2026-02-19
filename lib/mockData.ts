import {
  User,
  Movie,
  Show,
  MovieRating,
  ShowRating,
  FeedActivity,
  WatchlistItem,
  CommunityItem,
} from "./types";

export const currentUser: User = {
  id: "u1",
  username: "alexchen",
  displayName: "Alex Chen",
  handle: "@alexchen",
  bio: "Film nerd. Sci-fi obsessed. Always watching something.",
  avatarColor: "#8B5CF6",
  mountRushmore: [
    { title: "Interstellar", type: "movie" },
    { title: "Breaking Bad", type: "show" },
    { title: "Parasite", type: "movie" },
    { title: "The Sopranos", type: "show" },
  ],
  createdAt: "2024-06-15T10:00:00Z",
};

export const friends: User[] = [
  {
    id: "u2",
    username: "sarahc",
    displayName: "Sarah C.",
    handle: "@sarahc",
    bio: "Horror queen. Drama lover.",
    avatarColor: "#EC4899",
    mountRushmore: [
      { title: "Hereditary", type: "movie" },
      { title: "Succession", type: "show" },
      { title: "Moonlight", type: "movie" },
      { title: "The Wire", type: "show" },
    ],
    createdAt: "2024-07-01T10:00:00Z",
  },
  {
    id: "u3",
    username: "mikej",
    displayName: "Mike J.",
    handle: "@mikej",
    bio: "Action junkie. Marvel fanboy.",
    avatarColor: "#F97316",
    mountRushmore: [
      { title: "The Dark Knight", type: "movie" },
      { title: "Better Call Saul", type: "show" },
      { title: "Mad Max: Fury Road", type: "movie" },
      { title: "Arcane", type: "show" },
    ],
    createdAt: "2024-07-10T10:00:00Z",
  },
  {
    id: "u4",
    username: "zoep",
    displayName: "Zoe P.",
    handle: "@zoep",
    bio: "Documentary addict. Indie cinema.",
    avatarColor: "#22C55E",
    mountRushmore: [
      { title: "Everything Everywhere All at Once", type: "movie" },
      { title: "Fleabag", type: "show" },
      { title: "Spirited Away", type: "movie" },
      { title: "The Bear", type: "show" },
    ],
    createdAt: "2024-08-01T10:00:00Z",
  },
  {
    id: "u5",
    username: "jordanl",
    displayName: "Jordan L.",
    handle: "@jordanl",
    bio: "Comedy nerd. Rewatcher.",
    avatarColor: "#06B6D4",
    mountRushmore: [
      { title: "Superbad", type: "movie" },
      { title: "The Office", type: "show" },
      { title: "The Grand Budapest Hotel", type: "movie" },
      { title: "Atlanta", type: "show" },
    ],
    createdAt: "2024-08-15T10:00:00Z",
  },
];

export const allUsers = [currentUser, ...friends];

export const movies: Movie[] = [
  { id: "m1", title: "Dune: Part Two", year: 2024, genre: "Sci-Fi" },
  { id: "m2", title: "Oppenheimer", year: 2023, genre: "Drama" },
  { id: "m3", title: "The Batman", year: 2022, genre: "Action" },
  { id: "m4", title: "Everything Everywhere All at Once", year: 2022, genre: "Sci-Fi" },
  { id: "m5", title: "Parasite", year: 2019, genre: "Thriller" },
  { id: "m6", title: "Interstellar", year: 2014, genre: "Sci-Fi" },
  { id: "m7", title: "Get Out", year: 2017, genre: "Horror" },
  { id: "m8", title: "La La Land", year: 2016, genre: "Romance" },
  { id: "m9", title: "The Social Network", year: 2010, genre: "Drama" },
  { id: "m10", title: "Mad Max: Fury Road", year: 2015, genre: "Action" },
  { id: "m11", title: "Hereditary", year: 2018, genre: "Horror" },
  { id: "m12", title: "Moonlight", year: 2016, genre: "Drama" },
  { id: "m13", title: "Spider-Man: Across the Spider-Verse", year: 2023, genre: "Action" },
  { id: "m14", title: "The Grand Budapest Hotel", year: 2014, genre: "Comedy" },
  { id: "m15", title: "Arrival", year: 2016, genre: "Sci-Fi" },
  { id: "m16", title: "Whiplash", year: 2014, genre: "Drama" },
  { id: "m17", title: "The Lighthouse", year: 2019, genre: "Horror" },
  { id: "m18", title: "Knives Out", year: 2019, genre: "Comedy" },
  { id: "m19", title: "1917", year: 2019, genre: "Action" },
  { id: "m20", title: "Portrait of a Lady on Fire", year: 2019, genre: "Romance" },
];

export const shows: Show[] = [
  { id: "s1", title: "Breaking Bad", year: 2008, genre: "Drama", totalSeasons: 5 },
  { id: "s2", title: "Succession", year: 2018, genre: "Drama", totalSeasons: 4 },
  { id: "s3", title: "The Bear", year: 2022, genre: "Drama", totalSeasons: 3 },
  { id: "s4", title: "Severance", year: 2022, genre: "Sci-Fi", totalSeasons: 2 },
  { id: "s5", title: "Shogun", year: 2024, genre: "Drama", totalSeasons: 1 },
  { id: "s6", title: "Better Call Saul", year: 2015, genre: "Drama", totalSeasons: 6 },
  { id: "s7", title: "Arcane", year: 2021, genre: "Action", totalSeasons: 2 },
  { id: "s8", title: "Fleabag", year: 2016, genre: "Comedy", totalSeasons: 2 },
  { id: "s9", title: "The Last of Us", year: 2023, genre: "Drama", totalSeasons: 2 },
  { id: "s10", title: "True Detective", year: 2014, genre: "Thriller", totalSeasons: 4 },
  { id: "s11", title: "The White Lotus", year: 2021, genre: "Drama", totalSeasons: 3 },
  { id: "s12", title: "Atlanta", year: 2016, genre: "Comedy", totalSeasons: 4 },
  { id: "s13", title: "Stranger Things", year: 2016, genre: "Sci-Fi", totalSeasons: 4 },
  { id: "s14", title: "Chernobyl", year: 2019, genre: "Drama", totalSeasons: 1 },
  { id: "s15", title: "The Sopranos", year: 1999, genre: "Drama", totalSeasons: 6 },
];

export const myMovieRatings: MovieRating[] = [
  { id: "mr1", userId: "u1", movie: movies[5], rating: 9.8, createdAt: "2025-01-10T14:00:00Z" },
  { id: "mr2", userId: "u1", movie: movies[4], rating: 9.5, createdAt: "2025-01-08T18:00:00Z" },
  { id: "mr3", userId: "u1", movie: movies[0], rating: 9.3, createdAt: "2025-02-15T20:00:00Z" },
  { id: "mr4", userId: "u1", movie: movies[3], rating: 9.1, createdAt: "2025-01-05T16:00:00Z" },
  { id: "mr5", userId: "u1", movie: movies[1], rating: 8.8, createdAt: "2025-01-20T19:00:00Z" },
  { id: "mr6", userId: "u1", movie: movies[14], rating: 8.7, createdAt: "2025-01-03T12:00:00Z" },
  { id: "mr7", userId: "u1", movie: movies[15], rating: 8.5, createdAt: "2024-12-28T21:00:00Z" },
  { id: "mr8", userId: "u1", movie: movies[8], rating: 8.3, createdAt: "2024-12-20T15:00:00Z" },
  { id: "mr9", userId: "u1", movie: movies[2], rating: 7.8, createdAt: "2025-02-01T22:00:00Z" },
  { id: "mr10", userId: "u1", movie: movies[9], rating: 7.5, createdAt: "2024-12-15T17:00:00Z" },
  { id: "mr11", userId: "u1", movie: movies[7], rating: 7.2, createdAt: "2024-12-10T20:00:00Z" },
  { id: "mr12", userId: "u1", movie: movies[6], rating: 6.8, createdAt: "2024-11-30T19:00:00Z" },
  { id: "mr13", userId: "u1", movie: movies[16], rating: 6.5, createdAt: "2024-11-25T18:00:00Z" },
];

export const myShowRatings: ShowRating[] = [
  {
    id: "sr1", userId: "u1", show: shows[0], overallRating: 9.7,
    seasonRatings: [
      { seasonNumber: 1, rating: 9.0 }, { seasonNumber: 2, rating: 9.2 },
      { seasonNumber: 3, rating: 9.5 }, { seasonNumber: 4, rating: 9.8 },
      { seasonNumber: 5, rating: 10.0 },
    ],
    createdAt: "2025-01-12T14:00:00Z",
  },
  {
    id: "sr2", userId: "u1", show: shows[1], overallRating: 9.4,
    seasonRatings: [
      { seasonNumber: 1, rating: 8.8 }, { seasonNumber: 2, rating: 9.2 },
      { seasonNumber: 3, rating: 9.8 }, { seasonNumber: 4, rating: 9.5 },
    ],
    createdAt: "2025-01-18T16:00:00Z",
  },
  {
    id: "sr3", userId: "u1", show: shows[3], overallRating: 9.2,
    seasonRatings: [
      { seasonNumber: 1, rating: 9.3 }, { seasonNumber: 2, rating: 9.0 },
    ],
    createdAt: "2025-02-10T18:00:00Z",
  },
  {
    id: "sr4", userId: "u1", show: shows[2], overallRating: 8.9,
    seasonRatings: [
      { seasonNumber: 1, rating: 9.2 }, { seasonNumber: 2, rating: 9.0 },
      { seasonNumber: 3, rating: 8.2 },
    ],
    createdAt: "2025-02-05T20:00:00Z",
  },
  {
    id: "sr5", userId: "u1", show: shows[4], overallRating: 8.8,
    seasonRatings: [{ seasonNumber: 1, rating: 8.8 }],
    createdAt: "2025-02-12T22:00:00Z",
  },
  {
    id: "sr6", userId: "u1", show: shows[5], overallRating: 8.6,
    seasonRatings: [
      { seasonNumber: 1, rating: 8.0 }, { seasonNumber: 2, rating: 8.5 },
      { seasonNumber: 3, rating: 8.8 }, { seasonNumber: 4, rating: 9.0 },
      { seasonNumber: 5, rating: 9.2 }, { seasonNumber: 6, rating: 8.5 },
    ],
    createdAt: "2025-01-25T14:00:00Z",
  },
  {
    id: "sr7", userId: "u1", show: shows[14], overallRating: 8.5,
    seasonRatings: [
      { seasonNumber: 1, rating: 9.0 }, { seasonNumber: 2, rating: 8.5 },
      { seasonNumber: 3, rating: 8.8 }, { seasonNumber: 4, rating: 7.5 },
      { seasonNumber: 5, rating: 8.2 }, { seasonNumber: 6, rating: 8.8 },
    ],
    createdAt: "2024-12-20T16:00:00Z",
  },
  {
    id: "sr8", userId: "u1", show: shows[8], overallRating: 8.0,
    seasonRatings: [
      { seasonNumber: 1, rating: 8.5 }, { seasonNumber: 2, rating: 7.5 },
    ],
    createdAt: "2025-02-01T12:00:00Z",
  },
  {
    id: "sr9", userId: "u1", show: shows[9], overallRating: 7.2,
    seasonRatings: [
      { seasonNumber: 1, rating: 9.0 }, { seasonNumber: 2, rating: 6.0 },
      { seasonNumber: 3, rating: 5.5 }, { seasonNumber: 4, rating: 7.8 },
    ],
    createdAt: "2024-12-15T19:00:00Z",
  },
];

const now = new Date();
function hoursAgo(h: number): string {
  return new Date(now.getTime() - h * 3600000).toISOString();
}

export const feedActivities: FeedActivity[] = [
  {
    id: "fa1", userId: "u2", user: friends[0],
    type: "movie_rating", title: "Dune: Part Two", year: 2024,
    rating: 9.5, taggedUsers: ["@mikej"],
    reactions: [
      { userId: "u1", type: "fire" }, { userId: "u3", type: "agree" },
      { userId: "u4", type: "mustwatch" },
    ],
    createdAt: hoursAgo(2),
  },
  {
    id: "fa2", userId: "u3", user: friends[1],
    type: "show_rating", title: "Severance", year: 2022, season: 2,
    rating: 9.2, taggedUsers: [],
    reactions: [
      { userId: "u1", type: "fire" }, { userId: "u2", type: "agree" },
    ],
    createdAt: hoursAgo(5),
  },
  {
    id: "fa3", userId: "u4", user: friends[2],
    type: "movie_rating", title: "Oppenheimer", year: 2023,
    rating: 8.4, taggedUsers: ["@sarahc", "@jordanl"],
    reactions: [
      { userId: "u5", type: "agree" }, { userId: "u2", type: "disagree" },
    ],
    createdAt: hoursAgo(8),
  },
  {
    id: "fa4", userId: "u5", user: friends[3],
    type: "movie_rating", title: "The Grand Budapest Hotel", year: 2014,
    rating: 9.0, taggedUsers: [],
    reactions: [
      { userId: "u1", type: "agree" }, { userId: "u4", type: "fire" },
      { userId: "u3", type: "agree" },
    ],
    createdAt: hoursAgo(12),
  },
  {
    id: "fa5", userId: "u2", user: friends[0],
    type: "show_rating", title: "The Bear", year: 2022, season: 3,
    rating: 7.8, taggedUsers: ["@alexchen"],
    reactions: [{ userId: "u3", type: "disagree" }],
    createdAt: hoursAgo(18),
  },
  {
    id: "fa6", userId: "u3", user: friends[1],
    type: "movie_rating", title: "Spider-Man: Across the Spider-Verse", year: 2023,
    rating: 9.4, taggedUsers: ["@jordanl"],
    reactions: [
      { userId: "u5", type: "fire" }, { userId: "u1", type: "fire" },
      { userId: "u4", type: "mustwatch" },
    ],
    createdAt: hoursAgo(24),
  },
  {
    id: "fa7", userId: "u4", user: friends[2],
    type: "show_rating", title: "Fleabag", year: 2016,
    rating: 9.6, taggedUsers: [],
    reactions: [
      { userId: "u2", type: "agree" }, { userId: "u5", type: "fire" },
      { userId: "u1", type: "agree" },
    ],
    createdAt: hoursAgo(36),
  },
  {
    id: "fa8", userId: "u5", user: friends[3],
    type: "movie_rating", title: "Knives Out", year: 2019,
    rating: 8.2, taggedUsers: ["@zoep"],
    reactions: [{ userId: "u4", type: "agree" }],
    createdAt: hoursAgo(48),
  },
];

export const communityMovies: CommunityItem[] = [
  { id: "cm1", title: "Interstellar", year: 2014, genre: "Sci-Fi", totalRatings: 1842, averageRating: 9.4, type: "movie" },
  { id: "cm2", title: "Parasite", year: 2019, genre: "Thriller", totalRatings: 1567, averageRating: 9.3, type: "movie" },
  { id: "cm3", title: "Everything Everywhere All at Once", year: 2022, genre: "Sci-Fi", totalRatings: 1234, averageRating: 9.1, type: "movie" },
  { id: "cm4", title: "Dune: Part Two", year: 2024, genre: "Sci-Fi", totalRatings: 987, averageRating: 9.0, type: "movie" },
  { id: "cm5", title: "Oppenheimer", year: 2023, genre: "Drama", totalRatings: 1456, averageRating: 8.9, type: "movie" },
  { id: "cm6", title: "Whiplash", year: 2014, genre: "Drama", totalRatings: 1123, averageRating: 8.8, type: "movie" },
  { id: "cm7", title: "The Grand Budapest Hotel", year: 2014, genre: "Comedy", totalRatings: 876, averageRating: 8.7, type: "movie" },
  { id: "cm8", title: "Mad Max: Fury Road", year: 2015, genre: "Action", totalRatings: 1345, averageRating: 8.6, type: "movie" },
  { id: "cm9", title: "Get Out", year: 2017, genre: "Horror", totalRatings: 1098, averageRating: 8.5, type: "movie" },
  { id: "cm10", title: "Arrival", year: 2016, genre: "Sci-Fi", totalRatings: 932, averageRating: 8.4, type: "movie" },
];

export const communityShows: CommunityItem[] = [
  { id: "cs1", title: "Breaking Bad", year: 2008, genre: "Drama", totalRatings: 2134, averageRating: 9.6, type: "show" },
  { id: "cs2", title: "The Sopranos", year: 1999, genre: "Drama", totalRatings: 1876, averageRating: 9.4, type: "show" },
  { id: "cs3", title: "Succession", year: 2018, genre: "Drama", totalRatings: 1654, averageRating: 9.3, type: "show" },
  { id: "cs4", title: "Severance", year: 2022, genre: "Sci-Fi", totalRatings: 1234, averageRating: 9.2, type: "show" },
  { id: "cs5", title: "The Bear", year: 2022, genre: "Drama", totalRatings: 1098, averageRating: 9.0, type: "show" },
  { id: "cs6", title: "Better Call Saul", year: 2015, genre: "Drama", totalRatings: 1567, averageRating: 8.9, type: "show" },
  { id: "cs7", title: "Chernobyl", year: 2019, genre: "Drama", totalRatings: 987, averageRating: 8.8, type: "show" },
  { id: "cs8", title: "Fleabag", year: 2016, genre: "Comedy", totalRatings: 876, averageRating: 8.7, type: "show" },
  { id: "cs9", title: "Arcane", year: 2021, genre: "Action", totalRatings: 1123, averageRating: 8.6, type: "show" },
  { id: "cs10", title: "The Last of Us", year: 2023, genre: "Drama", totalRatings: 1345, averageRating: 8.5, type: "show" },
];

export const communitySeasons: CommunityItem[] = [
  { id: "css1", title: "Breaking Bad", year: 2008, genre: "Drama", totalRatings: 1987, averageRating: 9.8, type: "show", season: 5 },
  { id: "css2", title: "Succession", year: 2018, genre: "Drama", totalRatings: 1432, averageRating: 9.6, type: "show", season: 3 },
  { id: "css3", title: "Chernobyl", year: 2019, genre: "Drama", totalRatings: 987, averageRating: 9.5, type: "show", season: 1 },
  { id: "css4", title: "Severance", year: 2022, genre: "Sci-Fi", totalRatings: 1123, averageRating: 9.4, type: "show", season: 1 },
  { id: "css5", title: "Fleabag", year: 2016, genre: "Comedy", totalRatings: 876, averageRating: 9.3, type: "show", season: 2 },
  { id: "css6", title: "The Bear", year: 2022, genre: "Drama", totalRatings: 1045, averageRating: 9.2, type: "show", season: 1 },
  { id: "css7", title: "True Detective", year: 2014, genre: "Thriller", totalRatings: 1567, averageRating: 9.1, type: "show", season: 1 },
  { id: "css8", title: "Better Call Saul", year: 2015, genre: "Drama", totalRatings: 1234, averageRating: 9.0, type: "show", season: 5 },
  { id: "css9", title: "The Sopranos", year: 1999, genre: "Drama", totalRatings: 1654, averageRating: 8.9, type: "show", season: 1 },
  { id: "css10", title: "Arcane", year: 2021, genre: "Action", totalRatings: 1098, averageRating: 8.8, type: "show", season: 1 },
];

export const searchableMovies: Movie[] = [
  ...movies,
  { id: "m21", title: "The Shawshank Redemption", year: 1994, genre: "Drama" },
  { id: "m22", title: "Pulp Fiction", year: 1994, genre: "Thriller" },
  { id: "m23", title: "Fight Club", year: 1999, genre: "Drama" },
  { id: "m24", title: "Inception", year: 2010, genre: "Sci-Fi" },
  { id: "m25", title: "The Matrix", year: 1999, genre: "Sci-Fi" },
  { id: "m26", title: "Goodfellas", year: 1990, genre: "Drama" },
  { id: "m27", title: "No Country for Old Men", year: 2007, genre: "Thriller" },
  { id: "m28", title: "There Will Be Blood", year: 2007, genre: "Drama" },
  { id: "m29", title: "The Departed", year: 2006, genre: "Thriller" },
  { id: "m30", title: "Eternal Sunshine of the Spotless Mind", year: 2004, genre: "Romance" },
];

export const searchableShows: Show[] = [
  ...shows,
  { id: "s16", title: "The Wire", year: 2002, genre: "Drama", totalSeasons: 5 },
  { id: "s17", title: "The Office", year: 2005, genre: "Comedy", totalSeasons: 9 },
  { id: "s18", title: "Game of Thrones", year: 2011, genre: "Drama", totalSeasons: 8 },
  { id: "s19", title: "Dark", year: 2017, genre: "Sci-Fi", totalSeasons: 3 },
  { id: "s20", title: "Fargo", year: 2014, genre: "Thriller", totalSeasons: 5 },
];

export const genres = [
  "All", "Sci-Fi", "Drama", "Horror", "Comedy", "Thriller", "Action", "Romance", "Documentary",
];

export const tasteMatchPercentages: Record<string, number> = {
  u2: 87,
  u3: 72,
  u4: 91,
  u5: 65,
};
