import { create } from "zustand";
import { userApi } from "../../api/api";
import type { User } from "../types";
import { useAuthStore } from "./authStore";

type UserState = {
  userProfile: User | null;
  loading: boolean;
  error: string | null;

  fetchUserProfile: (id: number) => Promise<User | null>;
  updateUserProfile: (id: number, updateData: {
    name: string;
    email: string;
    bio: string;
  }) => Promise<User | null>;
  updateProfileImage: (id: number, imageUrl: string) => Promise<User | null>;
  updateCoverImage: (id: number, imageUrl: string) => Promise<User | null>;
};

export const useUserStore = create<UserState>((set) => ({
  userProfile: null,
  loading: false,
  error: null,

  fetchUserProfile: async (id) => {
    try {
      set({ loading: true, error: null });
      const res = await userApi.get(`/api/users/${id}`);
      
      const profile: User = {
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        bio: res.data.bio,
        profileImageUrl: res.data.profileImageUrl,
        coverImageUrl: res.data.coverImageUrl,
      };

      set({ userProfile: profile, loading: false });
      return profile;
    } catch (err: any) {
      console.error(`Error fetching user profile for user ${id}:`, err);
      set({
        error: err.response?.data?.message || "Failed to fetch user profile",
        loading: false,
      });
      return null;
    }
  },

  updateUserProfile: async (id, updateData) => {
    try {
      set({ loading: true, error: null });
      const res = await userApi.put(`/api/users/${id}`, updateData);
      
      const updatedProfile: User = {
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        bio: res.data.bio,
        profileImageUrl: res.data.profileImageUrl,
        coverImageUrl: res.data.coverImageUrl,
      };

      set({ userProfile: updatedProfile, loading: false });
      
      // Sync authStore user data
      useAuthStore.getState().updateUserInStore(updatedProfile);

      return updatedProfile;
    } catch (err: any) {
      console.error(`Error updating user profile for user ${id}:`, err);
      set({
        error: err.response?.data?.message || "Failed to update profile",
        loading: false,
      });
      return null;
    }
  },

  updateProfileImage: async (id, imageUrl) => {
    try {
      set({ loading: true, error: null });
      const res = await userApi.post(`/api/users/${id}/profile-image`, { imageUrl });
      
      const updatedProfile: User = {
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        bio: res.data.bio,
        profileImageUrl: res.data.profileImageUrl,
        coverImageUrl: res.data.coverImageUrl,
      };

      set({ userProfile: updatedProfile, loading: false });
      useAuthStore.getState().updateUserInStore(updatedProfile);
      return updatedProfile;
    } catch (err: any) {
      console.error(`Error updating profile image for user ${id}:`, err);
      set({
        error: err.response?.data?.message || "Failed to update profile image",
        loading: false,
      });
      return null;
    }
  },

  updateCoverImage: async (id, imageUrl) => {
    try {
      set({ loading: true, error: null });
      const res = await userApi.post(`/api/users/${id}/cover-image`, { imageUrl });
      
      const updatedProfile: User = {
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        bio: res.data.bio,
        profileImageUrl: res.data.profileImageUrl,
        coverImageUrl: res.data.coverImageUrl,
      };

      set({ userProfile: updatedProfile, loading: false });
      useAuthStore.getState().updateUserInStore(updatedProfile);
      return updatedProfile;
    } catch (err: any) {
      console.error(`Error updating cover image for user ${id}:`, err);
      set({
        error: err.response?.data?.message || "Failed to update cover image",
        loading: false,
      });
      return null;
    }
  },
}));
