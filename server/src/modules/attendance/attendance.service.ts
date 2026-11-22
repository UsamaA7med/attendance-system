import { attendanceRepository } from "./attendance.repository.js";
import { usersRepository } from "../users/users.repository.js";
import { CheckInDto, CheckOutDto, AttendanceQueryDto } from "./attendance.schema.js";
import { BadRequestError, NotFoundError } from "../../core/errors/app-error.js";
import { AttendanceRecord } from "./attendance.types.js";

export class AttendanceService {
  async checkIn(userId: string, dto: CheckInDto): Promise<AttendanceRecord> {
    const today = new Date().toISOString().split("T")[0];
    const active = await attendanceRepository.findActiveByUser(userId, today);
    if (active) {
      throw new BadRequestError("You already have an active check-in session for today");
    }

    const user = await usersRepository.findById(userId);
    const employeeName = dto.employeeName || user?.name || "Staff Member";
    const department = dto.department || user?.department || "General";
    const role = dto.role || user?.position || "Staff";

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Business rule: Check-in past 09:15 AM is considered late
    const cutoffMinutes = 9 * 60 + 15;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const status: "present" | "late" = currentMinutes > cutoffMinutes ? "late" : "present";

    return attendanceRepository.create({
      userId,
      employeeName,
      department,
      role,
      date: today,
      checkIn: timeStr,
      status,
      note: dto.note,
    });
  }

  async checkOut(userId: string, dto: CheckOutDto): Promise<AttendanceRecord> {
    const today = new Date().toISOString().split("T")[0];
    const active = await attendanceRepository.findActiveByUser(userId, today);
    if (!active) {
      throw new BadRequestError("No active check-in session found to check out from");
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Calculate approximate duration in minutes
    const createdTime = new Date(active.createdAt).getTime();
    const diffMinutes = Math.max(1, Math.round((now.getTime() - createdTime) / 60000));

    const updated = await attendanceRepository.update(active.id, {
      checkOut: timeStr,
      durationMinutes: diffMinutes,
      note: dto.note || active.note,
    });

    if (!updated) {
      throw new NotFoundError("Attendance record not found");
    }

    return updated;
  }

  async getRecords(query: AttendanceQueryDto): Promise<AttendanceRecord[]> {
    return attendanceRepository.findAll(query);
  }

  async getRecordById(id: string): Promise<AttendanceRecord> {
    const record = await attendanceRepository.findById(id);
    if (!record) {
      throw new NotFoundError(`Attendance record with id '${id}' not found`);
    }
    return record;
  }

  async getTodaySummary(): Promise<{
    date: string;
    total: number;
    present: number;
    late: number;
    activeSessions: number;
  }> {
    const today = new Date().toISOString().split("T")[0];
    const records = await attendanceRepository.findAll({ date: today });

    const present = records.filter((r) => r.status === "present").length;
    const late = records.filter((r) => r.status === "late").length;
    const activeSessions = records.filter((r) => !r.checkOut).length;

    return {
      date: today,
      total: records.length,
      present,
      late,
      activeSessions,
    };
  }
}

export const attendanceService = new AttendanceService();
