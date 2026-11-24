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
import { GlobalLoadingIndicator } from "@/components/common/GlobalLoadingIndicator";
import { LoadingSpinner } from "@/components/ui/spinner";

const Teachers = lazy(() => import("@/pages/Teachers"));
const Classes = lazy(() => import("@/pages/Classes"));
const Attendance = lazy(() => import("@/pages/Attendance"));
const Students = lazy(() => import("@/pages/Students"));

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GlobalLoadingIndicator />
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
              <Route
                path="/attendance"
                element={
                  <Suspense fallback={<LoadingSpinner fullPage size="lg" label="Loading attendance..." />}>
                    <Attendance />
                  </Suspense>
                }
              />
              <Route
                path="/students"
                element={
                  <Suspense fallback={<LoadingSpinner fullPage size="lg" label="Loading students..." />}>
                    <Students />
                  </Suspense>
                }
              />

              {/* Admin Only Routes */}
              <Route element={<AdminRoute />}>
                <Route
                  path="/classes"
                  element={
                    <Suspense fallback={<LoadingSpinner fullPage size="lg" label="Loading classes & lectures..." />}>
                      <Classes />
                    </Suspense>
                  }
                />
                <Route
                  path="/teachers"
                  element={
                    <Suspense fallback={<LoadingSpinner fullPage size="lg" label="Loading teachers..." />}>
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
