import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/client";
import type { RootState } from "../../store/store";

export type AuthUser = {
  id: number;
  email: string;
  nickname?: string | null;
  avatarUrl?: string | null;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string | null;
  bootstrapped: boolean;
};

// same keys a AuthContext
const TOKEN_KEY = "token";
const USER_KEY  = "gv_user";

// localStorage hydration
const tokenFromLS = localStorage.getItem(TOKEN_KEY);
const userFromLS: AuthUser | null = (() => {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch { return null; }
})();

const initialState: AuthState = {
  token: tokenFromLS,
  user: userFromLS,
  status: "idle",
  error: null,
  // if we already have token, we'll fetch /users/me to confirm -> not bootstrapped yet
  bootstrapped: tokenFromLS ? false : true,
};

// email/password
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }) => {
    const res = await api<{ token: string; user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res;
  }
);

// register
export const registerThunk = createAsyncThunk(
  "auth/register",
  async (payload: { email: string; password: string; nickname?: string }) => {
    const res = await api<{ token: string; user: AuthUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res;
  }
);

// Google: exchange code->tokens on backend
export const googleLoginWithCode = createAsyncThunk(
  "auth/googleLoginWithCode",
  async (payload: { code: string; redirectUri?: string }) => {
    const res = await api<{ token: string; user: AuthUser }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({
        code: payload.code,
        redirectUri: payload.redirectUri ?? "postmessage",
      }),
    });
    return res;
  }
);

// bootstrap current session (optional /users/me)
export const bootstrapAuth = createAsyncThunk("auth/bootstrap", async () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return { user: null as AuthUser | null };
  const me = await api<{ user: AuthUser }>("/users/me");
  return { user: me.user };
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      if (action.payload) {
        localStorage.setItem("auth_user", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("auth_user");
      }
    },
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem("token", action.payload);
      } else {
        localStorage.removeItem("token");
      }
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.status = "idle";
      state.error = null;
      state.bootstrapped = true;
      localStorage.removeItem("token");
      localStorage.removeItem("auth_user");
    },
  },
  extraReducers: (b) => {
    b
      // login
      .addCase(loginThunk.pending, (s) => {
        s.status = "loading"; s.error = null;
      })
      .addCase(loginThunk.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.token = a.payload.token;
        s.user = a.payload.user;
        s.bootstrapped = true;
        localStorage.setItem("token", a.payload.token);
        localStorage.setItem("gv_user", JSON.stringify(a.payload.user));
      })
      .addCase(loginThunk.rejected, (s, a) => {
        s.status = "failed"; s.error = a.error.message || "Login failed";
      })

      // register
      .addCase(registerThunk.pending, (s) => {
        s.status = "loading"; s.error = null;
      })
      .addCase(registerThunk.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.token = a.payload.token;
        s.user = a.payload.user;
        s.bootstrapped = true;
        localStorage.setItem(TOKEN_KEY, a.payload.token);
        localStorage.setItem(USER_KEY, JSON.stringify(a.payload.user));
      })
      .addCase(registerThunk.rejected, (s, a) => {
        s.status = "failed"; s.error = (a.error?.message as string) || "Register failed";
      })

      // google
      .addCase(googleLoginWithCode.pending, (s) => {
        s.status = "loading"; s.error = null;
      })
      .addCase(googleLoginWithCode.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.token = a.payload.token;
        s.user = a.payload.user;
        s.bootstrapped = true;
        localStorage.setItem(TOKEN_KEY, a.payload.token);
        localStorage.setItem(USER_KEY, JSON.stringify(a.payload.user));
      })
      .addCase(googleLoginWithCode.rejected, (s, a) => {
        s.status = "failed"; s.error = a.error.message || "Google login failed";
      })

      // bootstrap
      .addCase(bootstrapAuth.pending, (s) => {
        s.status = "loading"; s.error = null;
      })
      .addCase(bootstrapAuth.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.user = a.payload.user;
        s.bootstrapped = true;
        if (a.payload.user) localStorage.setItem("auth_user", JSON.stringify(a.payload.user));
      })
      .addCase(bootstrapAuth.rejected, (s, a) => {
        s.status = "failed";
        s.bootstrapped = true;
        s.error = (a.error?.message as string) || null;
      });
  },
});

export const authReducer = authSlice.reducer; // optional named export
export const { setUser, setToken, logout } = authSlice.actions;

// selectors
export const selectAuth = (s: RootState) => s.auth;
export const selectUser = (s: RootState) => s.auth.user;
export const selectToken = (s: RootState) => s.auth.token;
export const selectIsAuthenticated = (s: RootState) => !!s.auth.token;
export const selectAuthStatus = (s: RootState) => s.auth.status;
export const selectBootstrapped = (s: RootState) => s.auth.bootstrapped;

export default authSlice.reducer;
