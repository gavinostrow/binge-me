"use client";

import { AppProvider } from "@/lib/AppContext";
import BingeApp from "@/components/BingeApp";

export default function Home() {
  return (
    <AppProvider>
      <BingeApp />
    </AppProvider>
  );
}
