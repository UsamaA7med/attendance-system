import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { api, setAccessToken } from "@/lib/api";
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
  UserPlus,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  AlertCircle,
  LogIn,
} from "lucide-react";

// Client-side Zod validation schema
const registerFormSchema = z
  .object({
    name: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(60, "Full name must be under 60 characters"),
    email: z
      .string()
      .min(1, "Email address is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password cannot exceed 100 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerFormSchema>;

interface ApiRegisterSuccessResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    accessToken: string;
    refreshToken?: string;
  };
}

export function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Automatic role enforcement: the endpoint registers as 'staff'
      const payload = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
      };

      const response = await api.post<ApiRegisterSuccessResponse>(
        "/auth/register",
        payload
      );

      const registered = response.data.data.user;
      const accessToken = response.data.data.accessToken;

      if (accessToken) {
        setAccessToken(accessToken);
        useAuthStore.getState().setAuth(registered, accessToken);
      }

      setRegisteredUser({
        name: registered.name,
        email: registered.email,
        role: registered.role,
      });

      toast.success("Account created successfully!", {
        description: `Welcome ${registered.name}! Your account has been registered successfully.`,
        duration: 4000,
      });

      reset();
    } catch (err: unknown) {
      const error = err as {
        response?: {
          status?: number;
          data?: {
            message?: string;
            errors?: Array<{ path: string; message: string }>;
          };
        };
        message?: string;
      };

      const serverMessage =
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please check your network and try again.";

      toast.error("Registration Failed", {
        description: serverMessage,
        duration: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center items-center px-4 py-10 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-2xl">
        {/* Page Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-neutral-900 mb-3">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Create an Account
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            Attendance Hub • Enter your details to get started
          </p>
        </div>

      {registeredUser ? (
        /* Success Screen */
        <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20 shadow-sm animate-in fade-in duration-300">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
              <CheckCircle className="h-8 w-8" />
            </div>
            <CardTitle className="text-xl text-emerald-900 dark:text-emerald-200">
              Registration Successful!
            </CardTitle>
            <CardDescription className="text-emerald-700 dark:text-emerald-400">
              Your staff credentials have been created and your session is active.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg border border-emerald-200 bg-white p-4 dark:border-emerald-900/80 dark:bg-neutral-900 space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500">Name</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {registeredUser.name}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500">Email</span>
                <span className="font-mono text-neutral-900 dark:text-neutral-100">
                  {registeredUser.email}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-neutral-500">Assigned Role</span>
                <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 font-semibold uppercase tracking-wider text-xs">
                  {registeredUser.role} (Automatic)
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pt-2">
            <Button
              onClick={() => navigate("/")}
              className="w-full gap-2 font-medium"
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setRegisteredUser(null);
                reset();
              }}
              className="w-full"
            >
              Register Another Staff Account
            </Button>
          </CardFooter>
        </Card>
      ) : (
        /* Registration Form Card */
        <Card className="shadow-sm border-neutral-200 dark:border-neutral-800">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Create New Account</CardTitle>
            <CardDescription>
              Enter your information below to register your account.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-neutral-400" />
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                  className={errors.name ? "border-rose-500 focus-visible:ring-rose-500/20" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-neutral-400" />
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="sarah@attendance.local"
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
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters"
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

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-neutral-400" />
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    aria-invalid={!!errors.confirmPassword}
                    {...register("confirmPassword")}
                    className={`pr-9 ${errors.confirmPassword ? "border-rose-500 focus-visible:ring-rose-500/20" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.confirmPassword.message}
                  </p>
                )}
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-neutral-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-neutral-900 dark:text-neutral-100 underline underline-offset-4 hover:text-neutral-600 inline-flex items-center gap-1"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Sign in to Portal
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      )}
      </div>
    </div>
  );
}