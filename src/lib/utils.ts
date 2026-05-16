import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Class Name Utility ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Image URL Resolver ---
export function getImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  
  // If it's already a full URL or absolute path, return it
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) {
    return url;
  }
  
  // Specific check for icons that are known to be in public/icons/
  const knownIcons = ['ampalaya.jpg', 'banana.jpg', 'pineapple.jpg', 'strawberry.jpg'];
  if (knownIcons.includes(url.toLowerCase())) {
    return `/icons/${url}`;
  }
  
  // Fallback: if it's just a filename, assume it's an icon
  return `/icons/${url}`;
}

// --- Countdown Formatter ---
export function formatCountdown(endDateStr: string, now: Date = new Date()): string | null {
  if (!endDateStr) return null;
  const end = new Date(endDateStr);
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return "Expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m ${seconds}s left`;
}

// --- Date Formatter ---
export function formatDate(date: any): string {
  if (!date) return "N/A";
  const d = new Date(date);
  return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
}

// --- Bad Words Filter ---
export const BAD_WORDS = new Set([
  "puta", "tangina", "gago", "kupal", "pota", "hayop", "bobo", "tarantado",
  "puchu", "leche", "ulol", "pakshet", "shit", "fuck", "bitch", "asshole",
  "damn", "hell", "bastard", "dick", "pussy"
]);

export function highlightBadWords(text: string): React.ReactNode {
  if (!text) return text;
  const words = text.split(/(\s+)/);
  return words.map((word, i) => {
    const cleaned = word.replace(/[^\w\s]/g, '').toLowerCase();
    if (BAD_WORDS.has(cleaned)) {
      return React.createElement('span', {
        key: i,
        className: "text-red-600 font-bold underline decoration-wavy decoration-red-400/50"
      }, word);
    }
    return word;
  });
}
