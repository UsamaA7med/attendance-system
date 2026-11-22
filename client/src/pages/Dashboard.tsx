import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAttendanceStore } from "@/store/useAttendanceStore";
import { CheckCircle2, Clock, Users, ArrowUpRight, LogIn, LogOut } from "lucide-react";

export function Dashboard() {
  const { records, isCheckedIn, lastCheckInTime, checkIn, checkOut } = useAttendanceStore();
  const [name, setName] = useState("Osama");
  const [role, setRole] = useState("Software Engineer");

  const total = records.length;
  const presentCount = records.filter((r) => r.status === "present").length;
  const lateCount = records.filter((r) => r.status === "late").length;

  const handleAction = () => {
    if (isCheckedIn) {
      checkOut();
    } else {
      if (name.trim()) {
        checkIn(name, role);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Attendance Dashboard
        </h1>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">
          Powered by React 19, Vite, Tailwind CSS 4, shadcn/ui, Zustand, & React Router.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Total Logged Today
            </CardTitle>
            <Users className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{total}</div>
            <p className="text-xs text-neutral-500 mt-1">Live from Zustand state store</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              On-Time Check-ins
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {presentCount}
            </div>
            <p className="text-xs text-neutral-500 mt-1">Status marked as present</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Late Check-ins
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {lateCount}
            </div>
            <p className="text-xs text-neutral-500 mt-1">Checked in after 09:15 AM</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Action Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Quick Attendance Action</CardTitle>
            <CardDescription>
              Toggle check-in / check-out state stored globally with Zustand.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Staff Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter staff name..."
                disabled={isCheckedIn}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Role / Department
              </label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Software Engineer"
                disabled={isCheckedIn}
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button
                onClick={handleAction}
                variant={isCheckedIn ? "destructive" : "default"}
                className="w-full gap-2 py-5 font-semibold"
              >
                {isCheckedIn ? (
                  <>
                    <LogOut className="h-4 w-4" />
                    Check Out Now
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Check In Now
                  </>
                )}
              </Button>
            </div>

            {isCheckedIn && lastCheckInTime && (
              <p className="text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Active session started at {lastCheckInTime}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest attendance logs</CardDescription>
            </div>
            <ArrowUpRight className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {records.slice(0, 4).map((record) => (
                <div key={record.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {record.employeeName}
                    </p>
                    <p className="text-xs text-neutral-500">{record.role}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div className="text-xs text-neutral-500">
                      <span>{record.checkIn}</span>
                      {record.checkOut && <span> - {record.checkOut}</span>}
                    </div>
                    <Badge
                      variant={record.status === "present" ? "default" : "secondary"}
                      className="capitalize text-[11px]"
                    >
                      {record.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
