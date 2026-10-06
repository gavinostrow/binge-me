"use client";
import { useSocial } from "@/lib/SocialContext";

export default function Toast() {
  const { toast } = useSocial();
  if (!toast) return null;
  return (
    <div className="fixed bottom-24 left-0 right-0 z-[60] flex justify-center px-4 pointer-events-none">
      <div
        key={toast.id}
        role="status"
        className="animate-fadeIn bg-text-primary text-bg-primary text-sm font-body font-semibold rounded-full px-4 py-2.5 shadow-lg max-w-app"
      >
        {toast.text}
      </div>
    </div>
  );
}
