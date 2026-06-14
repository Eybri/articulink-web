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
  onBack: () => void;
  onActivate: (userId: string) => void;
  onOpenDeactivateModal: (user: any) => void;
}

export default function PronunciationHeader({
  selectedUser,
  now,
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
      </div>
    </>
  );
}
