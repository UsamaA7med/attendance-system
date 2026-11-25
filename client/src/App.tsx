import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/queryClient";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { Login } from "@/pages/Login";
import { ProtectedRoute, PublicRoute, AdminRoute, RoleRoute } from "@/components/auth/ProtectedRoute";
import { GlobalLoadingIndicator } from "@/components/common/GlobalLoadingIndicator";
import { LoadingSpinner } from "@/components/ui/spinner";

function RootRedirect() {
  const user = useAuthStore((state) => state.user);
  const isTeacher = user?.role?.toLowerCase() === "teacher";
  return <Navigate to={isTeacher ? "/classes" : "/attendance"} replace />;
}

const Teachers = lazy(() => import("@/pages/Teachers"));
const Staff = lazy(() => import("@/pages/Staff"));
const Classes = lazy(() => import("@/pages/Classes"));
const Lectures = lazy(() => import("@/pages/Lectures"));
const Attendance = lazy(() => import("@/pages/Attendance"));
const Students = lazy(() => import("@/pages/Students"));
const Reports = lazy(() => import("@/pages/Reports"));

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GlobalLoadingIndicator />
        <Toaster richColors position="top-right" />
        <Routes>
          {/* Public Auth Routes: Standalone pages, OUTSIDE DashboardLayout */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Navigate to="/login" replace />} />
          </Route>

          {/* Protected System Routes: Only accessible when authorized, INSIDE DashboardLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<RootRedirect />} />
              {/* Attendance: Accessible to Admin, Staff, and Teacher */}
              <Route element={<RoleRoute allowedRoles={["admin", "staff", "teacher"]} />}>
                <Route
                  path="/attendance"
                  element={
                    <Suspense fallback={<LoadingSpinner fullPage size="lg" label="Loading attendance..." />}>
                      <Attendance />
                    </Suspense>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <Suspense fallback={<LoadingSpinner fullPage size="lg" label="Loading reports..." />}>
                      <Reports />
                    </Suspense>
                  }
                />
              </Route>
              <Route
                path="/students"
                element={
                  <Suspense fallback={<LoadingSpinner fullPage size="lg" label="Loading students..." />}>
                    <Students />
                  </Suspense>
                }
              />

              {/* Classes: Accessible to Admin and Teacher */}
              <Route element={<RoleRoute allowedRoles={["admin", "teacher"]} />}>
                <Route
                  path="/classes"
                  element={
                    <Suspense fallback={<LoadingSpinner fullPage size="lg" label="Loading classes..." />}>
                      <Classes />
                    </Suspense>
                  }
                />
              </Route>

              {/* Lectures: Accessible to Admin, Staff, and Teacher */}
              <Route element={<RoleRoute allowedRoles={["admin", "staff", "teacher"]} />}>
                <Route
                  path="/lectures"
                  element={
                    <Suspense fallback={<LoadingSpinner fullPage size="lg" label="Loading lectures..." />}>
                      <Lectures />
                    </Suspense>
                  }
                />
              </Route>

              {/* Admin Only Routes */}
              <Route element={<AdminRoute />}>
                <Route
                  path="/teachers"
                  element={
                    <Suspense fallback={<LoadingSpinner fullPage size="lg" label="Loading teachers..." />}>
                      <Teachers />
                    </Suspense>
                  }
                />
                <Route
                  path="/staff"
                  element={
                    <Suspense fallback={<LoadingSpinner fullPage size="lg" label="Loading staff..." />}>
                      <Staff />
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
