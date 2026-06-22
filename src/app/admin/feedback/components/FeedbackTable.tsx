import React from "react";
import { MessageSquare, Eye, Trash2 } from "lucide-react";
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
    <div className="bg-white border border-[#DDD6C8] rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#DDD6C8] bg-[#FAF8F4]/50">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#4A5A6A]">
                User
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#4A5A6A]">
                Rating
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#4A5A6A]">
                Review
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#4A5A6A]">
                Category
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#4A5A6A]">
                Sentiment
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#4A5A6A]">
                Date
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#4A5A6A] text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDD6C8]/30">
            {loading ? (
              // Skeleton rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4" colSpan={7}>
                    <div className="h-5 bg-[#FAF8F4] rounded-lg animate-pulse" />
                  </td>
                </tr>
              ))
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-[#FAF8F4] flex items-center justify-center">
                      <MessageSquare size={24} className="text-[#DDD6C8]" />
                    </div>
                    <p className="text-sm font-semibold text-[#4A5A6A]">
                      No reviews found
                    </p>
                    <p className="text-xs text-[#4A5A6A]/60">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr
                  key={review.id}
                  className="group/row hover:bg-[#FAF8F4]/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        src={review.user.profile_pic}
                        fallback={review.user.name[0]}
                        size="sm"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-[#1C2B3A] truncate tracking-tight">
                          {review.user.name}
                        </span>
                        <span className="text-[10px] font-medium text-[#4A5A6A] truncate">
                          {review.user.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StarRating rating={review.rating} size={12} />
                  </td>
                  <td className="px-6 py-4 max-w-[300px]">
                    <p className="text-xs font-medium text-[#1C2B3A] line-clamp-2 leading-relaxed">
                      {review.comment}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {getCategoryBadge(review.category)}
                  </td>
                  <td className="px-6 py-4">
                    {getSentimentBadge(review.sentiment)}
                  </td>
                  <td className="px-6 py-4 text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest whitespace-nowrap">
                    {formatDate(review.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelectedReview(review)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#1A4480]/5 text-[#1A4480] border border-[#1A4480]/10 hover:bg-[#1A4480]/10 transition-all"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-8 border-t border-[#DDD6C8] flex items-center justify-between bg-[#FAF8F4]/30">
        <p className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest">
          Displaying {reviews.length} of {totalReviews} reviews
        </p>
        <div className="flex items-center gap-1">
          <button
            disabled={page === 0}
            onClick={() => setPage((p: number) => p - 1)}
            className="px-4 py-2 rounded-lg border border-[#DDD6C8] bg-white text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest hover:bg-[#FAF8F4] disabled:opacity-50 transition-all shadow-sm"
          >
            Prev
          </button>
          <button
            disabled={(page + 1) * rowsPerPage >= totalReviews}
            onClick={() => setPage((p: number) => p + 1)}
            className="px-4 py-2 rounded-lg border border-[#DDD6C8] bg-white text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest hover:bg-[#FAF8F4] disabled:opacity-50 transition-all shadow-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
