import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Dashboard } from "@/pages/Dashboard";
import { Records } from "@/pages/Records";
import { ApiStatus } from "@/pages/ApiStatus";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/records" element={<Records />} />
            <Route path="/api-status" element={<ApiStatus />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
