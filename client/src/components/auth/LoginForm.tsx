import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuthStore, type AuthUser } from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Lock,
  LogIn,
  Mail,
} from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { loginSchema, type LoginFormData } from "./auth.schemas";
import { PasswordInput } from "./PasswordInput";

interface ApiAuthResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
    refreshToken?: string;
  };
}

export const LoginForm = React.memo(function LoginForm() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await api.post<ApiAuthResponse>("/auth/login", {
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      const { user, accessToken } = response.data.data;
      setAuth(user, accessToken);

      toast.success("Signed in successfully!", {
        description: `Welcome back, ${user.name}! Access granted.`,
      });

      const destination = user.role?.toLowerCase() === "teacher" ? "/classes" : "/attendance";
      navigate(destination, { replace: true });
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

  return (
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
            placeholder="name@example.com"
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
          <PasswordInput
            placeholder="••••••••"
            hasError={Boolean(errors.password)}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.password.message}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 border-t-0 bg-transparent pt-6 pb-6">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full gap-2 font-semibold h-10 shadow-xs transition-all"
        >
          {isSubmitting ? (
            "Signing In..."
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Sign In
            </>
          )}
        </Button>
      </CardFooter>
    </form>
  );
});
