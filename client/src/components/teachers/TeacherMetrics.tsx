import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, CheckCircle2, BookOpen } from "lucide-react";

interface TeacherMetricsProps {
  totalCount: number;
  activeCount: number;
  totalClassesAssigned: number;
}

export const TeacherMetrics = React.memo(function TeacherMetrics({
  totalCount,
  activeCount,
  totalClassesAssigned,
}: TeacherMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Total Teachers
          </CardTitle>
          <GraduationCap className="h-4 w-4 text-neutral-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold">{totalCount}</div>
          <p className="text-xs text-neutral-500 mt-1">Registered teaching staff</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Active Teachers
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {activeCount}
          </div>
          <p className="text-xs text-neutral-500 mt-1">Available for active classes</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Classes Assigned
          </CardTitle>
          <BookOpen className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {totalClassesAssigned}
          </div>
          <p className="text-xs text-neutral-500 mt-1">Total active class courses taught</p>
        </CardContent>
      </Card>
    </div>
  );
});
