import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/home/index";
import Login from "../pages/auth/Login";
import AppLayout from "../components/layout/AppLayout";
import Register from "../pages/auth/Register";
import ForgotPasswordPage from "../pages/auth/ForgotPassword";
// import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
// import AccountPage from "../pages/account/AccountPage";
import RequireAuth from "../guards/RequireAuth";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

      {/* <Route path="/auth/reset/:token" element={<ResetPasswordPage />} />   */}

      {/* Account (na razie publiczne w przyszlosci zrobi sie guard do tego) */}
      {/* <Route path="/account" element={<AccountPage />} /> */}

      <Route element={<RequireAuth />}>
        <Route path="/account" element={<div>Account Page - Protected</div>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}