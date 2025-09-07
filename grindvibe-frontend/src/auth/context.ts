import { createContext } from "react";
import type { AuthContextValue } from "./types";

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  login: async () => { throw new Error("AuthProvider missing"); },
  register: async () => { throw new Error("AuthProvider missing"); },
  logout: () => {},
  setUser: () => {},                              
});
