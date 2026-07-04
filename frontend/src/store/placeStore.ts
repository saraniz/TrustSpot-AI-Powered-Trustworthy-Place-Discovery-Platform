import { create } from "zustand";
import { placeApi } from "../../api/api";
import type { Place } from "../types";


type PlaceState = {
  places: Place[];
  currentPlace: Place | null;
  loading: boolean;
  error: string | null;

  fetchPlaces: () => Promise<void>;
  fetchPlaceById: (id: number) => Promise<Place | null>;
  createPlace: (placeData: Omit<Place, "id">) => Promise<Place | null>;
  updatePlace: (id: number, placeData: Partial<Place>) => Promise<Place | null>;
  deletePlace: (id: number) => Promise<boolean>;
  searchPlaces: (query: string) => Promise<void>;
};

export const usePlaceStore = create<PlaceState>((set, get) => ({
  places: [],
  currentPlace: null,
  loading: false,
  error: null,

  fetchPlaces: async () => {
    try {
      set({ loading: true, error: null });
      const res = await placeApi.get<Place[]>("/api/places");
      set({ places: res.data, loading: false });
    } catch (err: any) {
      console.error("Error fetching places:", err);
      set({
        error: err.response?.data?.message || "Failed to fetch places",
        loading: false,
      });
    }
  },

  fetchPlaceById: async (id) => {
    try {
      set({ loading: true, error: null, currentPlace: null });
      const res = await placeApi.get<Place>(`/api/places/${id}`);
      set({ currentPlace: res.data, loading: false });
      return res.data;
    } catch (err: any) {
      console.error(`Error fetching place with ID ${id}:`, err);
      set({
        error: err.response?.data?.message || "Failed to fetch place details",
        loading: false,
      });
      return null;
    }
  },

  createPlace: async (placeData) => {
    try {
      set({ loading: true, error: null });
      const res = await placeApi.post<Place>("/api/places", placeData);
      set((state) => ({
        places: [...state.places, res.data],
        loading: false,
      }));
      return res.data;
    } catch (err: any) {
      console.error("Error creating place:", err);
      set({
        error: err.response?.data?.message || "Failed to create place",
        loading: false,
      });
      return null;
    }
  },

  updatePlace: async (id, placeData) => {
    try {
      set({ loading: true, error: null });
      const res = await placeApi.put<Place>(`/api/places/${id}`, placeData);
      set((state) => ({
        places: state.places.map((p) => (p.id === id ? res.data : p)),
        currentPlace: state.currentPlace?.id === id ? res.data : state.currentPlace,
        loading: false,
      }));
      return res.data;
    } catch (err: any) {
      console.error(`Error updating place with ID ${id}:`, err);
      set({
        error: err.response?.data?.message || "Failed to update place",
        loading: false,
      });
      return null;
    }
  },

  deletePlace: async (id) => {
    try {
      set({ loading: true, error: null });
      await placeApi.delete(`/api/places/${id}`);
      set((state) => ({
        places: state.places.filter((p) => p.id !== id),
        currentPlace: state.currentPlace?.id === id ? null : state.currentPlace,
        loading: false,
      }));
      return true;
    } catch (err: any) {
      console.error(`Error deleting place with ID ${id}:`, err);
      set({
        error: err.response?.data?.message || "Failed to delete place",
        loading: false,
      });
      return false;
    }
  },

  searchPlaces: async (query) => {
    try {
      set({ loading: true, error: null });
      const res = await placeApi.get<Place[]>(`/api/places/search`, {
        params: { q: query },
      });
      set({ places: res.data, loading: false });
    } catch (err: any) {
      console.error("Error searching places:", err);
      set({
        error: err.response?.data?.message || "Failed to search places",
        loading: false,
      });
    }
  },
}));
