"use client";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/AppContext";
import BottomNav from "./BottomNav";
import FeedTab from "./tabs/FeedTab";
import MyListsTab from "./tabs/MyListsTab";
import AddTab from "./tabs/AddTab";
import WhatsNextTab from "./tabs/WhatsNextTab";
import ProfileTab from "./tabs/ProfileTab";
import GroupsTab from "./tabs/GroupsTab";
import ScreenRenderer from "./ScreenRenderer";
import Onboarding from "./Onboarding";
export default function BingeApp() {
  const { activeTab } = useApp();
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !localStorage.getItem("binge_onboarded")
    ) {
      setShowOnboarding(true);
    }
  }, []);
  return (
    <div className="min-h-screen bg-bg-primary max-w-app mx-auto relative overflow-x-hidden">
      {" "}
      <main className="pb-20">
        {" "}
        <div className="animate-fadeIn" key={activeTab}>
          {" "}
          {activeTab === "feed" && <FeedTab />}{" "}
          {activeTab === "add" && <AddTab />}{" "}
          {activeTab === "lists" && <MyListsTab />}{" "}
          {activeTab === "groups" && <GroupsTab />}{" "}
          {activeTab === "next" && <WhatsNextTab />}{" "}
          {activeTab === "profile" && <ProfileTab />}{" "}
        </div>{" "}
      </main>{" "}
      <BottomNav /> <ScreenRenderer />{" "}
      {showOnboarding && (
        <Onboarding onDone={() => setShowOnboarding(false)} />
      )}{" "}
    </div>
  );
}
