import { create } from "zustand";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  selfieUrl?: string | null;
};

type AuthStore = {
  user: User | null;
  setUser: (user: User | null) => void;
};

export const useAuthStore =
  create<AuthStore>((set) => ({
    user: null,
    setUser: (user) =>
      set({ user }),
  }));