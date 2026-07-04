import { create } from "zustand";
import { reviewApi } from "../../api/api";
import type { Review } from "../types";


type ReviewState = {
  reviews: Review[];
  loading: boolean;
  error: string | null;

  fetchReviewsByPlace: (placeId: number) => Promise<void>;
  fetchReviewsByUser: (userId: number) => Promise<void>;
  createReview: (reviewData: {
    placeId: number;
    userId: number;
    rating: number;
    comment: string;
    imageUrls?: string[];
  }) => Promise<Review | null>;
  updateReview: (id: number, reviewData: Partial<Review>) => Promise<Review | null>;
  deleteReview: (id: number) => Promise<boolean>;
  toggleLikeReview: (reviewId: number, userId: number) => Promise<Review | null>;
};

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  loading: false,
  error: null,

  fetchReviewsByPlace: async (placeId) => {
    try {
      set({ loading: true, error: null });
      const res = await reviewApi.get<Review[]>(`/api/reviews/place/${placeId}`);
      set({ reviews: res.data, loading: false });
    } catch (err: any) {
      console.error(`Error fetching reviews for place ${placeId}:`, err);
      set({
        error: err.response?.data?.message || "Failed to fetch reviews for place",
        loading: false,
      });
    }
  },

  fetchReviewsByUser: async (userId) => {
    try {
      set({ loading: true, error: null });
      const res = await reviewApi.get<Review[]>(`/api/reviews/user/${userId}`);
      set({ reviews: res.data, loading: false });
    } catch (err: any) {
      console.error(`Error fetching reviews for user ${userId}:`, err);
      set({
        error: err.response?.data?.message || "Failed to fetch reviews for user",
        loading: false,
      });
    }
  },

  createReview: async (reviewData) => {
    try {
      set({ loading: true, error: null });
      console.debug("[reviewStore] createReview - Payload:", reviewData);
      
      const res = await reviewApi.post<Review>("/api/reviews", reviewData);
      
      console.debug("[reviewStore] createReview - Success:", res.data);
      set((state) => ({
        reviews: [res.data, ...state.reviews],
        loading: false,
      }));
      return res.data;
    } catch (err: any) {
      console.error("[reviewStore] createReview - Error details:", {
        message: err.message,
        responseStatus: err.response?.status,
        responseData: err.response?.data,
        payloadSent: reviewData,
      });
      set({
        error: err.response?.data?.message || "Failed to submit review",
        loading: false,
      });
      return null;
    }
  },

  updateReview: async (id, reviewData) => {
    try {
      set({ loading: true, error: null });
      const res = await reviewApi.put<Review>(`/api/reviews/${id}`, reviewData);
      set((state) => ({
        reviews: state.reviews.map((r) => (r.id === id ? res.data : r)),
        loading: false,
      }));
      return res.data;
    } catch (err: any) {
      console.error(`Error updating review ${id}:`, err);
      set({
        error: err.response?.data?.message || "Failed to update review",
        loading: false,
      });
      return null;
    }
  },

  deleteReview: async (id) => {
    try {
      set({ loading: true, error: null });
      await reviewApi.delete(`/api/reviews/${id}`);
      set((state) => ({
        reviews: state.reviews.filter((r) => r.id !== id),
        loading: false,
      }));
      return true;
    } catch (err: any) {
      console.error(`Error deleting review ${id}:`, err);
      set({
        error: err.response?.data?.message || "Failed to delete review",
        loading: false,
      });
      return false;
    }
  },

  toggleLikeReview: async (reviewId, userId) => {
    try {
      // The endpoint POST /api/reviews/{reviewId}/like supports userId as a query parameter or request body.
      // We pass it as query parameter to ensure compatibility.
      const res = await reviewApi.post<Review>(`/api/reviews/${reviewId}/like`, null, {
        params: { userId },
      });
      
      set((state) => ({
        reviews: state.reviews.map((r) => (r.id === reviewId ? res.data : r)),
      }));
      
      return res.data;
    } catch (err: any) {
      console.error(`Error toggling like on review ${reviewId}:`, err);
      set({
        error: err.response?.data?.message || "Failed to like/unlike review",
      });
      return null;
    }
  },
}));
