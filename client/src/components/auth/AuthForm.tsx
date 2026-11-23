import { useState } from "react";
import { useLocation } from "react-router-dom";
import type { AuthUser } from "@/store/useAuthStore";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { RegisterSuccessView } from "./RegisterSuccessView";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogIn, UserPlus } from "lucide-react";

export interface AuthFormProps {
  initialMode?: "login" | "register";
}

export function AuthForm({ initialMode = "login" }: AuthFormProps) {
  const location = useLocation();

  // Derive mode directly from URL pathname or initialMode
  const mode: "login" | "register" =
    location.pathname === "/register"
      ? "register"
      : location.pathname === "/login"
      ? "login"
      : initialMode;

  const [registeredSuccessUser, setRegisteredSuccessUser] = useState<AuthUser | null>(null);

  // If user completed registration, display the success summary view
  if (registeredSuccessUser) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 font-sans">
        <div className="w-full max-w-md space-y-6">
          <RegisterSuccessView user={registeredSuccessUser} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-neutral-900 mb-3">
            {mode === "login" ? <LogIn className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            {mode === "login" ? "Sign In to Portal" : "Create Staff Account"}
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            Attendance Hub • Educational Center Portal
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-sm border-neutral-200 dark:border-neutral-800">
          <CardHeader className="space-y-1 pb-4 text-center">
            <CardTitle className="text-lg">
              {mode === "login" ? "Staff & Admin Login" : "Staff Registration"}
            </CardTitle>
            <CardDescription className="text-xs">
              {mode === "login"
                ? "Enter your credentials to access classes and attendance records."
                : "Register a new staff account. Automatic role assignment: STAFF."}
            </CardDescription>
          </CardHeader>

          {/* Render Isolated Form */}
          {mode === "login" ? (
            <LoginForm />
          ) : (
            <RegisterForm onSuccess={setRegisteredSuccessUser} />
          )}
        </Card>
      </div>
    </div>
  );
}

export default AuthForm;
