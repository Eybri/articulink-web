"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  RotateCw,
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Filter,
  ChevronDown,
  Trash2,
  Eye,
  X,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import PageHeader from "@/components/PageHeader";
import { feedbackAPI } from "@/lib/api";
import ConfirmationModal, { ConfirmationType } from "@/components/ConfirmationModal";
import { FeedbackStatCard } from "./components/FeedbackStatCard";
import { FeedbackFilters } from "./components/FeedbackFilters";
import { FeedbackTable } from "./components/FeedbackTable";
import { FeedbackDetailModal } from "./components/FeedbackDetailModal";
import { Review, FeedbackStats } from "./types";


export default function FeedbackPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);
  const rowsPerPage = 10;

  // Review detail modal
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: ConfirmationType;
    confirmLabel: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: 'info',
    confirmLabel: "Confirm"
  });

  const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

  const fetchData = async () => {
    setLoading(true);
    try {
      const filters: any = {
        skip: page * rowsPerPage,
        limit: rowsPerPage,
        search: search || undefined,
        rating: ratingFilter ? Number(ratingFilter) : undefined,
      };

      const [response, statsData] = await Promise.all([
        feedbackAPI.getFeedbacks(filters),
        feedbackAPI.getFeedbackStats()
      ]);

      const mappedReviews = response.feedbacks.map((f: any) => {
        let sentiment: "positive" | "neutral" | "negative" = "neutral";
        if (f.rating >= 4) sentiment = "positive";
        else if (f.rating <= 2) sentiment = "negative";

        return {
          id: f._id,
          user: {
            id: f.user?.id,
            name: f.user?.first_name ? `${f.user.first_name} ${f.user.last_name || ''}`.trim() : (f.user?.username || 'Unknown User'),
            email: f.user?.email || 'No email',
            profile_pic: f.user?.profile_pic,
          },
          rating: f.rating,
          comment: f.feedbackText || '(No comment provided)',
          category: Array.isArray(f.categories) && f.categories.length > 0 ? f.categories.join(', ') : 'General',
          sentiment,
          created_at: f.createdAt,
          status: "published" as const,
          attached_images: f.attachedImages || [],
        };
      });

      setTotalReviews(response.total || 0);
      setReviews(mappedReviews);
      
      // We don't filter by sentiment on the backend yet, so do it on frontend if needed
      // If we implement it on backend later, we can remove this
      if (sentimentFilter) {
          const filteredBySentiment = mappedReviews.filter((r: Review) => r.sentiment === sentimentFilter);
          setReviews(filteredBySentiment);
      }

      setStats(statsData);
    } catch (err) {
      console.error("Error fetching feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 300);
    return () => clearTimeout(timer);
  }, [search, ratingFilter, sentimentFilter, page]);

  const handleDelete = (reviewId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Feedback",
      message: "Are you sure you want to permanently delete this feedback? This action cannot be undone.",
      type: 'danger',
      confirmLabel: "Delete Feedback",
      onConfirm: async () => {
        try {
          setIsConfirming(true);
          await feedbackAPI.deleteFeedback(reviewId);
          await fetchData();
          closeConfirmModal();
        } catch (err) {
          console.error("Delete failed:", err);
        } finally {
          setIsConfirming(false);
        }
      }
    });
  };

  // Components have their own badge renderers now.


  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader label="User Insights" title="Feedback & Reviews" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FeedbackStatCard
          icon={<MessageSquare size={20} className="text-[#1A4480]" />}
          label="Total Reviews"
          value={stats?.totalReviews?.toString() || "0"}
          subtext="All time feedback"
          color="bg-[#1A4480]/10"
        />
        <FeedbackStatCard
          icon={<Star size={20} className="text-amber-500" />}
          label="Average Rating"
          value={stats?.averageRating?.toFixed(1) || "0.0"}
          subtext="Out of 5.0 stars"
          color="bg-amber-50"
        />
        <FeedbackStatCard
          icon={<ThumbsUp size={20} className="text-emerald-600" />}
          label="Positive Sentiment"
          value={`${stats?.positivePercent || 0}%`}
          subtext="Users satisfied"
          color="bg-emerald-50"
        />
        <FeedbackStatCard
          icon={<TrendingUp size={20} className="text-[#2A8FA0]" />}
          label="This Month"
          value={stats?.thisMonth?.toString() || "0"}
          subtext="New reviews"
          color="bg-[#2A8FA0]/10"
        />
      </div>

      {/* Filters */}
      <FeedbackFilters
        search={search}
        setSearch={setSearch}
        ratingFilter={ratingFilter}
        setRatingFilter={setRatingFilter}
        sentimentFilter={sentimentFilter}
        setSentimentFilter={setSentimentFilter}
        setPage={setPage}
        fetchData={fetchData}
        loading={loading}
      />

      {/* Reviews Table */}
      <FeedbackTable
        loading={loading}
        reviews={reviews}
        totalReviews={totalReviews}
        page={page}
        setPage={setPage}
        rowsPerPage={rowsPerPage}
        setSelectedReview={setSelectedReview}
        handleDelete={handleDelete}
      />

      {/* Review Detail Modal */}
      {selectedReview && (
        <FeedbackDetailModal
          selectedReview={selectedReview}
          setSelectedReview={setSelectedReview}
        />
      )}
    </div>
  );
}
