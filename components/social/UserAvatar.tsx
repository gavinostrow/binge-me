"use client";
import type { User } from "@/lib/types";

const COLORS = ["#7F69E8", "#C25C92", "#B88A2E", "#3A9C70", "#4F84D1", "#CC6253", "#33999A"];

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
      className={`${SIZES[size]} rounded-full flex items-center justify-center font-display font-semibold flex-shrink-0 overflow-hidden ${
        ring ? "ring-2 ring-bg-primary" : ""
      }`}
      style={{ color: user.avatarColor ?? userColor(user.id), backgroundColor: `${user.avatarColor ?? userColor(user.id)}26` }}
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
