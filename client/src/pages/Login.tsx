import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface ApiLoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      department?: string;
      position?: string;
    };
    accessToken: string;
    refreshToken?: string;
  };
}

export function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await api.post<ApiLoginResponse>("/auth/login", {
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      const { user, accessToken } = response.data.data;
      setAuth(user, accessToken);

      toast.success("Signed in successfully!", {
        description: `Welcome back, ${user.name}! Access granted.`,
      });

      navigate("/", { replace: true });
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        error.response?.data?.message ||
        error.message ||
        "Invalid email or password. Please try again.";

      toast.error("Authentication Failed", {
        description: message,
      });
    }
  };

  const fillQuickCredentials = (email: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", "password123", { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Page Header */}
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-neutral-900 mb-3">
            <LogIn className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Sign In to Portal
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            Attendance Hub • Educational Center Portal
          </p>
        </div>

        <Card className="shadow-sm border-neutral-200 dark:border-neutral-800">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Staff & Admin Login</CardTitle>
            <Badge variant="secondary" className="gap-1 text-[11px] font-semibold">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              Secure RBAC
            </Badge>
          </div>
          <CardDescription>
            Authorized accounts only. All sessions verify against PostgreSQL database.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-neutral-400" />
                Email Address
              </label>
              <Input
                type="email"
                placeholder="staff@attendance.center"
                aria-invalid={!!errors.email}
                {...register("email")}
                className={errors.email ? "border-rose-500 focus-visible:ring-rose-500/20" : ""}
              />
              {errors.email && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-neutral-400" />
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                  className={`pr-9 ${errors.password ? "border-rose-500 focus-visible:ring-rose-500/20" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Quick Dev Autofill Helper */}
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 dark:border-neutral-800 dark:bg-neutral-900/60 text-xs space-y-1.5">
              <span className="text-[11px] font-semibold text-neutral-500">Quick Dev Accounts (Click to test):</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => fillQuickCredentials("osama@attendance.local")}
                  className="rounded border border-neutral-200 bg-white px-2 py-0.5 text-[11px] font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  Admin: osama@attendance.local
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickCredentials("sarah@attendance.local")}
                  className="rounded border border-neutral-200 bg-white px-2 py-0.5 text-[11px] font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  Staff: sarah@attendance.local
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full gap-2 font-medium h-9"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>

            <div className="text-center text-xs text-neutral-500">
              Don't have a staff account yet?{" "}
              <Link
                to="/register"
                className="font-semibold text-neutral-900 dark:text-neutral-100 underline underline-offset-4 hover:text-neutral-600 inline-flex items-center gap-1"
              >
                <UserPlus className="h-3 w-3" />
                Register as Staff
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  );
}
