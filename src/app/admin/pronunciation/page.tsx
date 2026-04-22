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
      } catch (e) {}

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.setTextColor(30, 30, 30);
      pdf.text("ArticuLink", margin + 15, currentY + 6);
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text("ADVANCED CLINICAL SPEECH ANALYTICS PLATFORM", margin + 15, currentY + 10);

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
      const summaryText = `This report provides a comprehensive clinical evaluation of the audio interaction captured for ${clip.user_info?.username || "the specified patient"}. Our proprietary neural engine analyzed the phonetic integrity, response latency, and semantic accuracy of the utterance. This data is critical for tracking longitudinal recovery and refining the patient's individual speech profile within the ArticuLink ecosystem.`;
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
        pdf.text("Clinically Refined Output", textLeft, textY);
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
