import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@bunyang-flow/shared";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      setToken: (token) => set({ token }),
    }),
    {
      name: "bunyang-flow-auth",
    },
  ),
);
