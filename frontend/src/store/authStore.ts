import { create } from "zustand";
import { userApi } from "../../api/api";

export interface User {
  id: number;
  name: string;
  email: string;
  bio?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
}

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  updateUserInStore: (updatedUser: Partial<User>) => void;
};

// Initial state from localStorage to prevent flash of login screen
const initialToken = localStorage.getItem("token");
let initialUser: User | null = null;
const storedUser = localStorage.getItem("user");
if (storedUser) {
  try {
    initialUser = JSON.parse(storedUser);
  } catch (e) {
    console.error("Failed to parse user from localStorage", e);
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  token: initialToken,
  loading: false,
  error: null,

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });

      const res = await userApi.post("/api/users/login", {
        email,
        password,
      });

      const { token, userId, email: resEmail, name } = res.data;

      // Immediately store token so it is used in subsequent API calls
      localStorage.setItem("token", token);

      // Now fetch full user profile to get bio, images etc.
      let fullUser: User = {
        id: userId,
        name,
        email: resEmail,
      };

      try {
        const profileRes = await userApi.get(`/api/users/${userId}`);
        fullUser = {
          id: profileRes.data.id,
          name: profileRes.data.name,
          email: profileRes.data.email,
          bio: profileRes.data.bio,
          profileImageUrl: profileRes.data.profileImageUrl,
          coverImageUrl: profileRes.data.coverImageUrl,
        };
      } catch (profileErr) {
        console.error("Failed to fetch full user profile on login", profileErr);
      }

      localStorage.setItem("user", JSON.stringify(fullUser));

      set({
        user: fullUser,
        token,
        loading: false,
      });

      return true;
    } catch (err: any) {
      console.error("[auth] login error", err);
      set({
        error: err.response?.data?.message || "Login failed",
        loading: false,
      });
      return false;
    }
  },

  register: async (name, email, password) => {
    try {
      set({ loading: true, error: null });

      const res = await userApi.post("/api/users/register", {
        name,
        email,
        password,
      });

      const { token, userId, email: resEmail, name: resName } = res.data;

      localStorage.setItem("token", token);

      const newUser: User = {
        id: userId,
        name: resName,
        email: resEmail,
        bio: "",
        profileImageUrl: "",
        coverImageUrl: "",
      };

      localStorage.setItem("user", JSON.stringify(newUser));

      set({
        user: newUser,
        token,
        loading: false,
      });
      return true;
    } catch (err: any) {
      console.error("[auth] register error", err);
      set({
        error: err.response?.data?.message || "Registration failed",
        loading: false,
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    set({
      user: null,
      token: null,
      error: null,
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      get().logout();
      return false;
    }

    try {
      set({ loading: true });
      const res = await userApi.post("/api/users/validate", null, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.valid) {
        const userId = res.data.userId;
        
        // Fetch fresh profile
        const profileRes = await userApi.get(`/api/users/${userId}`);
        const freshUser: User = {
          id: profileRes.data.id,
          name: profileRes.data.name,
          email: profileRes.data.email,
          bio: profileRes.data.bio,
          profileImageUrl: profileRes.data.profileImageUrl,
          coverImageUrl: profileRes.data.coverImageUrl,
        };

        localStorage.setItem("user", JSON.stringify(freshUser));
        set({
          user: freshUser,
          token,
          loading: false,
        });
        return true;
      } else {
        get().logout();
        return false;
      }
    } catch (err) {
      console.error("Token validation failed, logging out", err);
      get().logout();
      return false;
    }
  },

  updateUserInStore: (updatedUser: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedUser };
      localStorage.setItem("user", JSON.stringify(newUser));
      set({ user: newUser });
    }
  },
}));

