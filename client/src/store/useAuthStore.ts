import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, getAccessToken, setAccessToken, clearTokens } from "@/lib/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  position?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: getAccessToken(),
      isAuthenticated: Boolean(getAccessToken()),
      isLoading: false,

      setAuth: (user: AuthUser, token: string) => {
        setAccessToken(token);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: async () => {
        try {
          await api.post("/auth/logout").catch(() => {});
        } finally {
          clearTokens();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      checkAuth: async () => {
        const token = getAccessToken();
        if (!token) {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const res = await api.get("/auth/me");
          if (res.data?.data) {
            set({
              user: res.data.data,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error("Invalid session");
          }
        } catch {
          clearTokens();
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: "attendance-auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Listen for 401 token expiry event dispatched from Axios interceptor
if (typeof window !== "undefined") {
  window.addEventListener("auth:expired", () => {
    useAuthStore.getState().logout();
  });
}
