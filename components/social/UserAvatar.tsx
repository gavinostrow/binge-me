"use client";
import type { User } from "@/lib/types";

const COLORS = ["#7C5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444", "#14B8A6"];

export function userColor(userId: string) {
  const n = parseInt(userId.replace(/\D/g, ""), 10);
  if (!Number.isNaN(n)) return COLORS[n % COLORS.length];
  const hash = userId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
}

const SIZES = { xs: "w-5 h-5 text-[9px]", sm: "w-7 h-7 text-xs", md: "w-10 h-10 text-sm", lg: "w-16 h-16 text-xl" };

export default function UserAvatar({
  user,
  size = "sm",
  ring = false,
}: {
  user: Pick<User, "id" | "name" | "avatarUrl" | "avatarColor">;
  size?: keyof typeof SIZES;
  ring?: boolean;
}) {
  return (
    <div
      className={`${SIZES[size]} rounded-full flex items-center justify-center font-display font-bold text-white flex-shrink-0 overflow-hidden ${
        ring ? "ring-2 ring-bg-primary" : ""
      }`}
      style={{ backgroundColor: user.avatarColor ?? userColor(user.id) }}
      aria-hidden
    >
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        user.name.charAt(0).toUpperCase()
      )}
    </div>
  );
}
