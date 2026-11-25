import { useMemo, useState } from "react";
import { BarChart3, CalendarDays, ClipboardCheck, Download, TrendingUp, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLectures } from "@/hooks/useLectures";
import type { LectureItem } from "@/lib/lectures.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createReportsWorkbook } from "@/lib/reports-export";
import { toast } from "sonner";

const STATUS_COLORS = {
  present: "#10b981",
  absent: "#f43f5e",
  late: "#f59e0b",
  excused: "#6366f1",
};

const STATUS_LABELS = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  excused: "Excused",
};

type AttendanceTotals = {
  present: number;
  absent: number;
  late: number;
  excused: number;
};

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateRange(days: number) {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  return { startDate: dateKey(start), endDate: dateKey(end) };
}

function sumStatuses(lectures: LectureItem[]): AttendanceTotals {
  return lectures.reduce<AttendanceTotals>(
    (totals, lecture) => ({
      present: totals.present + lecture.attendanceSummary.present,
      absent: totals.absent + lecture.attendanceSummary.absent,
      late: totals.late + lecture.attendanceSummary.late,
      excused: totals.excused + lecture.attendanceSummary.excused,
    }),
    { present: 0, absent: 0, late: 0, excused: 0 }
  );
}

function downloadWorkbook(archive: Uint8Array, filename: string) {
  const blobBytes = new Uint8Array(archive.length);
  blobBytes.set(archive);
  const blob = new Blob([blobBytes.buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function MetricCard({
  label,
  value,
  icon: Icon,
  detail,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  detail: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-50">{value}</p>
          <p className="mt-0.5 text-[11px] text-neutral-400 dark:text-neutral-500">{detail}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function Reports() {
  const [rangeDays, setRangeDays] = useState(30);
  const range = useMemo(() => getDateRange(rangeDays), [rangeDays]);
  const {
    data: lectures = [],
    isLoading,
    isError,
    refetch,
  } = useLectures(range);

  const totals = useMemo(() => sumStatuses(lectures), [lectures]);
  const totalMarked = totals.present + totals.absent + totals.late + totals.excused;
  const attendanceRate = totalMarked > 0 ? Math.round((totals.present / totalMarked) * 100) : 0;

  const trendData = useMemo(() => {
    const dailyTotals = new Map<string, AttendanceTotals>();
    const start = new Date(`${range.startDate}T12:00:00`);

    for (let day = 0; day < rangeDays; day += 1) {
      const current = new Date(start);
      current.setDate(start.getDate() + day);
      dailyTotals.set(dateKey(current), { present: 0, absent: 0, late: 0, excused: 0 });
    }

    lectures.forEach((lecture) => {
      const daily = dailyTotals.get(lecture.date);
      if (!daily) return;
      daily.present += lecture.attendanceSummary.present;
      daily.absent += lecture.attendanceSummary.absent;
      daily.late += lecture.attendanceSummary.late;
      daily.excused += lecture.attendanceSummary.excused;
    });

    return Array.from(dailyTotals, ([date, dayTotals]) => ({
      date,
      label: new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      ...dayTotals,
    }));
  }, [lectures, range.startDate, rangeDays]);

  const statusData = useMemo(
    () =>
      (Object.keys(STATUS_LABELS) as Array<keyof AttendanceTotals>)
        .map((status) => ({
          name: STATUS_LABELS[status],
          value: totals[status],
          color: STATUS_COLORS[status],
        }))
        .filter((status) => status.value > 0),
    [totals]
  );

  const classData = useMemo(() => {
    const byClass = new Map<string, { name: string; totals: AttendanceTotals }>();
    lectures.forEach((lecture) => {
      const current = byClass.get(lecture.classId) ?? {
        name: lecture.class.name,
        totals: { present: 0, absent: 0, late: 0, excused: 0 },
      };
      current.totals.present += lecture.attendanceSummary.present;
      current.totals.absent += lecture.attendanceSummary.absent;
      current.totals.late += lecture.attendanceSummary.late;
      current.totals.excused += lecture.attendanceSummary.excused;
      byClass.set(lecture.classId, current);
    });

    return Array.from(byClass.values(), ({ name, totals: summary }) => {
      const total = summary.present + summary.absent + summary.late + summary.excused;
      return {
        name,
        attendanceRate: total > 0 ? Math.round((summary.present / total) * 100) : 0,
        present: summary.present,
        absent: summary.absent,
        late: summary.late,
        excused: summary.excused,
        total,
      };
    })
      .filter((classSummary) => classSummary.total > 0)
      .sort((a, b) => b.attendanceRate - a.attendanceRate);
  }, [lectures]);

  const chartEmpty = !isLoading && !isError && totalMarked === 0;

  const handleExport = () => {
    try {
      const dailyRows = trendData.map((day) => {
        const total = day.present + day.absent + day.late + day.excused;
        return [
          day.date,
          day.present,
          day.absent,
          day.late,
          day.excused,
          total,
          total > 0 ? Math.round((day.present / total) * 100) : 0,
        ];
      });
      const statusRows = statusData.map((status) => [
        status.name,
        status.value,
        totalMarked > 0 ? Math.round((status.value / totalMarked) * 100) : 0,
      ]);
      const classRows = classData.map((classSummary) => [
        classSummary.name,
        classSummary.attendanceRate,
        classSummary.present,
        classSummary.absent,
        classSummary.late,
        classSummary.excused,
        classSummary.total,
      ]);

      const workbook = createReportsWorkbook([
        {
          name: "Summary",
          rows: [
            ["Report", "Student Attendance"],
            ["Date range", `${range.startDate} to ${range.endDate}`],
            ["Attendance rate (%)", attendanceRate],
            ["Attendance records", totalMarked],
            ["Lecture sessions", lectures.length],
            ["Classes reporting", classData.length],
          ],
        },
        {
          name: "Daily Attendance",
          rows: [
            ["Date", "Present", "Absent", "Late", "Excused", "Total", "Attendance Rate (%)"],
            ...dailyRows,
          ],
        },
        {
          name: "Status Breakdown",
          rows: [["Status", "Count", "Share (%)"], ...statusRows],
        },
        {
          name: "Class Attendance",
          rows: [
            ["Class", "Attendance Rate (%)", "Present", "Absent", "Late", "Excused", "Total Records"],
            ...classRows,
          ],
        },
      ]);
      downloadWorkbook(workbook, `attendance-reports-${range.startDate}-to-${range.endDate}.xlsx`);
      toast.success("Excel report exported");
    } catch (error) {
      toast.error("Excel export failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Reports
            </h1>
            <span className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
              Attendance
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Review attendance patterns across your lecture sessions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
            <CalendarDays className="h-4 w-4" />
            <span>Date range</span>
            <select
              value={rangeDays}
              onChange={(event) => setRangeDays(Number(event.target.value))}
              aria-label="Report date range"
              className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </label>
          <Button
            type="button"
            variant="outline"
            onClick={handleExport}
            disabled={isLoading || isError}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              Reports could not be loaded
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Please check your connection and try again.
            </p>
            <Button type="button" variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }, (_, index) => (
                <Card key={index}>
                  <CardContent className="space-y-3 p-4">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-7 w-16" />
                    <Skeleton className="h-3 w-28" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <MetricCard
                  label="Attendance rate"
                  value={`${attendanceRate}%`}
                  icon={TrendingUp}
                  detail="Present records"
                />
                <MetricCard
                  label="Attendance records"
                  value={totalMarked.toLocaleString()}
                  icon={Users}
                  detail="Across selected dates"
                />
                <MetricCard
                  label="Lecture sessions"
                  value={lectures.length.toLocaleString()}
                  icon={CalendarDays}
                  detail="Scheduled in this range"
                />
                <MetricCard
                  label="Classes reporting"
                  value={classData.length.toLocaleString()}
                  icon={ClipboardCheck}
                  detail="With attendance recorded"
                />
              </>
            )}
          </div>

          {chartEmpty && (
            <Card>
              <CardContent className="py-10 text-center">
                <BarChart3 className="mx-auto mb-3 h-8 w-8 text-neutral-400" />
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  No attendance records in this period
                </p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Try a longer date range or record attendance for a lecture.
                </p>
              </CardContent>
            </Card>
          )}

          {!chartEmpty && (
            <div className="grid gap-4 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance trend</CardTitle>
                  <CardDescription>Daily student attendance by status</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            minTickGap={24}
                            tick={{ fontSize: 11 }}
                          />
                          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="present" name="Present" stackId="attendance" fill={STATUS_COLORS.present} />
                          <Bar dataKey="absent" name="Absent" stackId="attendance" fill={STATUS_COLORS.absent} />
                          <Bar dataKey="late" name="Late" stackId="attendance" fill={STATUS_COLORS.late} />
                          <Bar dataKey="excused" name="Excused" stackId="attendance" fill={STATUS_COLORS.excused} radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Attendance breakdown</CardTitle>
                  <CardDescription>Distribution of recorded student statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={68}
                            outerRadius={105}
                            paddingAngle={2}
                          >
                            {statusData.map((status) => (
                              <Cell key={status.name} fill={status.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle>Attendance by class</CardTitle>
                  <CardDescription>
                    Present attendance as a percentage of all recorded statuses; showing up to 8 classes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={classData.slice(0, 8)}
                          layout="vertical"
                          margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis
                            type="number"
                            domain={[0, 100]}
                            tickFormatter={(value: number) => `${value}%`}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11 }}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={120}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11 }}
                          />
                          <Tooltip formatter={(value) => [`${value}%`, "Attendance rate"]} />
                          <Bar
                            dataKey="attendanceRate"
                            name="Attendance rate"
                            fill="#6366f1"
                            radius={[0, 4, 4, 0]}
                            barSize={22}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Reports;
