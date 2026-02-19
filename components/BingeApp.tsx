"use client";

import { useApp } from "@/lib/AppContext";
import BottomNav from "./BottomNav";
import FeedTab from "./tabs/FeedTab";
import MyListsTab from "./tabs/MyListsTab";
import AddTab from "./tabs/AddTab";
import WhatsNextTab from "./tabs/WhatsNextTab";
import ProfileTab from "./tabs/ProfileTab";

export default function BingeApp() {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-bg-primary max-w-app mx-auto relative">
      <main className="pb-20">
        <div className="animate-fadeIn" key={activeTab}>
          {activeTab === "feed" && <FeedTab />}
          {activeTab === "lists" && <MyListsTab />}
          {activeTab === "add" && <AddTab />}
          {activeTab === "next" && <WhatsNextTab />}
          {activeTab === "profile" && <ProfileTab />}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
