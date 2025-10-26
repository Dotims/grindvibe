import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/client";
import type { RootState } from "../../store/store";

export type AuthUser = {
  id: string;
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

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  user: null,
  status: "idle",
  error: null,
  bootstrapped: false,
};

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

export const bootstrapAuth = createAsyncThunk("auth/bootstrap", async () => {
  const token = localStorage.getItem("token");
  if (!token) return { user: null as AuthUser | null };
  const me = await api<AuthUser>("/users/me");
  return { user: me };
});


const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<AuthUser | null>) {
            state.user = action.payload;
        },
        logout(state) {
            state.token = null;
            state.user = null;
            localStorage.removeItem("token");
            state.status = "idle";
            state.error = null;
            state.bootstrapped = true;
            localStorage.removeItem("token");
        },
    },
    extraReducers: (b) => {
        b   
            // login
            .addCase(loginThunk.pending, (s) => {
                s.status = "loading";
                s.error = null;
            })
            .addCase(loginThunk.fulfilled, (s, a) => {
                s.status = "succeeded";
                s.token = a.payload.token;
                s.user = a.payload.user;
                s.error = null;
                localStorage.setItem("token", a.payload.token);
            })
            .addCase(loginThunk.rejected, (s, a) => {
                s.status = "failed";
                s.error = a.error.message || "Login failed";
            })

            // register
            .addCase(registerThunk.pending, (s) => {
                s.status = "loading";
                s.error = null;
            })
            .addCase(registerThunk.fulfilled, (s, a) => {
                s.status = "succeeded";
                s.token = a.payload.token;
                s.user = a.payload.user;
                s.bootstrapped = true;
                localStorage.setItem("token", a.payload.token);
            })
            .addCase(registerThunk.rejected, (s, a) => {
                s.status = "failed";
                s.error = (a.error?.message as string) || "Register failed";
            })

            // bootstrap
            .addCase(bootstrapAuth.pending, (s) => {
                s.status = "loading";
                s.error = null;
            })
            .addCase(bootstrapAuth.fulfilled, (s, a) => {
                s.status = "succeeded";
                s.user = a.payload.user;
                s.bootstrapped = true;
            })
            .addCase(bootstrapAuth.rejected, (s, a) => {
                s.status = "failed";
                s.bootstrapped = true;
                s.error = (a.error?.message as string) || null;
            });
    },
});

export const authReducer = authSlice.reducer;

export const { setUser, logout } = authSlice.actions;

// selectors
export const selectAuth = (s: RootState) => s.auth;
export const selectUser = (s: RootState) => s.auth.user;
export const selectToken = (s: RootState) => s.auth.token;
export const selectIsAuthenticated = (s: RootState) => !!s.auth.token;

export default authSlice.reducer;