import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuthStore, type AuthUser } from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    AlertCircle,
    Loader2,
    Lock,
    Mail,
    User,
    UserPlus
} from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { registerSchema, type RegisterFormData } from "./auth.schemas";
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

interface RegisterFormProps {
  onSuccess: (user: AuthUser) => void;
}

export const RegisterForm = React.memo(function RegisterForm({ onSuccess }: RegisterFormProps) {
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
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
      const payload = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
      };

      const response = await api.post<ApiAuthResponse>("/auth/register", payload);

      const { user, accessToken } = response.data.data;
      if (accessToken) {
        setAuth(user, accessToken);
      }

      toast.success("Account created successfully!", {
        description: `Welcome ${user.name}! Your staff account is active.`,
        duration: 4000,
      });

      reset();
      onSuccess(user);
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      const serverMessage =
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please check your credentials and try again.";

      toast.error("Registration Failed", {
        description: serverMessage,
        duration: 5000,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CardContent className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-neutral-400" />
            Full Name
          </label>
          <Input
            placeholder="Enter your full name"
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
            Work Email
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
            placeholder="Min. 6 characters"
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

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-neutral-400" />
            Confirm Password
          </label>
          <PasswordInput
            placeholder="Re-enter password"
            hasError={Boolean(errors.confirmPassword)}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.confirmPassword.message}
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

        <div className="pt-2 text-center text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800/80 w-full">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-neutral-900 hover:text-neutral-700 dark:text-neutral-100 dark:hover:text-neutral-300 underline underline-offset-4 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </form>
  );
});
