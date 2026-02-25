export type ScreenDescriptor =
  | { screen: "movie-detail"; movieId: string }
  | { screen: "show-detail"; showId: string }
  | { screen: "profile"; userId: string }
  | { screen: "profile-edit" }
  | { screen: "auth" }
  | { screen: "search"; query?: string }
  | { screen: "settings" };
