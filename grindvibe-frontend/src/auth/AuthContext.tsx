import { useEffect, useMemo, useState, useCallback } from "react";
import { AuthContext } from "./context";
import type { AuthUser, AuthContextValue, LoginInput, RegisterInput } from "./types";

const STORAGE_KEYS = { token: "gv_token", user: "gv_user" };
const LEGACY_KEYS   = { token: "token",   user: "auth_user" };

const API_BASE = (import.meta.env.VITE_API_URL as string) ?? "http://localhost:5257";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]   = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const setSession = useCallback(
    ({ user, token }: { user: AuthUser; token: string }) => {
      setUser(user);
      setToken(token);
    },
    [] 
  );

  useEffect(() => {
    let storedToken = localStorage.getItem(STORAGE_KEYS.token);
    let storedUser  = localStorage.getItem(STORAGE_KEYS.user);

    // if null, then try legacy keys
    if (!storedToken || !storedUser) {
      const oldToken = localStorage.getItem(LEGACY_KEYS.token);
      const oldUser  = localStorage.getItem(LEGACY_KEYS.user);

      if (oldToken && oldUser) {
        localStorage.setItem(STORAGE_KEYS.token, oldToken);
        localStorage.setItem(STORAGE_KEYS.user,  oldUser);
        localStorage.removeItem(LEGACY_KEYS.token);
        localStorage.removeItem(LEGACY_KEYS.user);
        storedToken = oldToken;
        storedUser  = oldUser;
      }
    }

    if (storedToken) setToken(storedToken);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as AuthUser);
      } catch (e) {
        console.warn("Invalid user JSON in storage:", e);
        localStorage.removeItem(STORAGE_KEYS.user);
      }
    }

    setLoading(false);
  }, []);

  // Sync token - storage
  useEffect(() => {
    if (loading) return; 
    if (token) localStorage.setItem(STORAGE_KEYS.token, token);
    else localStorage.removeItem(STORAGE_KEYS.token);
  }, [token, loading]); 

  useEffect(() => {
    if (loading) return; 
    if (user) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.user);
  }, [user, loading]); 

  // standard login
  const login = useCallback(async ({ email, password }: LoginInput) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "omit",
    });
    if (!res.ok) throw new Error((await res.text()) || "Login failed");
    const data = (await res.json()) as { token: string; user: AuthUser };
    setSession({ token: data.token, user: data.user });
  }, [setSession]);

  const register = useCallback(async (input: RegisterInput) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      credentials: "omit",
    });
    if (!res.ok) throw new Error((await res.text()) || "Registration failed");
    const data = (await res.json()) as { token: string; user: AuthUser };
    setSession({ token: data.token, user: data.user });
  }, [setSession]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue & { setSession: (p: { user: AuthUser; token: string }) => void }>(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      loading,
      login,
      register,
      logout,
      setUser,     
      setSession,  
    }),
    [user, token, loading, login, register, logout, setUser, setSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
