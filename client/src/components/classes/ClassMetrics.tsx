import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, CheckCircle2, CalendarDays, Users } from "lucide-react";

interface ClassMetricsProps {
  totalClasses: number;
  activeClasses: number;
  totalLectures: number;
  totalEnrollments: number;
}

export const ClassMetrics = React.memo(function ClassMetrics({
  totalClasses,
  activeClasses,
  totalLectures,
  totalEnrollments,
}: ClassMetricsProps) {
  const cards = [
    {
      title: "Total Classes",
      value: totalClasses,
      description: "Center course offerings",
      icon: BookOpen,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/40",
    },
    {
      title: "Active Classes",
      value: activeClasses,
      description: "Currently ongoing groups",
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/40",
    },
    {
      title: "Scheduled Lectures",
      value: totalLectures,
      description: "Dated class lectures",
      icon: CalendarDays,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/40",
    },
    {
      title: "Total Enrollments",
      value: totalEnrollments,
      description: "Active class seats",
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900/40",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="shadow-xs overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {card.title}
                  </p>
                  <h3 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mt-1">
                    {card.value}
                  </h3>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                    {card.description}
                  </p>
                </div>
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${card.bg} ${card.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});
