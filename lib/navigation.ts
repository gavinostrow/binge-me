export type ScreenDescriptor =
  | { screen: "movie-detail"; movieId: string }
  | { screen: "show-detail"; showId: string }
  | { screen: "profile"; userId: string }
  | { screen: "profile-edit" }
  | { screen: "auth" }
  | { screen: "search"; query?: string }
  | { screen: "settings" }
  | { screen: "notifications" }
  | { screen: "find-friends" }
  | { screen: "rec-request"; requestId: string }
  | { screen: "my-request" }
  | { screen: "predictions"; showId?: string }
  | { screen: "wrapped"; period?: string }
  | { screen: "coming-back" };
