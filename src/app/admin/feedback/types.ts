export interface Review {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    profile_pic?: string;
  };
  rating: number;
  comment: string;
  category: string;
  sentiment: "positive" | "neutral" | "negative";
  created_at: string;
  status: "published" | "flagged" | "archived";
  attached_images?: string[];
}

export interface FeedbackStats {
  totalReviews: number;
  averageRating: number;
  positivePercent: number;
  thisMonth: number;
}
