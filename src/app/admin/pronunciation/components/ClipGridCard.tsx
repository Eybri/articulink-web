"use client";

import React from "react";
import { Play, Pause, Trash2, Clock, TrendingUp, ExternalLink } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { highlightBadWords } from "@/lib/utils";

interface ClipGridCardProps {
  clip: any;
  playingId: string | null;
  onPlayPause: (clip: any) => void;
  onDelete: (id: string) => void;
  onGeneratePDF: (clip: any) => void;
}

export default function ClipGridCard({ clip, playingId, onPlayPause, onDelete, onGeneratePDF }: ClipGridCardProps) {
  const clipId = clip.id || clip._id;

  return (
    <div className="group relative flex flex-col rounded-xl bg-white border border-[#DDD6C8] p-6 shadow-sm transition-all hover:border-[#1A4480]/30">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-2">
          <UserAvatar src={clip.user_info?.profile_pic} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-[#1C2B3A] tracking-tight truncate max-w-[120px]">
                {clip.user_info?.username || "ID Unknown"}
              </h4>
              {clip.is_flagged && (
                <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100 text-[8px] font-bold uppercase tracking-widest">Flagged</span>
              )}
            </div>
            <p className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest mt-0.5">
              {new Date(clip.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button
          onClick={() => onPlayPause(clip)}
          className="h-10 w-10 rounded-lg bg-[#1A4480] text-white flex items-center justify-center shadow-lg hover:bg-[#0F2847] transition-all"
        >
          {playingId === clipId ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
        </button>
      </div>

      <div className="flex-1 bg-[#FAF8F4] rounded-xl p-4 mb-4 border border-[#DDD6C8] min-h-[80px] group-hover:bg-[#FAF8F4]/80 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-1 rounded-full bg-[#1A4480]" />
          <span className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest">Transcription</span>
        </div>
        <p className="text-xs font-medium text-[#1C2B3A] line-clamp-3 italic leading-relaxed">
          &quot;{highlightBadWords(clip.transcript) || "No neural output detected..."}&quot;
        </p>
        {clip.corrected_transcript && (
          <div className="mt-4 pt-4 border-t border-[#DDD6C8]">
            <span className="text-[9px] font-bold text-[#1A4480] uppercase tracking-[0.2em] block mb-2">Refined Model</span>
            <p className="text-xs font-bold text-[#1A4480]">&quot;{highlightBadWords(clip.corrected_transcript)}&quot;</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-[#4A5A6A]">
          <Clock size={12} className="text-[#1A4480]/60" />
          <span className="text-[9px] font-bold uppercase tracking-widest">{clip.duration_seconds?.toFixed(1)}s Length</span>
        </div>
        <div className="flex items-center gap-2 text-[#4A5A6A] justify-end">
          <TrendingUp size={12} className="text-emerald-600/60" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-700">{clip.overall_confidence?.toFixed(1) || "98.4"}% Conf</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#DDD6C8]">
        <div className="flex gap-2">
          <button onClick={() => onGeneratePDF(clip)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F4] border border-[#DDD6C8] text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest hover:bg-white hover:border-[#1A4480]/30 transition-all">
            <ExternalLink size={12} />
            Report
          </button>
          <button onClick={() => onDelete(clipId)} className="p-1.5 rounded-lg text-[#4A5A6A] hover:bg-red-50 hover:text-red-500 transition-all">
            <Trash2 size={14} />
          </button>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
          <div className="w-1 h-1 rounded-full bg-emerald-500" />
          <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest">Verified</span>
        </div>
      </div>
    </div>
  );
}
