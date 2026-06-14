"use client";

import React from "react";
import { LayoutGrid, LayoutList, AudioLines, Search } from "lucide-react";

interface PronunciationToolbarProps {
  viewMode: "grid" | "list";
  searchTerm: string;
  selectedUser: any;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onViewModeChange: (mode: "grid" | "list") => void;
  onRefresh: () => void;
}

export default function PronunciationToolbar({
  viewMode,
  searchTerm,
  selectedUser,
  onSearchChange,
  onSearchSubmit,
  onViewModeChange,
  onRefresh,
}: PronunciationToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Search */}
      <div className="relative group flex-1 max-w-xl">
        <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#4A5A6A] transition-all group-focus-within:text-[#1A4480]" />
        <input
          type="text"
          placeholder={selectedUser ? "Search in this user's history..." : "Search by username or email..."}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
          className="w-full bg-white border border-[#DDD6C8] rounded-xl py-4 pl-14 pr-8 text-xs font-medium text-[#1C2B3A] outline-none transition-all focus:border-[#1A4480]/30 shadow-sm"
        />
      </div>

      {/* Toggles */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-white border border-[#DDD6C8] rounded-xl p-1 shadow-sm mr-2">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-[#1A4480] text-white shadow-md" : "text-[#4A5A6A] hover:bg-[#FAF8F4]"}`}
            title="Grid View"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-[#1A4480] text-white shadow-md" : "text-[#4A5A6A] hover:bg-[#FAF8F4]"}`}
            title="List View"
          >
            <LayoutList size={18} />
          </button>
        </div>
        <button onClick={onRefresh} className="p-3 rounded-lg bg-[#FAF8F4] border border-[#DDD6C8] text-[#4A5A6A] hover:text-[#1A4480] transition-all hover:scale-105 shadow-sm">
          <AudioLines size={20} />
        </button>
      </div>
    </div>
  );
}
