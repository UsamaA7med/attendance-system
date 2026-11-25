import { LoginForm } from "./LoginForm";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield } from "lucide-react";

export function AuthForm() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-neutral-900 mb-3">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Attendance Hub
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            Educational Center Portal
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-sm border-neutral-200 dark:border-neutral-800">
          <CardHeader className="space-y-1 pb-4 text-center">
            <CardTitle className="text-lg">Staff, Admin & Teacher Login</CardTitle>
          </CardHeader>

          <LoginForm />
        </Card>
      </div>
    </div>
  );
}

export default AuthForm;
