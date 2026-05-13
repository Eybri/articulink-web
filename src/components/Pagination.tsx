"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
}

export default function Pagination({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  limitOptions = [12, 24, 48, 96]
}: PaginationProps) {
  const totalPages = Math.ceil(total / limit);

  if (total <= 0) return null;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-10 border-t border-[#DDD6C8]/60 mt-12 pb-10">
      <div className="flex flex-wrap items-center justify-center gap-4">
        {onLimitChange && (
          <>
            <span className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest">Show</span>
            <select
              value={limit}
              onChange={(e) => {
                onLimitChange(Number(e.target.value));
                onPageChange(0);
              }}
              className="bg-white border border-[#DDD6C8] rounded-lg px-2 py-1 text-[10px] font-bold text-[#1C2B3A] outline-none"
            >
              {limitOptions.map(n => (
                <option key={n} value={n}>{n} Items</option>
              ))}
            </select>
          </>
        )}
        <p className="text-[10px] font-medium text-[#4A5A6A] tracking-wider">
          Showing <span className="font-bold text-[#1A4480]">{page * limit + 1}</span> to <span className="font-bold text-[#1A4480]">{Math.min((page + 1) * limit, total)}</span> of <span className="font-bold text-[#1A4480]">{total}</span> results
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
          className="p-2 rounded-lg bg-white border border-[#DDD6C8] text-[#4A5A6A] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#1A4480]/30 transition-all shadow-sm"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center bg-white border border-[#DDD6C8] rounded-xl p-1 shadow-sm">
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            let pageNum = page;

            if (page < 2) pageNum = i;
            else if (page > totalPages - 3) pageNum = totalPages - 5 + i;
            else pageNum = page - 2 + i;

            if (pageNum < 0 || pageNum >= totalPages) return null;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[32px] h-8 rounded-lg text-[10px] font-bold transition-all ${page === pageNum ? "bg-[#1A4480] text-white shadow-md" : "text-[#4A5A6A] hover:bg-[#FAF8F4]"}`}
              >
                {pageNum + 1}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          className="p-2 rounded-lg bg-white border border-[#DDD6C8] text-[#4A5A6A] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#1A4480]/30 transition-all shadow-sm"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
