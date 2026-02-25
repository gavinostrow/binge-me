"use client";
import { useApp } from "@/lib/AppContext";
import MovieDetailScreen from "@/components/screens/MovieDetailScreen";
import ShowDetailScreen from "@/components/screens/ShowDetailScreen";
import ProfileDetailScreen from "@/components/screens/ProfileDetailScreen";
import ProfileEditScreen from "@/components/screens/ProfileEditScreen";
import AuthScreen from "@/components/screens/AuthScreen";
import SearchScreen from "@/components/screens/SearchScreen";
import SettingsScreen from "@/components/screens/SettingsScreen";
export default function ScreenRenderer() {
  const { navigationStack } = useApp();
  if (navigationStack.length === 0) return null;
  return (
    <>
      {" "}
      {navigationStack.map((descriptor, i) => {
        const isTop = i === navigationStack.length - 1;
        return (
          <div
            key={i}
            className="fixed inset-0 z-40 bg-bg-primary max-w-app mx-auto flex flex-col overflow-hidden"
            style={{
              transform: isTop ? "translateX(0)" : "translateX(-20px)",
              opacity: isTop ? 1 : 0.5,
              transition:
                "transform 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.28s",
              pointerEvents: isTop ? "auto" : "none",
            }}
          >
            {" "}
            {descriptor.screen === "movie-detail" && (
              <MovieDetailScreen movieId={descriptor.movieId} />
            )}{" "}
            {descriptor.screen === "show-detail" && (
              <ShowDetailScreen showId={descriptor.showId} />
            )}{" "}
            {descriptor.screen === "profile" && (
              <ProfileDetailScreen userId={descriptor.userId} />
            )}{" "}
            {descriptor.screen === "profile-edit" && <ProfileEditScreen />}{" "}
            {descriptor.screen === "auth" && <AuthScreen />}{" "}
            {descriptor.screen === "search" && (
              <SearchScreen initialQuery={descriptor.query} />
            )}{" "}
            {descriptor.screen === "settings" && <SettingsScreen />}{" "}
          </div>
        );
      })}{" "}
    </>
  );
}
