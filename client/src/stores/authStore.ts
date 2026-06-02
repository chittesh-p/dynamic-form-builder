import { create } from "zustand";
import { api, TOKEN_KEY, USER_KEY } from "../lib/api";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthResponse = {
  user: User;
  token: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

function readUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function persistAuth(auth: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, auth.token);
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

export const useAuthStore = create<AuthState>((set) => ({
  user: readUser(),
  token: localStorage.getItem(TOKEN_KEY),
  login: async (email, password) => {
    const auth = await api<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      auth: false
    });
    persistAuth(auth);
    set({ user: auth.user, token: auth.token });
  },
  register: async (name, email, password) => {
    const auth = await api<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
      auth: false
    });
    persistAuth(auth);
    set({ user: auth.user, token: auth.token });
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null, token: null });
  }
}));

