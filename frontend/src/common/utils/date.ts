export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function isUpcoming(dateString: string): boolean {
  return new Date(dateString) > new Date();
}

export function daysUntil(dateString: string): string {
  const now = new Date();
  const target = new Date(dateString);
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) return `${Math.abs(diff)} days ago`;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `In ${diff} days`;
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const target = new Date(dateString);
  const seconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(dateString);
}

export function toISODate(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}
