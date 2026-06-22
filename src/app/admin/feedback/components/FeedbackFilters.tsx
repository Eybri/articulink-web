import React from "react";
import { Search, RotateCw, ChevronDown } from "lucide-react";

interface FeedbackFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  ratingFilter: string;
  setRatingFilter: (val: string) => void;
  sentimentFilter: string;
  setSentimentFilter: (val: string) => void;
  setPage: (val: number) => void;
  fetchData: () => void;
  loading: boolean;
}

export function FeedbackFilters({
  search,
  setSearch,
  ratingFilter,
  setRatingFilter,
  sentimentFilter,
  setSentimentFilter,
  setPage,
  fetchData,
  loading,
}: FeedbackFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative w-full md:w-96 group">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5A6A] group-focus-within:text-[#1A4480] transition-colors"
        />
        <input
          type="text"
          placeholder="Search reviews, users, categories..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="w-full h-11 pl-10 pr-4 bg-white border border-[#DDD6C8] rounded-xl text-sm font-medium text-[#1C2B3A] outline-none transition-all focus:border-[#1A4480]/30 focus:bg-white shadow-sm"
        />
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        {/* Rating filter */}
        <div className="relative flex-1 md:flex-none">
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(0);
            }}
            className="appearance-none w-full md:w-auto h-11 pl-4 pr-10 bg-white border border-[#DDD6C8] rounded-xl text-xs font-bold text-[#4A5A6A] uppercase tracking-widest outline-none transition-all hover:bg-[#FAF8F4] shadow-sm cursor-pointer"
          >
            <option value="">All Ratings</option>
            <option value="5">★★★★★ (5)</option>
            <option value="4">★★★★☆ (4)</option>
            <option value="3">★★★☆☆ (3)</option>
            <option value="2">★★☆☆☆ (2)</option>
            <option value="1">★☆☆☆☆ (1)</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5A6A] pointer-events-none"
          />
        </div>

        {/* Sentiment filter */}
        <div className="relative flex-1 md:flex-none">
          <select
            value={sentimentFilter}
            onChange={(e) => {
              setSentimentFilter(e.target.value);
              setPage(0);
            }}
            className="appearance-none w-full md:w-auto h-11 pl-4 pr-10 bg-white border border-[#DDD6C8] rounded-xl text-xs font-bold text-[#4A5A6A] uppercase tracking-widest outline-none transition-all hover:bg-[#FAF8F4] shadow-sm cursor-pointer"
          >
            <option value="">All Sentiment</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5A6A] pointer-events-none"
          />
        </div>

        <button
          onClick={fetchData}
          className="flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#DDD6C8] text-[#4A5A6A] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#FAF8F4] transition-all shadow-sm"
        >
          <RotateCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>
    </div>
  );
}
