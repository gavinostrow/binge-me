"use client";
import { useApp } from "@/lib/AppContext";
import ShowDetailScreen from "@/components/screens/ShowDetailScreen";
import ProfileDetailScreen from "@/components/screens/ProfileDetailScreen";
import ProfileEditScreen from "@/components/screens/ProfileEditScreen";
import AuthScreen from "@/components/screens/AuthScreen";
import SearchScreen from "@/components/screens/SearchScreen";
import SettingsScreen from "@/components/screens/SettingsScreen";
import NotificationsScreen from "@/components/screens/NotificationsScreen";
import FindFriendsScreen from "@/components/screens/FindFriendsScreen";
import RecRequestScreen from "@/components/screens/RecRequestScreen";
import MyRequestScreen from "@/components/screens/MyRequestScreen";
import PredictionsScreen from "@/components/screens/PredictionsScreen";
import WrappedScreen from "@/components/screens/WrappedScreen";
import ComingBackScreen from "@/components/screens/ComingBackScreen";
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
            {descriptor.screen === "settings" && <SettingsScreen />}
            {descriptor.screen === "notifications" && <NotificationsScreen />}
            {descriptor.screen === "find-friends" && <FindFriendsScreen />}
            {descriptor.screen === "rec-request" && <RecRequestScreen requestId={descriptor.requestId} />}
            {descriptor.screen === "my-request" && <MyRequestScreen />}
            {descriptor.screen === "predictions" && <PredictionsScreen showId={descriptor.showId} />}
            {descriptor.screen === "wrapped" && <WrappedScreen period={descriptor.period} />}
            {descriptor.screen === "coming-back" && <ComingBackScreen />}{" "}
          </div>
        );
      })}{" "}
    </>
  );
}
