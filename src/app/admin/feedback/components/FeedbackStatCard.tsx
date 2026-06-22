import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeedbackStatCard({
  icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}) {
  return (
    <div className="bg-white border border-[#DDD6C8] rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            color
          )}
        >
          {icon}
        </div>
      </div>
      <p className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-[#1C2B3A] tracking-tight">
        {value}
      </p>
      {subtext && (
        <p className="text-[10px] font-medium text-[#4A5A6A] mt-1">
          {subtext}
        </p>
      )}
    </div>
  );
}

export function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={cn(
            "transition-colors",
            star <= rating
              ? "text-amber-400 fill-amber-400"
              : "text-[#DDD6C8] fill-transparent"
          )}
        />
      ))}
    </div>
  );
}
