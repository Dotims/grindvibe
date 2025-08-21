import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/home/index";
import LoginPage from "../pages/auth/LoginPage";
import AppLayout from "../components/layout/AppLayout";
// import RegisterPage from "../pages/auth/RegisterPage";
// import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
// import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
// import AccountPage from "../pages/account/AccountPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      <Route path="/auth/login" element={<LoginPage />} />
      {/* <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/forgot" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset/:token" element={<ResetPasswordPage />} /> */}

      {/* Account (na razie publiczne w przyszlosci zrobi sie guard do tego) */}
      {/* <Route path="/account" element={<AccountPage />} /> */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}