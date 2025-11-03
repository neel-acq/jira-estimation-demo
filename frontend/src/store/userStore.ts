import { create } from "zustand";

interface UserState {
  isLoggedIn: boolean;
  userInfo: {
    name?: string;
    email?: string;
  } | null;
  setLogin: (user: { name: string; email: string }) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  isLoggedIn: false,
  userInfo: null,
  setLogin: (user) => set({ isLoggedIn: true, userInfo: user }),
  logout: () => set({ isLoggedIn: false, userInfo: null }),
}));
