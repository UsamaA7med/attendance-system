import { attendanceRepository } from "../attendance/attendance.repository.js";
import { usersRepository } from "../users/users.repository.js";

export class ReportsService {
  async getOverviewStats(): Promise<{
    totalEmployees: number;
    totalAttendanceLogs: number;
    overallOnTimeRate: string;
    departmentBreakdown: Record<string, { total: number; present: number; late: number }>;
  }> {
    const users = await usersRepository.findAll();
    const records = await attendanceRepository.findAll();

    const presentCount = records.filter((r) => r.status === "present").length;
    const totalLogs = records.length;
    const onTimeRate =
      totalLogs > 0 ? `${((presentCount / totalLogs) * 100).toFixed(1)}%` : "100%";

    const departmentBreakdown: Record<string, { total: number; present: number; late: number }> =
      {};

    for (const record of records) {
      const dept = record.department || "General";
      if (!departmentBreakdown[dept]) {
        departmentBreakdown[dept] = { total: 0, present: 0, late: 0 };
      }
      departmentBreakdown[dept].total += 1;
      if (record.status === "present") departmentBreakdown[dept].present += 1;
      if (record.status === "late") departmentBreakdown[dept].late += 1;
    }

    return {
      totalEmployees: users.length,
      totalAttendanceLogs: totalLogs,
      overallOnTimeRate: onTimeRate,
      departmentBreakdown,
    };
  }
}

export const reportsService = new ReportsService();
