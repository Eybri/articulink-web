"use client";

import React from "react";
import { User } from "lucide-react";
import { getImageUrl, cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  fallback?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  xs: "h-8 w-8",
  sm: "h-9 w-9",
  md: "h-10 w-10",
  lg: "h-14 w-14",
};

const iconSizeMap = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 24,
};

const textSizeMap = {
  xs: "text-[9px]",
  sm: "text-[10px]",
  md: "text-[11px]",
  lg: "text-sm",
};

export default function UserAvatar({ src, fallback, size = "md", className }: UserAvatarProps) {
  const imageUrl = getImageUrl(src);

  return (
    <div
      className={cn(
        sizeMap[size],
        "rounded-xl bg-[#FAF8F4] border border-[#DDD6C8] flex items-center justify-center overflow-hidden shadow-inner",
        className
      )}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
      ) : fallback ? (
        <span className={cn(textSizeMap[size], "font-bold text-[#1A4480]")}>
          {fallback.toUpperCase()}
        </span>
      ) : (
        <User size={iconSizeMap[size]} className="text-[#4A5A6A]" />
      )}
    </div>
  );
}
