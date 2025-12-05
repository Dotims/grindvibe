import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

export default function RequireAuth() {
  const { token } = useAppSelector((state) => state.auth);
  const location = useLocation();

  const hasToken = !!token || !!localStorage.getItem("gv_token") || !!localStorage.getItem("token");

  if (!hasToken) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}