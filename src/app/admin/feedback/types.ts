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
  sentimentScore?: number;
  created_at: string;
  status: "published" | "flagged" | "archived";
  attached_images?: string[];
  admin_reply?: string;
  admin_replied_at?: string;
}

export interface FeedbackStats {
  totalReviews: number;
  averageRating: number;
  positivePercent: number;
  thisMonth: number;
  breakdown: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
  sentimentDistribution?: { sentiment: string; count: number; percentage: number }[];
  topCategories?: { category: string; count: number; percentage: number }[];
}
