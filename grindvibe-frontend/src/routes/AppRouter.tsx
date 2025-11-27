import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/home/index";
import Login from "../pages/auth/Login";
import AppLayout from "../components/layout/AppLayout";
import Register from "../pages/auth/Register";
import ForgotPasswordPage from "../pages/auth/ForgotPassword";
import RequireAuth from "../guards/RequireAuth";
import Account  from "../pages/auth/Account";
import Exercises from "../pages/exercises/index";
import ExerciseDetail from "../pages/exercises/Details";
import RoutinesPage from "../pages/routines";
import NewRoutinePage from "../pages/routines/New";
import RoutineDetails from "../pages/routines/Details";
import EditRoutinePage from "../pages/routines/Edit";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />

        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        
        <Route path="/account" element={ <RequireAuth /> } >
            <Route path="/account" element={<Account />} />
        </Route>

        <Route path="/exercises" element={ <Exercises />} />
        <Route path="/exercises/:id" element={ <ExerciseDetail />} />

        {/* --- ROUTINES --- */}
        
        {/* 1. Create new routine (Protected) */}
        <Route element={<RequireAuth />}>
          <Route path="/routines/new" element={<NewRoutinePage />} />
          {/* Edit Route */}
          <Route path="/routines/:slug/edit" element={<EditRoutinePage />} />
        </Route>

        {/* 2. List of routines */}
        <Route path="/routines" element={ <RoutinesPage />} />
        
        {/* 3. Single routine details (Dynamic parameter last) */}
        <Route path="/routines/:slug" element={ <RoutineDetails />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}