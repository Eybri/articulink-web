"use client";

import React from "react";
import { Play, Pause, Trash2, ExternalLink } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { highlightBadWords } from "@/lib/utils";

interface ClipListTableProps {
  clips: any[];
  playingId: string | null;
  onPlayPause: (clip: any) => void;
  onDelete: (id: string) => void;
  onGeneratePDF: (clip: any) => void;
}

export default function ClipListTable({ clips, playingId, onPlayPause, onDelete, onGeneratePDF }: ClipListTableProps) {
  return (
    <div className="bg-white border border-[#DDD6C8] rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FAF8F4] border-b border-[#DDD6C8]">
              <th className="px-6 py-4 text-[10px] font-bold text-[#4A5A6A] uppercase tracking-[0.2em]">User</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#4A5A6A] uppercase tracking-[0.2em]">Transcript</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#4A5A6A] uppercase tracking-[0.2em]">Length</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#4A5A6A] uppercase tracking-[0.2em]">Date</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#4A5A6A] uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDD6C8]">
            {clips.map((clip) => {
              const clipId = clip.id || clip._id;
              return (
                <tr key={clipId} className="hover:bg-[#FAF8F4]/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar src={clip.user_info?.profile_pic} size="xs" />
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1C2B3A]">{clip.user_info?.username || "ID Unknown"}</span>
                        {clip.is_flagged && (
                          <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100 text-[7px] font-bold uppercase tracking-widest">Flagged</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-md">
                    <p className="text-xs font-medium text-[#1C2B3A] line-clamp-1 italic">
                      &quot;{highlightBadWords(clip.transcript) || "No neural output detected..."}&quot;
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest bg-white px-2 py-1 rounded border border-[#DDD6C8]">
                      {clip.duration_seconds?.toFixed(1)}s
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest">
                      {new Date(clip.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onPlayPause(clip)}
                        className={`p-2 rounded-lg transition-all ${playingId === clipId ? "bg-[#1A4480] text-white" : "bg-[#FAF8F4] text-[#1A4480] border border-[#DDD6C8] hover:bg-white"}`}
                      >
                        {playingId === clipId ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
                      </button>
                      <button
                        onClick={() => onGeneratePDF(clip)}
                        className="p-2 rounded-lg bg-[#FAF8F4] border border-[#DDD6C8] text-[#4A5A6A] hover:bg-white transition-all"
                        title="Generate Report"
                      >
                        <ExternalLink size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(clipId)}
                        className="p-2 rounded-lg text-[#4A5A6A] hover:bg-red-50 hover:text-red-500 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
