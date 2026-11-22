import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAttendanceStore } from "@/store/useAttendanceStore";
import { Search } from "lucide-react";

export function Records() {
  const { records } = useAttendanceStore();
  const [query, setQuery] = useState("");

  const filtered = records.filter(
    (r) =>
      r.employeeName.toLowerCase().includes(query.toLowerCase()) ||
      r.role.toLowerCase().includes(query.toLowerCase()) ||
      r.status.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Attendance Records
        </h1>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">
          Browse, filter, and inspect staff logs stored in Zustand.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Filter by name, role, or status..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-neutral-50/50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800">
          <CardTitle className="text-base">All Logged Records ({filtered.length})</CardTitle>
          <CardDescription>Real-time data synced with client local storage</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-100/50 dark:bg-neutral-900/50 text-neutral-600 dark:text-neutral-400 text-xs uppercase font-semibold border-b border-neutral-100 dark:border-neutral-800">
                <tr>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Check-In</th>
                  <th className="px-6 py-3">Check-Out</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filtered.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100">
                      {record.employeeName}
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                      {record.role}
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400 font-mono text-xs">
                      {record.checkIn}
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400 font-mono text-xs">
                      {record.checkOut || (
                        <span className="text-emerald-600 dark:text-emerald-400 font-sans font-medium">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={record.status === "present" ? "default" : "secondary"}
                        className="capitalize text-xs"
                      >
                        {record.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-neutral-500">
                      No records match "{query}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
