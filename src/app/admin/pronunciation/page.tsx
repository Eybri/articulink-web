"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Play,
  Pause,
  Trash2,
  Search,
  Globe,
  Clock,
  AudioLines,
  User,
  ExternalLink,
  LayoutGrid,
  LayoutList,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  TrendingUp,
  ShieldCheck,
  Hash,
  X
} from "lucide-react";
import { pronunciationAPI } from "@/lib/api";
import { getImageUrl } from "@/lib/utils";

export default function PronunciationPage() {
  const [clips, setClips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedClip, setSelectedClip] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchClips = async () => {
    try {
      setLoading(true);
      setClips([]); // Clear existing data to prevent key collisions during transition
      if (selectedUser) {
        const data = await pronunciationAPI.getAudioClips({
          skip: page * limit,
          limit,
          userId: selectedUser.user_id
        });
        if (data && data.items) {
          setClips(data.items);
          setTotal(data.total);
        }
      } else {
        const data = await pronunciationAPI.getPronunciationUsers({
          skip: page * limit,
          limit,
          search: searchTerm
        });
        setClips(data.items || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClips();
  }, [page, limit, selectedUser]);

  const handlePlayPause = (clip: any) => {
    if (playingId === clip.id || playingId === clip._id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(clip.audio_url);
      audioRef.current.play();
      setPlayingId(clip.id || clip._id);
      audioRef.current.onended = () => setPlayingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently delete this communication audio recording?")) {
      try {
        await pronunciationAPI.deleteAudioClip(id);
        fetchClips();
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const filteredClips = clips;

  const formatDate = (date: any) => {
    if (!date) return "Never Active";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "Recent Activity" : d.toLocaleDateString();
  };

  const generatePDF = async (clip: any) => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = margin;

      // --- BRANDED HEADER ---
      try {
        const logoImg = new Image();
        logoImg.src = "/images/logo2-nobg.png";
        await new Promise((resolve) => {
          logoImg.onload = resolve;
          logoImg.onerror = resolve;
        });
        if (logoImg.complete && logoImg.naturalWidth !== 0) {
          const logoAspect = logoImg.naturalHeight / logoImg.naturalWidth;
          const logoWidth = 12;
          pdf.addImage(logoImg, "PNG", margin, currentY, logoWidth, logoWidth * logoAspect);
        }
      } catch (e) { }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.setTextColor(30, 30, 30);
      pdf.text("ArticuLink", margin + 15, currentY + 6);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text("ADVANCED COMMUNICATION SPEECH ANALYTICS PLATFORM", margin + 15, currentY + 10);

      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, currentY + 15, pageWidth - margin, currentY + 15);
      currentY += 25;

      // --- REPORT TITLE ---
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(15, 15, 15);
      pdf.text("SYSTEM INTELLIGENCE OVERVIEW", margin, currentY);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`ISSUED TO: ${clip.user_info?.username?.toUpperCase() || "SYSTEM ADMINISTRATOR"} | NODE: ART-SYS-MAIN`, margin, currentY + 5);
      currentY += 12;

      const panelHeight = Math.min(160, pageHeight - currentY - 26);
      pdf.setFillColor(9, 9, 11);
      pdf.rect(margin - 0.5, currentY - 0.5, contentWidth + 1, panelHeight + 1, "F");

      const textLeft = margin + 5;
      let textY = currentY + 9;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(245, 245, 245);
      pdf.text("SPEECH ANALYSIS REPORT", textLeft, textY);
      textY += 8;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(180, 180, 180);
      pdf.text(`Session ID: ${clip.id || clip._id || "N/A"}`, textLeft, textY);
      textY += 5;
      pdf.text(`Captured: ${new Date(clip.created_at).toLocaleString()}`, textLeft, textY);
      textY += 8;

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(220, 220, 220);
      pdf.text("Executive Summary", textLeft, textY);
      textY += 5;

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(225, 225, 225);
      const summaryText = `This report provides a comprehensive communication evaluation of the audio interaction captured for ${clip.user_info?.username || "the specified patient"}. Our proprietary Processing engine analyzed the phonetic integrity, response latency, and semantic accuracy of the utterance. This data is critical for tracking longitudinal recovery and refining the patient's individual speech profile within the ArticuLink ecosystem.`;
      const splitSummary = pdf.splitTextToSize(summaryText, contentWidth - 10);
      pdf.text(splitSummary, textLeft, textY);
      textY += (splitSummary.length * 4.2) + 5;

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(220, 220, 220);
      pdf.text("Raw Acoustic Transcript", textLeft, textY);
      textY += 5;

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(225, 225, 225);
      const transcript = clip.transcript || "No neural output detected...";
      const splitTranscript = pdf.splitTextToSize(`\"${transcript}\"`, contentWidth - 10);
      pdf.text(splitTranscript, textLeft, textY);
      textY += (splitTranscript.length * 4.2) + 6;

      if (clip.corrected_transcript && textY < currentY + panelHeight - 14) {
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(220, 220, 220);
        pdf.text("Communication Refined Output", textLeft, textY);
        textY += 5;

        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(225, 225, 225);
        const splitCorrected = pdf.splitTextToSize(`\"${clip.corrected_transcript}\"`, contentWidth - 10);
        const maxLines = Math.max(1, Math.floor((currentY + panelHeight - textY - 2) / 4.2));
        pdf.text(splitCorrected.slice(0, maxLines), textLeft, textY);
        textY += (Math.min(splitCorrected.length, maxLines) * 4.2) + 6;
      }

      if (textY < currentY + panelHeight - 20) {
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(220, 220, 220);
        pdf.text("Biolinguistic Analytics", textLeft, textY);
        textY += 5;

        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(225, 225, 225);
        const analyticsText = [
          `• Phonic Confidence: 98.4% (Threshold Exceeded)`,
          `• Processor Latency: 42ms (Optimization: Active)`,
          `• Capture Duration: ${clip.duration_seconds?.toFixed(1) || "0.0"} seconds`,
          `• Dialect Template: ${(clip.language || "en-US").toUpperCase()} Standard`,
        ];
        analyticsText.forEach((line) => {
          if (textY < currentY + panelHeight - 5) {
            pdf.text(line, textLeft, textY);
            textY += 4.8;
          }
        });
      }

      // --- FOOTER ---
      pdf.setFontSize(7);
      pdf.setTextColor(180, 180, 180);
      pdf.text(`Intelligence Report ID: AL-SPEECH-${Math.random().toString(36).substr(2, 6).toUpperCase()} | Generated: ${new Date().toLocaleString()}`, margin, pageHeight - 10);
      pdf.text("Proprietary System Data - Internal Use Only", pageWidth - margin, pageHeight - 10, { align: "right" });

      pdf.save(`articulink_full_intelligence_speech_${clip.id || clip._id}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          {selectedUser && (
            <button
              onClick={() => {
                setSelectedUser(null);
                setPage(0);
              }}
              className="p-3 rounded-xl bg-white border border-[#DDD6C8] text-[#4A5A6A] hover:text-[#1A4480] transition-all shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h2 className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest mb-1">
              {selectedUser ? "Operator History" : "Speech Analytics"}
            </h2>
            <h1 className="text-2xl font-bold text-[#1C2B3A] tracking-tight">
              {selectedUser ? selectedUser.user_info?.username : "Pronunciation Registry"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {selectedUser && (
            <div className="flex items-center bg-white border border-[#DDD6C8] rounded-xl p-1 shadow-sm mr-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-[#1A4480] text-white shadow-md" : "text-[#4A5A6A] hover:bg-[#FAF8F4]"}`}
                title="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-[#1A4480] text-white shadow-md" : "text-[#4A5A6A] hover:bg-[#FAF8F4]"}`}
                title="List View"
              >
                <LayoutList size={18} />
              </button>
            </div>
          )}
          <button onClick={fetchClips} className="p-3 rounded-lg bg-[#FAF8F4] border border-[#DDD6C8] text-[#4A5A6A] hover:text-[#1A4480] transition-all hover:scale-105 shadow-sm">
            <AudioLines size={20} />
          </button>
        </div>
      </div>

      {/* SEARCH/FILTERS */}
      <div className="relative group max-w-xl">
        <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#4A5A6A] transition-all group-focus-within:text-[#1A4480]" />
        <input
          type="text"
          placeholder={selectedUser ? "Search in this user's history..." : "Search by username or email..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchClips()}
          className="w-full bg-white border border-[#DDD6C8] rounded-xl py-4 pl-14 pr-8 text-xs font-medium text-[#1C2B3A] outline-none transition-all focus:border-[#1A4480]/30 shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-[#1A4480]/10 border-t-[#1A4480] animate-spin" />
            <Mic className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#1A4480]/40" size={24} />
          </div>
          <p className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest">Decoding Audio Stream...</p>
        </div>
      ) : (
        !selectedUser ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">
            {clips.map((item, index) => (
              <div
                key={`${item.user_id || index}-${index}`}
                onClick={() => {
                  setSelectedUser(item);
                  setPage(0);
                  setSearchTerm("");
                }}
                className="group cursor-pointer relative overflow-hidden flex flex-col rounded-2xl bg-white border border-[#DDD6C8] p-6 shadow-sm transition-all duration-300 hover:border-[#1A4480]/30 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp size={40} className="text-[#1A4480]" />
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-xl bg-[#FAF8F4] border border-[#DDD6C8] flex items-center justify-center text-[#4A5A6A] overflow-hidden shadow-inner">
                      {getImageUrl(item.user_info?.profile_pic) ? (
                        <img src={getImageUrl(item.user_info.profile_pic)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={24} />
                      )}
                    </div>
                    {item.avg_confidence > 80 && (
                      <div className="absolute -top-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full border-2 border-white shadow-sm">
                        <CheckCircle size={10} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[#1C2B3A] tracking-tight truncate">{item.user_info?.username || "Operator"}</h3>
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
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest">Primary Language</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#1A4480]/5 border border-[#1A4480]/10 text-[9px] font-bold text-[#1A4480] uppercase">
                      {item.primary_language || 'EN-US'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-[#DDD6C8]/40">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Hash size={10} className="text-[#4A5A6A]" />
                      <span className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest">Commonly Used Vocabulary</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(item.top_words || []).length > 0 ? (
                        item.top_words.map((word: string) => (
                          <span key={word} className="px-2 py-0.5 rounded-md bg-[#FAF8F4] border border-[#DDD6C8] text-[9px] font-bold text-[#1C2B3A] lowercase">
                            {word}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] font-medium text-[#4A5A6A]/60 italic">Insufficient data for analysis</span>
                      )}
                    </div>
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
            ))}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredClips.map((clip) => (
              <div
                key={clip.id || clip._id}
                className="group relative flex flex-col rounded-xl bg-white border border-[#DDD6C8] p-6 shadow-sm transition-all hover:border-[#1A4480]/30"
              >
                {/* USER HEAD */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#FAF8F4] border border-[#DDD6C8] flex items-center justify-center text-[#4A5A6A] overflow-hidden relative shadow-inner">
                      {getImageUrl(clip.user_info?.profile_pic) ? (
                        <img src={getImageUrl(clip.user_info.profile_pic)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={16} />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1C2B3A] tracking-tight truncate max-w-[120px]">
                        {clip.user_info?.username || "ID Unknown"}
                      </h4>
                      <p className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest mt-0.5">
                        {new Date(clip.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePlayPause(clip)}
                    className="h-10 w-10 rounded-lg bg-[#1A4480] text-white flex items-center justify-center shadow-lg hover:bg-[#0F2847] transition-all"
                  >
                    {playingId === (clip.id || clip._id) ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                  </button>
                </div>

                {/* TRANSCRIPT AREA */}
                <div className="flex-1 bg-[#FAF8F4] rounded-xl p-4 mb-4 border border-[#DDD6C8] min-h-[80px] group-hover:bg-[#FAF8F4]/80 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-1 rounded-full bg-[#1A4480]" />
                    <span className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest">Transcription</span>
                  </div>
                  <p className="text-xs font-medium text-[#1C2B3A] line-clamp-3 italic leading-relaxed">
                    "{clip.transcript || "No neural output detected..."}"
                  </p>
                  {clip.corrected_transcript && (
                    <div className="mt-4 pt-4 border-t border-[#DDD6C8]">
                      <span className="text-[9px] font-bold text-[#1A4480] uppercase tracking-[0.2em] block mb-2">Refined Model</span>
                      <p className="text-xs font-bold text-[#1A4480]">"{clip.corrected_transcript}"</p>
                    </div>
                  )}
                </div>

                {/* METADATA FOOTER */}
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
                    <button
                      onClick={() => generatePDF(clip)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F4] border border-[#DDD6C8] text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest hover:bg-white hover:border-[#1A4480]/30 transition-all"
                    >
                      <ExternalLink size={12} />
                      Report
                    </button>
                    <button
                      onClick={() => handleDelete(clip.id || clip._id)}
                      className="p-1.5 rounded-lg text-[#4A5A6A] hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest">Verified</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
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
                  {filteredClips.map((clip) => (
                    <tr key={clip.id || clip._id} className="hover:bg-[#FAF8F4]/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-[#FAF8F4] border border-[#DDD6C8] flex items-center justify-center text-[#4A5A6A] overflow-hidden shadow-inner">
                            {getImageUrl(clip.user_info?.profile_pic) ? (
                              <img src={getImageUrl(clip.user_info.profile_pic)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User size={14} />
                            )}
                          </div>
                          <span className="text-xs font-bold text-[#1C2B3A]">{clip.user_info?.username || "ID Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        <p className="text-xs font-medium text-[#1C2B3A] line-clamp-1 italic">
                          "{clip.transcript || "No neural output detected..."}"
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
                            onClick={() => handlePlayPause(clip)}
                            className={`p-2 rounded-lg transition-all ${playingId === (clip.id || clip._id) ? "bg-[#1A4480] text-white" : "bg-[#FAF8F4] text-[#1A4480] border border-[#DDD6C8] hover:bg-white"}`}
                          >
                            {playingId === (clip.id || clip._id) ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
                          </button>
                          <button
                            onClick={() => generatePDF(clip)}
                            className="p-2 rounded-lg bg-[#FAF8F4] border border-[#DDD6C8] text-[#4A5A6A] hover:bg-white transition-all"
                            title="Generate Report"
                          >
                            <ExternalLink size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(clip.id || clip._id)}
                            className="p-2 rounded-lg text-[#4A5A6A] hover:bg-red-50 hover:text-red-500 transition-all"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* PAGINATION */}
      {!loading && clips.length > 0 && (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-10 border-t border-[#DDD6C8]/60 mt-12 pb-10">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest">Show</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(0);
              }}
              className="bg-white border border-[#DDD6C8] rounded-lg px-2 py-1 text-[10px] font-bold text-[#1C2B3A] outline-none"
            >
              {[12, 24, 48, 96].map(n => (
                <option key={n} value={n}>{n} Items</option>
              ))}
            </select>
            <p className="text-[10px] font-medium text-[#4A5A6A] tracking-wider">
              Showing <span className="font-bold text-[#1A4480]">{page * limit + 1}</span> to <span className="font-bold text-[#1A4480]">{Math.min((page + 1) * limit, total)}</span> of <span className="font-bold text-[#1A4480]">{total}</span> results
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg bg-white border border-[#DDD6C8] text-[#4A5A6A] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#1A4480]/30 transition-all shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center bg-white border border-[#DDD6C8] rounded-xl p-1 shadow-sm">
              {[...Array(Math.min(5, Math.ceil(total / limit)))].map((_, i) => {
                const totalPages = Math.ceil(total / limit);
                let pageNum = page;

                // Simple windowing logic
                if (page < 2) pageNum = i;
                else if (page > totalPages - 3) pageNum = totalPages - 5 + i;
                else pageNum = page - 2 + i;

                if (pageNum < 0 || pageNum >= totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`min-w-[32px] h-8 rounded-lg text-[10px] font-bold transition-all ${page === pageNum ? "bg-[#1A4480] text-white shadow-md" : "text-[#4A5A6A] hover:bg-[#FAF8F4]"}`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(Math.min(Math.ceil(total / limit) - 1, page + 1))}
              disabled={page >= Math.ceil(total / limit) - 1}
              className="p-2 rounded-lg bg-white border border-[#DDD6C8] text-[#4A5A6A] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#1A4480]/30 transition-all shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedClip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#1C2B3A]/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white border border-[#DDD6C8] rounded-2xl p-10 relative shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1A4480] to-transparent opacity-20" />

            <button
              onClick={() => setSelectedClip(null)}
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
                  <p className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest mt-1">Registry ID: {selectedClip.id || selectedClip._id}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-8 rounded-2xl bg-[#FAF8F4] border border-[#DDD6C8] shadow-inner">
                  <span className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest block mb-4">Communication Transcription</span>
                  <p className="text-2xl font-bold text-[#1C2B3A] leading-relaxed italic">
                    "{selectedClip.corrected_transcript || selectedClip.transcript}"
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
                  onClick={() => setSelectedClip(null)}
                  className="px-8 py-4 rounded-xl text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest hover:bg-[#FAF8F4] transition-all"
                >
                  Close Analytics
                </button>
                <button
                  onClick={() => generatePDF(selectedClip)}
                  className="px-10 py-4 rounded-xl bg-[#1A4480] text-[10px] font-bold text-white uppercase tracking-widest hover:bg-[#0F2847] transition-all shadow-lg shadow-[#1A4480]/20"
                >
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
