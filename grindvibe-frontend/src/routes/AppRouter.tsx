import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/home/index";
import Login from "../pages/auth/Login";
import AppLayout from "../components/layout/AppLayout";
import Register from "../pages/auth/Register";
import ForgotPasswordPage from "../pages/auth/ForgotPassword";
// import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
// import AccountPage from "../pages/account/AccountPage";
import RequireAuth from "../guards/RequireAuth";
import Account  from "../pages/auth/Account";
import Exercises from "../pages/exercises/index";
import ExerciseDetail from "../pages/exercises/Details";
import RoutinesPage from "../pages/routines";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />

        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/account"
          element={ <RequireAuth /> } >
            <Route path="/account" element={<Account />} />
        </Route>
        <Route path="/exercises" element={ <Exercises />} />
        <Route path="/exercises/:id" element={ <ExerciseDetail />} />

        <Route 
          path="/routines"
          element={ <RoutinesPage />}
        >
          <Route path="/routines" element={<RoutinesPage />} />
        </Route>

        <Route path="/routines" element={ <RoutinesPage />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

    </Routes>
  );
}