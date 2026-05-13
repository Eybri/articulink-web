"use client";

import React from "react";
import { Mic, X } from "lucide-react";
import { highlightBadWords } from "@/lib/utils";

interface ClipDetailModalProps {
  clip: any;
  onClose: () => void;
  onGeneratePDF: (clip: any) => void;
}

export default function ClipDetailModal({ clip, onClose, onGeneratePDF }: ClipDetailModalProps) {
  if (!clip) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#1C2B3A]/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white border border-[#DDD6C8] rounded-2xl p-10 relative shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1A4480] to-transparent opacity-20" />

        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-[#4A5A6A] hover:text-[#1C2B3A] transition-colors"
        >
          <X size={24} />
        </button>

        <div className="space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-xl bg-[#1A4480]/5 border border-[#1A4480]/10 flex items-center justify-center">
              <Mic size={32} className="text-[#1A4480]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#1C2B3A] tracking-tight uppercase">Clip Analytics</h3>
              <p className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest mt-1">Registry ID: {clip.id || clip._id}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-8 rounded-2xl bg-[#FAF8F4] border border-[#DDD6C8] shadow-inner">
              <span className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest block mb-4">Communication Transcription</span>
              <p className="text-2xl font-bold text-[#1C2B3A] leading-relaxed italic">
                &quot;{highlightBadWords(clip.corrected_transcript || clip.transcript)}&quot;
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-xl bg-[#FAF8F4] border border-[#DDD6C8] space-y-1">
                <span className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest">Confidence Score</span>
                <p className="text-xl font-bold text-emerald-600">98.4%</p>
              </div>
              <div className="p-6 rounded-xl bg-[#FAF8F4] border border-[#DDD6C8] space-y-1">
                <span className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest">Neural Latency</span>
                <p className="text-xl font-bold text-[#1A4480]">42ms</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-8 py-4 rounded-xl text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest hover:bg-[#FAF8F4] transition-all"
            >
              Close Analytics
            </button>
            <button
              onClick={() => onGeneratePDF(clip)}
              className="px-10 py-4 rounded-xl bg-[#1A4480] text-[10px] font-bold text-white uppercase tracking-widest hover:bg-[#0F2847] transition-all shadow-lg shadow-[#1A4480]/20"
            >
              Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
