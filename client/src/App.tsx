import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Dashboard } from "@/pages/Dashboard";
import { Records } from "@/pages/Records";
import { ApiStatus } from "@/pages/ApiStatus";
import { Register } from "@/pages/Register";
import { Login } from "@/pages/Login";
import { ProtectedRoute, PublicRoute } from "@/components/auth/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        {/* Public Auth Routes: Standalone pages, OUTSIDE DashboardLayout */}
        <Route element={<PublicRoute />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected System Routes: Only accessible when authorized, INSIDE DashboardLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/records" element={<Records />} />
            <Route path="/api-status" element={<ApiStatus />} />
          </Route>
        </Route>

        {/* Catch-all: Redirect unknown routes to / (which redirects to /register if unauthorized) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
