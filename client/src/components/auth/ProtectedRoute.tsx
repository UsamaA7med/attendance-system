import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    // Unauthorized users cannot access protected pages and are directed to the register form
    return <Navigate to="/register" replace />;
  }

  return <Outlet />;
}

export function PublicRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    // Already authenticated users trying to access login/register are directed to the dashboard
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
