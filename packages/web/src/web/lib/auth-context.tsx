import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiFetch } from "./api";

interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  bio?: string;
  age?: number;
  location?: string;
  avatarUrl?: string;
  interests?: string[];
  vibeAnswers?: string[];
  responseScore?: number;
  isGoldSpark?: boolean;
  verificationStatus?: string;
  role?: string;
  language?: string;
  zenModeEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchUser() {
    try {
      const data = await apiFetch("/users/me");
      setUser(data);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("hs_token");
    if (token) {
      fetchUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const res = await fetch("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || "Invalid credentials");
    }
    const data = await res.json();
    if (data.token) localStorage.setItem("hs_token", data.token);
    await fetchUser();
  }

  async function register(name: string, email: string, password: string) {
    const res = await fetch("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || "Registration failed");
    }
    const data = await res.json();
    if (data.token) localStorage.setItem("hs_token", data.token);
    await fetchUser();
  }

  async function logout() {
    await fetch("/api/auth/sign-out", { method: "POST" });
    localStorage.removeItem("hs_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
