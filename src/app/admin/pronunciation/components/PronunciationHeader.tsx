"use client";

import React from "react";
import {
  ArrowLeft,
  LayoutGrid,
  LayoutList,
  AudioLines,
  Search,
  AlertTriangle,
  Timer,
  Ban,
  Unlock,
} from "lucide-react";
import { cn, formatCountdown } from "@/lib/utils";

interface PronunciationHeaderProps {
  selectedUser: any;
  now: Date;
  viewMode: "grid" | "list";
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onViewModeChange: (mode: "grid" | "list") => void;
  onRefresh: () => void;
  onBack: () => void;
  onActivate: (userId: string) => void;
  onOpenDeactivateModal: (user: any) => void;
}

export default function PronunciationHeader({
  selectedUser,
  now,
  viewMode,
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  onViewModeChange,
  onRefresh,
  onBack,
  onActivate,
  onOpenDeactivateModal,
}: PronunciationHeaderProps) {
  return (
    <>
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          {selectedUser && (
            <button
              onClick={onBack}
              className="p-3 rounded-xl bg-white border border-[#DDD6C8] text-[#4A5A6A] hover:text-[#1A4480] transition-all shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h2 className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest mb-1">
              {selectedUser ? "Operator History" : "Speech Analytics"}
            </h2>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#1C2B3A] tracking-tight">
                {selectedUser ? selectedUser.user_info?.username : "Pronunciation Registry"}
              </h1>
              {selectedUser && selectedUser.flagged_count > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 animate-pulse">
                  <AlertTriangle size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{selectedUser.flagged_count} Content Violations</span>
                </div>
              )}
              {selectedUser && (selectedUser.user_info?.status === 'inactive' || selectedUser.user_info?.is_active === false) && selectedUser.user_info?.deactivation_type === 'temporary' && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-600">
                  <Timer size={12} className="animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {formatCountdown(selectedUser.user_info.deactivation_end_date, now)}
                  </span>
                </div>
              )}
              {selectedUser && (
                <div className="flex items-center gap-2 ml-4">
                  {selectedUser.user_info?.status === 'inactive' ? (
                    <button
                      onClick={() => onActivate(selectedUser.user_id || selectedUser._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-100 transition-all"
                    >
                      <Unlock size={14} />
                      Activate Account
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenDeactivateModal(selectedUser)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 border rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                        selectedUser.flagged_count > 0
                          ? "bg-red-600 text-white border-red-700 hover:bg-red-700"
                          : "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"
                      )}
                    >
                      <Ban size={14} />
                      Ban Account
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

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

      {/* Search */}
      <div className="relative group max-w-xl">
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
    </>
  );
}
