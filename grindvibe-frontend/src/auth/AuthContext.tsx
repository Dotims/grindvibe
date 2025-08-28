import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./context";
import type { AuthUser, AuthContextValue, LoginInput, RegisterInput } from "./types";

const STORAGE_KEYS = { token: "gv_token", user: "gv_user" };
const API_BASE = import.meta.env.VITE_API_URL ?? "";

type AuthProviderProps = { children: ReactNode };

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // hydratacja: token i user niezależnie
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEYS.token);
    const storedUser = localStorage.getItem(STORAGE_KEYS.user);
    if (storedToken) setToken(storedToken);
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  // sync token -> storage
  useEffect(() => {
    if (token) localStorage.setItem(STORAGE_KEYS.token, token);
    else localStorage.removeItem(STORAGE_KEYS.token);
  }, [token]);

  // sync user -> storage (dependency array)
  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.user);
  }, [user]);

  // login
  const login = async ({ email, password }: LoginInput) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error((await res.text()) || "Login failed");

    const data = await res.json(); // { token, user? }
    setToken(data.token);
    setUser(data.user ?? null);
  };

  const register = async (input: RegisterInput) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error((await res.text()) || "Registration failed");

    const data = await res.json();
    setToken(data.token);
    setUser(data.user ?? null);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isAuthenticated: !!token, loading, login, register, logout }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}