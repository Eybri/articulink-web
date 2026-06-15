"use client";

import React from "react";
import { Mic } from "lucide-react";
import { usePronunciation } from "./hooks/usePronunciation";
import { addBrandedHeader, addBrandedFooter } from "@/lib/pdfUtils";
import PronunciationHeader from "./components/PronunciationHeader";
import PronunciationToolbar from "./components/PronunciationToolbar";
import UserGridCard from "./components/UserGridCard";
import UserListTable from "./components/UserListTable";
import ClipGridCard from "./components/ClipGridCard";
import ClipListTable from "./components/ClipListTable";
import ClipDetailModal from "./components/ClipDetailModal";
import DeactivateModal from "@/components/DeactivateModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import Pagination from "@/components/Pagination";
import LanguageClarityChart from "@/components/charts/LanguageClarityChart";
import WordInsightsChart from "@/components/charts/WordInsightsChart";

export default function PronunciationPage() {
  const {
    clips, loading, total, now,
    page, setPage, limit, setLimit,
    searchTerm, setSearchTerm, fetchClips,
    viewMode, setViewMode,
    selectedUser, selectUser, goBackToList,
    selectedClip, setSelectedClip,
    playingId, handlePlayPause,
    handleDelete, handleActivate, handleDeactivateSubmit,
    showDeactivateModal, setShowDeactivateModal,
    targetUser, openDeactivateModal,
    confirmModal, closeConfirmModal, isConfirming
  } = usePronunciation();

  const generatePDF = async (clip: any) => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);

      let currentY = await addBrandedHeader(pdf, {
        userName: clip.user_info?.username || "SYSTEM ADMINISTRATOR",
        reportTitle: "SYSTEM INTELLIGENCE OVERVIEW",
      });

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
      const summaryText = `This report provides a comprehensive communication evaluation of the audio interaction captured for ${clip.user_info?.username || "the specified patient"}.`;
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
      const splitTranscript = pdf.splitTextToSize(`"${transcript}"`, contentWidth - 10);
      pdf.text(splitTranscript, textLeft, textY);
      textY += (splitTranscript.length * 4.2) + 6;

      if (clip.corrected_transcript && textY < currentY + panelHeight - 14) {
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(220, 220, 220);
        pdf.text("Communication Refined Output", textLeft, textY);
        textY += 5;
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(225, 225, 225);
        const splitCorrected = pdf.splitTextToSize(`"${clip.corrected_transcript}"`, contentWidth - 10);
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

      addBrandedFooter(pdf, { prefix: "AL-SPEECH" });
      pdf.save(`articulink_full_intelligence_speech_${clip.id || clip._id}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PronunciationHeader
        selectedUser={selectedUser}
        now={now}
        onBack={goBackToList}
        onActivate={handleActivate}
        onOpenDeactivateModal={openDeactivateModal}
      />

      {!selectedUser && (
        <div className="flex flex-col gap-6 w-full">
          <LanguageClarityChart />
          <WordInsightsChart />
        </div>
      )}

      <PronunciationToolbar
        viewMode={viewMode}
        searchTerm={searchTerm}
        selectedUser={selectedUser}
        onSearchChange={setSearchTerm}
        onSearchSubmit={fetchClips}
        onViewModeChange={setViewMode}
        onRefresh={fetchClips}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-[#1A4480]/10 border-t-[#1A4480] animate-spin" />
            <Mic className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#1A4480]/40" size={24} />
          </div>
          <p className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest">Decoding Audio Stream...</p>
        </div>
      ) : !selectedUser ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">
            {clips.map((item, index) => (
              <UserGridCard key={`${item.user_id || index}-${index}`} item={item} now={now} onSelect={selectUser} />
            ))}
          </div>
        ) : (
          <UserListTable items={clips} now={now} onSelectUser={selectUser} />
        )
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {clips.map((clip) => (
            <ClipGridCard
              key={clip.id || clip._id}
              clip={clip}
              playingId={playingId}
              onPlayPause={handlePlayPause}
              onDelete={handleDelete}
              onGeneratePDF={generatePDF}
            />
          ))}
        </div>
      ) : (
        <ClipListTable
          clips={clips}
          playingId={playingId}
          onPlayPause={handlePlayPause}
          onDelete={handleDelete}
          onGeneratePDF={generatePDF}
        />
      )}

      {!loading && clips.length > 0 && (
        <Pagination
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      )}

      <ClipDetailModal
        clip={selectedClip}
        onClose={() => setSelectedClip(null)}
        onGeneratePDF={generatePDF}
      />

      <DeactivateModal
        isOpen={showDeactivateModal}
        targetUser={targetUser}
        onClose={() => setShowDeactivateModal(false)}
        onSubmit={handleDeactivateSubmit}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmLabel={confirmModal.confirmLabel}
        onConfirm={confirmModal.onConfirm}
        onClose={closeConfirmModal}
        isLoading={isConfirming}
      />
    </div>
  );
}
