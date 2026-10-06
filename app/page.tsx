"use client";

import { AppProvider } from "@/lib/AppContext";
import { SocialProvider } from "@/lib/SocialContext";
import BingeApp from "@/components/BingeApp";

export default function Home() {
  return (
    <AppProvider>
      <SocialProvider>
        <BingeApp />
      </SocialProvider>
    </AppProvider>
  );
}
