import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

export default function RequireAuth(){
    const isAuthenticated = useAppSelector((state) => !!state.auth.user);
    const bootstrapped = useAppSelector((state) => state.auth.bootstrapped);
    const location = useLocation();

    if (!bootstrapped) return <div>Ładowanie...</div>

    if (!isAuthenticated) 
        return <Navigate to="/login" state={{ from: location }} replace />;

    return <Outlet />;
}