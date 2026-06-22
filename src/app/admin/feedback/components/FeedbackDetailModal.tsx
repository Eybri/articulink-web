import React from "react";
import { MessageSquare, X } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import UserAvatar from "@/components/UserAvatar";
import { StarRating } from "./FeedbackStatCard";
import { Review } from "../types";

interface FeedbackDetailModalProps {
  selectedReview: Review;
  setSelectedReview: (review: Review | null) => void;
}

export function FeedbackDetailModal({
  selectedReview,
  setSelectedReview,
}: FeedbackDetailModalProps) {
  const getSentimentBadge = (sentiment: string) => {
    const styles: Record<string, string> = {
      positive: "bg-emerald-50 text-emerald-600 border-emerald-100",
      neutral: "bg-amber-50 text-amber-600 border-amber-100",
      negative: "bg-red-50 text-red-600 border-red-100",
    };
    return (
      <span
        className={cn(
          "px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border",
          styles[sentiment] || "bg-zinc-50 text-zinc-600 border-zinc-100"
        )}
      >
        {sentiment}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      published: "bg-emerald-50 text-emerald-600 border-emerald-100",
      flagged: "bg-red-50 text-red-600 border-red-100",
      archived: "bg-zinc-50 text-zinc-500 border-zinc-100",
    };
    return (
      <span
        className={cn(
          "px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border",
          styles[status] || "bg-zinc-50 text-zinc-600 border-zinc-100"
        )}
      >
        {status}
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    return (
      <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-[#1A4480]/5 text-[#1A4480] border-[#1A4480]/10">
        {category}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setSelectedReview(null)}
      />
      <div className="relative bg-white rounded-2xl border border-[#DDD6C8] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#DDD6C8]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#1A4480]/10 flex items-center justify-center">
              <MessageSquare size={20} className="text-[#1A4480]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C2B3A]">
                Review Details
              </h3>
              <p className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest">
                {formatDate(selectedReview.created_at)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedReview(null)}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#FAF8F4] text-[#4A5A6A] hover:bg-[#DDD6C8] transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* User info */}
          <div className="flex items-center gap-3">
            <UserAvatar
              src={selectedReview.user.profile_pic}
              fallback={selectedReview.user.name[0]}
              size="sm"
            />
            <div>
              <p className="text-sm font-bold text-[#1C2B3A]">
                {selectedReview.user.name}
              </p>
              <p className="text-xs text-[#4A5A6A]">
                {selectedReview.user.email}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <StarRating rating={selectedReview.rating} size={18} />
            <span className="text-sm font-bold text-[#1C2B3A]">
              {selectedReview.rating}.0
            </span>
          </div>

          {/* Comment */}
          <div className="bg-[#FAF8F4] rounded-xl p-4 border border-[#DDD6C8]/50">
            <p className="text-sm text-[#1C2B3A] leading-relaxed font-medium whitespace-pre-wrap">
              &ldquo;{selectedReview.comment}&rdquo;
            </p>
          </div>

          {/* Attached Images */}
          {selectedReview.attached_images && selectedReview.attached_images.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#4A5A6A] uppercase tracking-widest">
                Attached Images
              </p>
              <div className="flex flex-wrap gap-3">
                {selectedReview.attached_images.map((img, idx) => (
                  <div key={idx} className="relative h-20 w-20 rounded-xl overflow-hidden border border-[#DDD6C8] shadow-sm group cursor-pointer hover:border-[#1A4480]/30 transition-colors">
                    <img src={img} alt={`Attachment ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            {getCategoryBadge(selectedReview.category)}
            {getSentimentBadge(selectedReview.sentiment)}
            {getStatusBadge(selectedReview.status)}
          </div>
        </div>
      </div>
    </div>
  );
}
