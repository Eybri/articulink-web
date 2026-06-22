import React from "react";
import { MessageSquare, Eye, Trash2, Image as ImageIcon } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import UserAvatar from "@/components/UserAvatar";
import { StarRating } from "./FeedbackStatCard";
import { Review } from "../types";

interface FeedbackTableProps {
  loading: boolean;
  reviews: Review[];
  totalReviews: number;
  page: number;
  setPage: (val: number | ((p: number) => number)) => void;
  rowsPerPage: number;
  setSelectedReview: (review: Review | null) => void;
  handleDelete: (id: string) => void;
}

export function FeedbackTable({
  loading,
  reviews,
  totalReviews,
  page,
  setPage,
  rowsPerPage,
  setSelectedReview,
  handleDelete,
}: FeedbackTableProps) {
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

  const getCategoryBadge = (category: string) => {
    return (
      <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-[#1A4480]/5 text-[#1A4480] border-[#1A4480]/10">
        {category}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#DDD6C8] rounded-2xl p-6 shadow-sm h-64 flex flex-col animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#FAF8F4]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 bg-[#FAF8F4] rounded" />
                  <div className="h-2 w-1/4 bg-[#FAF8F4] rounded" />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-full bg-[#FAF8F4] rounded" />
                <div className="h-3 w-full bg-[#FAF8F4] rounded" />
                <div className="h-3 w-2/3 bg-[#FAF8F4] rounded" />
              </div>
              <div className="mt-4 pt-4 border-t border-[#DDD6C8]/50 flex gap-2">
                <div className="h-5 w-16 bg-[#FAF8F4] rounded-full" />
                <div className="h-5 w-16 bg-[#FAF8F4] rounded-full" />
              </div>
            </div>
          ))
        ) : reviews.length === 0 ? (
          <div className="col-span-full py-20 bg-white border border-[#DDD6C8] rounded-2xl shadow-sm flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-[#FAF8F4] flex items-center justify-center">
              <MessageSquare size={32} className="text-[#DDD6C8]" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-[#1C2B3A]">No reviews found</h3>
              <p className="text-sm text-[#4A5A6A] mt-1">Try adjusting your filters or search query.</p>
            </div>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="group bg-white border border-[#DDD6C8] rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#1A4480]/30 transition-all flex flex-col"
            >
              {/* Header: User Info & Rating */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar
                    src={review.user.profile_pic}
                    fallback={review.user.name[0]}
                    size="sm"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-[#1C2B3A] truncate tracking-tight">
                      {review.user.name}
                    </span>
                    <span className="text-[10px] font-medium text-[#4A5A6A] truncate">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <StarRating rating={review.rating} size={14} />
                  <span className="text-[10px] font-bold text-[#1C2B3A]">{review.rating}.0</span>
                </div>
              </div>

              {/* Body: Comment */}
              <div className="flex-1 mb-4">
                <p className="text-sm font-medium text-[#1C2B3A] line-clamp-4 leading-relaxed whitespace-pre-wrap">
                  {review.comment}
                </p>
              </div>

              {/* Attachments Preview */}
              {review.attached_images && review.attached_images.length > 0 && (
                <div className="mb-4 flex items-center gap-2">
                  {review.attached_images.slice(0, 3).map((img, idx) => (
                    <div key={idx} className="relative h-12 w-12 rounded-lg overflow-hidden border border-[#DDD6C8]/50">
                      <img src={img} alt="Attachment" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {review.attached_images.length > 3 && (
                    <div className="h-12 w-12 rounded-lg bg-[#FAF8F4] border border-[#DDD6C8]/50 flex items-center justify-center">
                      <span className="text-xs font-bold text-[#4A5A6A]">+{review.attached_images.length - 3}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Footer: Tags & Actions */}
              <div className="pt-4 border-t border-[#DDD6C8]/50 flex items-center justify-between mt-auto">
                <div className="flex flex-wrap gap-2">
                  {getCategoryBadge(review.category)}
                  {getSentimentBadge(review.sentiment)}
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setSelectedReview(review)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#1A4480]/5 text-[#1A4480] hover:bg-[#1A4480]/10 transition-all"
                    title="View Details"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="bg-white p-6 border border-[#DDD6C8] rounded-xl flex items-center justify-between shadow-sm">
        <p className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest">
          Displaying {reviews.length} of {totalReviews} reviews
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p: number) => p - 1)}
            className="px-4 py-2 rounded-lg border border-[#DDD6C8] bg-white text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest hover:bg-[#FAF8F4] disabled:opacity-50 transition-all shadow-sm"
          >
            Prev
          </button>
          <button
            disabled={(page + 1) * rowsPerPage >= totalReviews}
            onClick={() => setPage((p: number) => p + 1)}
            className="px-4 py-2 rounded-lg border border-[#DDD6C8] bg-white text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest hover:bg-[#FAF8F4] disabled:opacity-50 transition-all shadow-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
