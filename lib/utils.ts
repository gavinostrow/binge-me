export function getRatingColor(rating: number): string {
  if (rating >= 9) return "#22C55E";
  if (rating >= 8) return "#84CC16";
  if (rating >= 7) return "#EAB308";
  if (rating >= 6) return "#F97316";
  return "#EF4444";
}

export function getRatingColorClass(rating: number): string {
  if (rating >= 9) return "bg-rating-green";
  if (rating >= 8) return "bg-rating-yellow-green";
  if (rating >= 7) return "bg-rating-yellow";
  if (rating >= 6) return "bg-rating-orange";
  return "bg-rating-red";
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}
