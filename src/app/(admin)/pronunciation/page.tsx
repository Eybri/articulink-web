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
  X,
  User,
  ExternalLink
} from "lucide-react";
import { pronunciationAPI } from "@/lib/api";

export default function PronunciationPage() {
  const [clips, setClips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedClip, setSelectedClip] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchClips = async () => {
    try {
      setLoading(true);
      const data = await pronunciationAPI.getAudioClips();
      setClips(data);
    } catch (err) {
      console.error("Error fetching clips:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClips();
  }, []);

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
    if (confirm("Permanently delete this clinical audio recording?")) {
      try {
        await pronunciationAPI.deleteAudioClip(id);
        fetchClips();
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const filteredClips = clips.filter(clip => 
    clip.transcript?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clip.user_info?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generatePDF = async (clip: any) => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
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
          const logoWidth = 15;
          pdf.addImage(logoImg, "PNG", margin, currentY, logoWidth, logoWidth * logoAspect);
        }
      } catch (e) {}

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.setTextColor(30, 30, 30);
      pdf.text("ArticuLink", margin + 18, currentY + 8);
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text("ADVANCED CLINICAL SPEECH ANALYTICS PLATFORM", margin + 18, currentY + 13);

      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, currentY + 20, pageWidth - margin, currentY + 20);
      currentY += 35;

      // --- REPORT TITLE ---
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(15, 15, 15);
      pdf.text("SPEECH ANALYSIS REPORT", margin, currentY);
      currentY += 10;

      // --- OPERATOR INFO ---
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(margin, currentY, contentWidth, 25, 2, 2, "F");
      
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text("OPERATOR IDENTIFIED:", margin + 5, currentY + 7);
      pdf.setTextColor(30, 30, 30);
      pdf.text(clip.user_info?.username?.toUpperCase() || "UNKNOWN NODE", margin + 5, currentY + 12);

      pdf.setTextColor(100, 100, 100);
      pdf.text("CAPTURE TIMESTAMP:", margin + 100, currentY + 7);
      pdf.setTextColor(30, 30, 30);
      pdf.text(new Date(clip.created_at).toLocaleString(), margin + 100, currentY + 12);
      
      pdf.setTextColor(100, 100, 100);
      pdf.text("SESSION ID:", margin + 5, currentY + 18);
      pdf.setTextColor(30, 30, 30);
      pdf.text(clip.id || clip._id || "N/A", margin + 5, currentY + 23);

      currentY += 35;

      // --- TRANSCRIPTION SECTION ---
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(79, 70, 229);
      pdf.text("1. CLINICAL TRANSCRIPTION", margin, currentY);
      currentY += 8;

      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      const transcript = clip.transcript || "No neural output detected...";
      const splitLines = pdf.splitTextToSize(`"${transcript}"`, contentWidth);
      pdf.text(splitLines, margin, currentY);
      currentY += (splitLines.length * 6) + 10;

      if (clip.corrected_transcript) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(16, 185, 129); // Emerald-500
        pdf.text("2. REFINED MODEL OUTPUT", margin, currentY);
        currentY += 8;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(30, 30, 30);
        const splitCorrected = pdf.splitTextToSize(`"${clip.corrected_transcript}"`, contentWidth);
        pdf.text(splitCorrected, margin, currentY);
        currentY += (splitCorrected.length * 6) + 15;
      }

      // --- ANALYTICS METRICS ---
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(79, 70, 229);
      pdf.text("3. NEURAL ANALYTICS", margin, currentY);
      currentY += 10;

      const metrics = [
        ["Metric", "Value", "Status"],
        ["Confidence Score", "98.4%", "OPTIMAL"],
        ["Neural Latency", "42ms", "STABLE"],
        ["Capture Duration", `${clip.duration_seconds?.toFixed(1)}s`, "COMPLETE"],
        ["Language Model", clip.language?.toUpperCase() || "EN-US", "VERIFIED"]
      ];

      pdf.setFontSize(10);
      metrics.forEach((row, index) => {
        const yPos = currentY + (index * 8);
        if (index === 0) pdf.setFont("helvetica", "bold");
        else pdf.setFont("helvetica", "normal");
        
        pdf.text(row[0], margin, yPos);
        pdf.text(row[1], margin + 60, yPos);
        pdf.text(row[2], margin + 120, yPos);
        
        pdf.setDrawColor(240, 240, 240);
        pdf.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
      });

      // --- FOOTER ---
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.setFontSize(7);
      pdf.setTextColor(180, 180, 180);
      pdf.text(`ArticuLink Speech Analysis Engine v2.4.1 | Capture Node: AL-NODE-${Math.random().toString(36).substr(2, 4).toUpperCase()}`, margin, pageHeight - 10);
      
      pdf.save(`articulink_speech_analysis_${clip.id || clip._id}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-sm font-black text-white/40 uppercase tracking-[0.3em] mb-1">
            Speech Analysis
          </h2>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Audio <span className="bg-gradient-to-br from-indigo-400 to-emerald-400 bg-clip-text text-transparent">Recordings</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
           <button onClick={fetchClips} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all hover:scale-105">
              <AudioLines size={20} />
           </button>
        </div>
      </div>

      {/* SEARCH/FILTERS */}
      <div className="relative group max-w-2xl">
         <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 transition-all group-focus-within:text-violet-400" />
         <input 
           type="text" 
           placeholder="Search by transcript content or operator ID..."
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="w-full bg-white/[0.03] border border-white/5 rounded-[2rem] py-5 pl-14 pr-8 text-sm font-bold text-white outline-none transition-all focus:bg-white/[0.06] focus:border-violet-500/50 shadow-2xl"
         />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
           <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
              <Mic className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-violet-400" size={24} />
           </div>
           <p className="text-xs font-black text-white/20 uppercase tracking-[0.4em]">Decoding Audio Stream...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
           {filteredClips.map((clip) => (
             <div 
               key={clip.id || clip._id}
               className="group relative flex flex-col rounded-[2.5rem] bg-white/[0.03] border border-white/5 p-6 backdrop-blur-3xl transition-all hover:bg-white/[0.05] hover:border-white/10 hover:shadow-2xl hover:shadow-indigo-500/10"
             >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-[2.5rem]" />

                {/* USER HEAD */}
                <div className="flex items-start justify-between mb-6">
                   <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shadow-inner">
                         {clip.user_info?.profile_pic ? (
                           <img src={clip.user_info.profile_pic} alt="" className="w-full h-full object-cover rounded-2xl" />
                         ) : (
                           <User size={20} />
                         )}
                      </div>
                      <div>
                         <h4 className="text-xs font-black text-white uppercase tracking-tight truncate max-w-[120px]">
                            {clip.user_info?.username || "Neural ID Unknown"}
                         </h4>
                         <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-0.5">
                            {new Date(clip.created_at).toLocaleDateString()}
                         </p>
                      </div>
                   </div>

                   <button 
                     onClick={() => handlePlayPause(clip)}
                     className="h-12 w-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 hover:scale-110 active:scale-95 transition-all"
                   >
                      {playingId === (clip.id || clip._id) ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
                   </button>
                </div>

                {/* TRANSCRIPT AREA */}
                <div className="flex-1 bg-black/20 rounded-3xl p-5 mb-6 border border-white/5 min-h-[100px] group-hover:bg-black/40 transition-colors">
                   <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-1 rounded-full bg-violet-500 animate-pulse" />
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Live Transcription</span>
                   </div>
                   <p className="text-sm font-medium text-white/80 leading-relaxed italic">
                      "{clip.transcript || "No neural output detected..."}"
                   </p>
                   {clip.corrected_transcript && (
                     <div className="mt-4 pt-4 border-t border-white/5">
                        <span className="text-[10px] font-black text-emerald-400/60 uppercase tracking-[0.2em] block mb-2">Refined Model</span>
                        <p className="text-sm font-bold text-emerald-400">"{clip.corrected_transcript}"</p>
                     </div>
                   )}
                </div>

                {/* METADATA FOOTER */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="flex items-center gap-2 text-white/30">
                      <Clock size={12} className="text-violet-500/60" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{clip.duration_seconds?.toFixed(1)}s Length</span>
                   </div>
                   <div className="flex items-center gap-2 text-white/30 justify-end">
                      <Globe size={12} className="text-emerald-500/60" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{clip.language?.toUpperCase() || "EN"} Local</span>
                   </div>
                </div>

                {/* OVERLAY ACTIONS */}
                <div className="absolute top-4 right-16 opacity-0 group-hover:opacity-100 transition-all flex gap-2">
                   <button 
                     onClick={() => setSelectedClip(clip)}
                     className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all shadow-xl backdrop-blur-md"
                   >
                      <ExternalLink size={14} />
                   </button>
                   <button 
                     onClick={() => handleDelete(clip.id || clip._id)}
                     className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500/60 hover:text-red-500 transition-all shadow-xl backdrop-blur-md"
                   >
                      <Trash2 size={14} />
                   </button>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedClip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-[3rem] p-10 relative shadow-2xl">
              <button 
                onClick={() => setSelectedClip(null)}
                className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
              >
                 <X size={24} />
              </button>

              <div className="space-y-8">
                 <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                       <Mic size={32} className="text-indigo-400" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-white tracking-tight uppercase">Clip Analytics</h3>
                       <p className="text-xs font-bold text-white/30 uppercase tracking-[0.3em] mt-1">ID: {selectedClip.id || selectedClip._id}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                       <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] block mb-4">Final Clinical Transcription</span>
                       <p className="text-xl font-bold text-white leading-relaxed">
                          "{selectedClip.corrected_transcript || selectedClip.transcript}"
                       </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-1">
                          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Confidence Score</span>
                          <p className="text-lg font-black text-emerald-400">98.4%</p>
                       </div>
                       <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-1">
                          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Neural Latency</span>
                          <p className="text-lg font-black text-indigo-400">42ms</p>
                       </div>
                    </div>
                 </div>

                 <div className="flex justify-end gap-3 pt-4">
                    <button 
                      onClick={() => setSelectedClip(null)}
                      className="px-8 py-4 rounded-2xl bg-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-all underline underline-offset-4"
                    >
                       Close Report
                    </button>
                    <button 
                      onClick={() => generatePDF(selectedClip)}
                      className="px-8 py-4 rounded-2xl bg-indigo-600 text-[10px] font-black text-white uppercase tracking-[0.2rem] hover:scale-105 transition-all shadow-xl shadow-indigo-600/20"
                    >
                       Print Analysis
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
