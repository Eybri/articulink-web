"use client";

import React from "react";
import {
  User,
  Clock,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Ban,
  Timer,
} from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { formatCountdown } from "@/lib/utils";

interface UserGridCardProps {
  item: any;
  now: Date;
  onSelect: (user: any) => void;
}

export default function UserGridCard({ item, now, onSelect }: UserGridCardProps) {
  const formatDate = (date: any) => {
    if (!date) return "Never Active";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "Recent Activity" : d.toLocaleDateString();
  };

  return (
    <div
      onClick={() => onSelect(item)}
      className="group cursor-pointer relative overflow-hidden flex flex-col rounded-2xl bg-white border border-[#DDD6C8] p-6 shadow-sm transition-all duration-300 hover:border-[#1A4480]/30 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <TrendingUp size={40} className="text-[#1A4480]" />
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <UserAvatar src={item.user_info?.profile_pic} size="lg" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-[#1C2B3A] tracking-tight truncate">{item.user_info?.username || "Operator"}</h3>
            <div className="flex items-center gap-1.5">
              {(item.user_info?.status === 'inactive' || item.user_info?.is_active === false) && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-100 text-amber-600">
                  <Ban size={10} />
                  <span className="text-[9px] font-bold uppercase">Banned</span>
                </div>
              )}
              {item.flagged_count > 0 && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 border border-red-100 text-red-600 animate-pulse">
                  <AlertTriangle size={10} />
                  <span className="text-[9px] font-bold uppercase">{item.flagged_count} Flagged</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <ShieldCheck size={10} className="text-[#1A4480]" />
            <p className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest truncate">{item.user_info?.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-[#FAF8F4] border border-[#DDD6C8]/60">
          <span className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest block mb-1">Total Clips</span>
          <p className="text-lg font-bold text-[#1C2B3A]">{item.total_clips}</p>
        </div>
        <div className="p-3 rounded-xl bg-[#FAF8F4] border border-[#DDD6C8]/60">
          <span className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest block mb-1">Avg Length</span>
          <p className="text-lg font-bold text-[#1A4480]">{item.avg_duration?.toFixed(1)}s</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest">Avg Confidence</span>
          <span className={`text-[10px] font-bold ${item.avg_confidence > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {(item.avg_confidence || 95.4).toFixed(1)}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-[#FAF8F4] border border-[#DDD6C8]/30 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${item.avg_confidence > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
            style={{ width: `${item.avg_confidence || 95.4}%` }}
          />
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-[#DDD6C8]/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-[#4A5A6A]/60" />
          <span className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest">
            Active {formatDate(item.last_clip_date)}
          </span>
        </div>
        <span className="text-[9px] font-bold text-[#1A4480] uppercase tracking-widest group-hover:underline">View More</span>
      </div>
    </div>
  );
}
