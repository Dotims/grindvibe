import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  loginThunk,
  registerThunk,
  logout as logoutAction,
  setUser as setUserAction,
  bootstrapAuth,
  selectAuth,
} from "../features/auth/authSlice";
import type { AuthUser } from "../features/auth/authSlice";

export function useAuth() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);

  useEffect(() => {
    if (!auth.bootstrapped) {
      dispatch(bootstrapAuth());
    }
  }, [auth.bootstrapped, dispatch]);

  return {
    user: auth.user,
    token: auth.token,
    loading: !auth.bootstrapped || auth.status === "loading",
    login: (p: { email: string; password: string }) =>
      dispatch(loginThunk(p)).unwrap(),
    register: (p: { email: string; password: string; nickname?: string }) =>
      dispatch(registerThunk(p)).unwrap(),
    logout: () => dispatch(logoutAction()),
    setUser: (u: AuthUser) => dispatch(setUserAction(u)), // używane po uploadzie avatara
  };
}
