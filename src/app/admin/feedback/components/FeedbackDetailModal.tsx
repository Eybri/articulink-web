import React, { useState } from "react";
import { MessageSquare, X, Send, CheckCircle2, Edit3, Loader2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import UserAvatar from "@/components/UserAvatar";
import { StarRating } from "./FeedbackStatCard";
import { Review } from "../types";

interface FeedbackDetailModalProps {
  selectedReview: Review;
  setSelectedReview: (review: Review | null) => void;
  onReply?: (reviewId: string, reply: string) => Promise<void>;
}

export function FeedbackDetailModal({
  selectedReview,
  setSelectedReview,
  onReply,
}: FeedbackDetailModalProps) {
  const [replyText, setReplyText] = useState(selectedReview.admin_reply || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [replySuccess, setReplySuccess] = useState(false);

  const hasExistingReply = !!selectedReview.admin_reply;

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !onReply) return;
    setReplyError("");
    setReplySuccess(false);
    setIsSubmitting(true);
    try {
      await onReply(selectedReview.id, replyText.trim());
      setReplySuccess(true);
      setIsEditing(false);
      setTimeout(() => setReplySuccess(false), 3000);
    } catch (err: any) {
      setReplyError(err?.message || "Failed to send reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSentimentBadge = (sentiment: string, isAi: boolean = false) => {
    const styles: Record<string, string> = {
      positive: "bg-emerald-50 text-emerald-600 border-emerald-100",
      neutral: "bg-amber-50 text-amber-600 border-amber-100",
      negative: "bg-red-50 text-red-600 border-red-100",
    };
    return (
      <span
        className={cn(
          "px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border flex items-center gap-1",
          styles[sentiment] || "bg-zinc-50 text-zinc-600 border-zinc-100"
        )}
      >
        {sentiment}
        {isAi && <span className="opacity-70 text-[8px] ml-0.5" title="Analyzed by AI">✦</span>}
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
      <div className="relative bg-white rounded-2xl border border-[#DDD6C8] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#DDD6C8] flex-shrink-0">
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

        {/* Modal Body - Scrollable */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
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
            {getSentimentBadge(selectedReview.sentiment || 'neutral', !!selectedReview.sentimentScore)}
            {getStatusBadge(selectedReview.status)}
          </div>

          {/* ─── Admin Reply Section ─── */}
          <div className="border-t border-[#DDD6C8] pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-[#4A5A6A] uppercase tracking-widest">
                Admin Reply
              </p>
              {hasExistingReply && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-[#1A4480] bg-[#1A4480]/5 hover:bg-[#1A4480]/10 border border-[#1A4480]/10 transition-all"
                >
                  <Edit3 size={12} />
                  Edit
                </button>
              )}
            </div>

            {/* Success message */}
            {replySuccess && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100 animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-emerald-700">Reply sent successfully!</span>
              </div>
            )}

            {/* Existing reply display */}
            {hasExistingReply && !isEditing ? (
              <div className="bg-[#1A4480]/[0.03] rounded-xl p-4 border border-[#1A4480]/10 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-[#1A4480] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">A</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#1A4480] uppercase tracking-widest">
                    Admin Response
                  </span>
                  {selectedReview.admin_replied_at && (
                    <span className="text-[10px] text-[#4A5A6A] ml-auto">
                      {formatDate(selectedReview.admin_replied_at)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#1C2B3A] leading-relaxed font-medium whitespace-pre-wrap pl-8">
                  {selectedReview.admin_reply}
                </p>
              </div>
            ) : (
              /* Reply textarea + button */
              <div className="space-y-3">
                <div className="relative">
                  <textarea
                    value={replyText}
                    onChange={(e) => {
                      setReplyText(e.target.value);
                      setReplyError("");
                    }}
                    placeholder="Write your reply to this feedback..."
                    rows={3}
                    maxLength={1000}
                    className="w-full px-4 py-3 rounded-xl border border-[#DDD6C8] bg-[#FAF8F4] text-sm text-[#1C2B3A] placeholder-[#4A5A6A]/50 font-medium resize-none focus:outline-none focus:ring-2 focus:ring-[#1A4480]/20 focus:border-[#1A4480]/30 transition-all"
                  />
                  <span className="absolute bottom-2 right-3 text-[10px] text-[#4A5A6A]/60 font-medium">
                    {replyText.length}/1000
                  </span>
                </div>

                {/* Error message */}
                {replyError && (
                  <p className="text-xs font-medium text-red-500 animate-in fade-in duration-200">
                    {replyError}
                  </p>
                )}

                <div className="flex items-center gap-2 justify-end">
                  {isEditing && (
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setReplyText(selectedReview.admin_reply || "");
                        setReplyError("");
                      }}
                      className="px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-[#4A5A6A] bg-[#FAF8F4] hover:bg-[#DDD6C8] border border-[#DDD6C8] transition-all"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleSubmitReply}
                    disabled={!replyText.trim() || isSubmitting}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm",
                      replyText.trim() && !isSubmitting
                        ? "bg-[#1A4480] text-white hover:bg-[#153A6E] active:scale-[0.98]"
                        : "bg-[#DDD6C8] text-[#4A5A6A]/50 cursor-not-allowed"
                    )}
                  >
                    {isSubmitting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    {isSubmitting ? "Sending..." : hasExistingReply ? "Update Reply" : "Send Reply"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
