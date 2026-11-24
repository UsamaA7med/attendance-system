import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, CheckCircle2, UserX } from "lucide-react";

interface StaffMetricsProps {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
}

export const StaffMetrics = React.memo(function StaffMetrics({
  totalCount,
  activeCount,
  inactiveCount,
}: StaffMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Total Staff
          </CardTitle>
          <ShieldCheck className="h-4 w-4 text-neutral-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold">{totalCount}</div>
          <p className="text-xs text-neutral-500 mt-1">Registered operations & admin staff</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Active Staff
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {activeCount}
          </div>
          <p className="text-xs text-neutral-500 mt-1">Authorized for daily operations</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Inactive Staff
          </CardTitle>
          <UserX className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
            {inactiveCount}
          </div>
          <p className="text-xs text-neutral-500 mt-1">Deactivated or former staff</p>
        </CardContent>
      </Card>
    </div>
  );
});
