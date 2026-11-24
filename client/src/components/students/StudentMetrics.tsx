import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserX, BookOpen } from "lucide-react";

interface StudentMetricsProps {
  total: number;
  active: number;
  inactive: number;
  totalEnrollments: number;
}

export const StudentMetrics = React.memo(function StudentMetrics({
  total,
  active,
  inactive,
  totalEnrollments,
}: StudentMetricsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card className="shadow-xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Total Students
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mt-1">
              {total}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <Users className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Active Students
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {active}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <UserCheck className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Inactive Students
            </p>
            <p className="text-2xl font-bold text-neutral-600 dark:text-neutral-400 mt-1">
              {inactive}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            <UserX className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Active Enrollments
            </p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              {totalEnrollments}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <BookOpen className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
