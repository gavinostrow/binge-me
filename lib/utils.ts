export function getRatingColor(rating: number): string {
  if (rating >= 9) return "#22C55E";
  if (rating >= 7.5) return "#84CC16";
  if (rating >= 6) return "#EAB308";
  if (rating >= 4) return "#F97316";
  return "#EF4444";
}
export function getRatingColorClass(rating: number): string {
  if (rating >= 9) return "text-green-500";
  if (rating >= 7.5) return "text-lime-500";
  if (rating >= 6) return "text-yellow-500";
  if (rating >= 4) return "text-orange-500";
  return "text-red-500";
}
export function getRatingLabel(rating: number): string {
  if (rating >= 9.5) return "Masterpiece";
  if (rating >= 9) return "All-Time Great";
  if (rating >= 8) return "Excellent";
  if (rating >= 7) return "Really Good";
  if (rating >= 6) return "Good";
  if (rating >= 5) return "Decent";
  if (rating >= 4) return "Mediocre";
  if (rating >= 3) return "Poor";
  return "Terrible";
}
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now =
    typeof window === "undefined"
      ? new Date("2026-02-22T12:00:00.000Z")
      : new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
export function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}
export function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
export function calcAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}
