import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { AuthUser } from "@/store/useAuthStore";
import { CheckCircle } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

interface RegisterSuccessViewProps {
  user: AuthUser;
}

export const RegisterSuccessView = React.memo(function RegisterSuccessView({
  user,
}: RegisterSuccessViewProps) {
  const navigate = useNavigate();

  return (
    <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20 shadow-sm animate-in fade-in duration-300">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
          <CheckCircle className="h-8 w-8" />
        </div>
        <CardTitle className="text-xl text-emerald-900 dark:text-emerald-200">
          Registration Successful!
        </CardTitle>
        <CardDescription className="text-emerald-700 dark:text-emerald-400 text-xs">
          Your staff credentials have been created and your session is active.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="rounded-lg border border-emerald-200 bg-white p-4 dark:border-emerald-900/80 dark:bg-neutral-900 space-y-2">
          <div className="flex justify-between items-center py-1 border-b border-neutral-100 dark:border-neutral-800 text-xs">
            <span className="text-neutral-500">Name</span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {user.name}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-neutral-100 dark:border-neutral-800 text-xs">
            <span className="text-neutral-500">Email</span>
            <span className="font-mono text-neutral-900 dark:text-neutral-100">
              {user.email}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 text-xs">
            <span className="text-neutral-500">Assigned Role</span>
            <Badge variant="outline" className="text-[10px] font-bold uppercase">
              {user.role || "STAFF"}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 border-t-0 bg-transparent pt-4 pb-6">
        <Button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          className="w-full h-10 font-semibold shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-all"
        >
          Go to Dashboard
        </Button>
      </CardFooter>
    </Card>
  );
});
