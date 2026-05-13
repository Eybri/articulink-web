"use client";

import React from "react";
import {
  ExternalLink,
  ShieldCheck,
  Ban,
  AlertTriangle,
  Timer,
} from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { formatCountdown } from "@/lib/utils";

interface UserListTableProps {
  items: any[];
  now: Date;
  onSelectUser: (user: any) => void;
}

export default function UserListTable({ items, now, onSelectUser }: UserListTableProps) {
  const formatDate = (date: any) => {
    if (!date) return "Never Active";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "Recent Activity" : d.toLocaleDateString();
  };

  return (
    <div className="bg-white border border-[#DDD6C8] rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FAF8F4] border-b border-[#DDD6C8]">
              <th className="px-6 py-4 text-[10px] font-bold text-[#4A5A6A] uppercase tracking-[0.2em]">Operator</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#4A5A6A] uppercase tracking-[0.2em]">Activity</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#4A5A6A] uppercase tracking-[0.2em]">Performance</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#4A5A6A] uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#4A5A6A] uppercase tracking-[0.2em] text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDD6C8]">
            {items.map((item, index) => (
              <tr key={`${item.user_id || index}`} className="hover:bg-[#FAF8F4]/40 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar src={item.user_info?.profile_pic} size="sm" />
                    <div>
                      <p className="text-xs font-bold text-[#1C2B3A]">{item.user_info?.username || "Operator"}</p>
                      <p className="text-[9px] font-medium text-[#4A5A6A] uppercase tracking-widest">{item.user_info?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[#1C2B3A]">{item.total_clips} Clips</p>
                    <p className="text-[9px] font-medium text-[#4A5A6A] uppercase">Last: {formatDate(item.last_clip_date)}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-1.5 bg-[#FAF8F4] rounded-full overflow-hidden border border-[#DDD6C8]/30">
                      <div className={`h-full ${item.avg_confidence > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${item.avg_confidence || 0}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-[#1C2B3A]">{item.avg_confidence?.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    {(item.user_info?.status === 'inactive' || item.user_info?.is_active === false) ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 w-fit">
                          <Ban size={10} />
                          <span className="text-[8px] font-bold uppercase">Banned</span>
                        </div>
                        {item.user_info?.deactivation_type === 'temporary' && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 w-fit">
                            <Timer size={10} className="animate-pulse" />
                            <span className="text-[8px] font-bold uppercase">{formatCountdown(item.user_info.deactivation_end_date, now)}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 w-fit">
                        <ShieldCheck size={10} />
                        <span className="text-[8px] font-bold uppercase">Active</span>
                      </div>
                    )}
                    {item.flagged_count > 0 && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100 w-fit animate-pulse">
                        <AlertTriangle size={10} />
                        <span className="text-[8px] font-bold uppercase">{item.flagged_count} Violations</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onSelectUser(item)}
                    className="p-2 rounded-lg bg-[#FAF8F4] border border-[#DDD6C8] text-[#1A4480] hover:bg-[#1A4480] hover:text-white transition-all shadow-sm"
                  >
                    <ExternalLink size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
