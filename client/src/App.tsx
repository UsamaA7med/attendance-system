import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/queryClient";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Dashboard } from "@/pages/Dashboard";
import { Register } from "@/pages/Register";
import { Login } from "@/pages/Login";
import { ProtectedRoute, PublicRoute, AdminRoute } from "@/components/auth/ProtectedRoute";

const Teachers = lazy(() => import("@/pages/Teachers"));

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
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

              {/* Admin Only Routes */}
              <Route element={<AdminRoute />}>
                <Route
                  path="/teachers"
                  element={
                    <Suspense
                      fallback={
                        <div className="flex h-64 items-center justify-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent dark:border-white" />
                        </div>
                      }
                    >
                      <Teachers />
                    </Suspense>
                  }
                />
              </Route>
            </Route>
          </Route>

          {/* Catch-all: Redirect unknown routes to / (which redirects to /login if unauthorized) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
