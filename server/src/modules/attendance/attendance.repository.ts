import { AttendanceRecord, CreateAttendanceData } from "./attendance.types.js";

class AttendanceRepository {
  private records: Map<string, AttendanceRecord> = new Map();

  async findAll(filters?: {
    userId?: string;
    date?: string;
    status?: string;
    department?: string;
  }): Promise<AttendanceRecord[]> {
    let list = Array.from(this.records.values());

    if (filters?.userId) {
      list = list.filter((r) => r.userId === filters.userId);
    }
    if (filters?.date) {
      list = list.filter((r) => r.date === filters.date);
    }
    if (filters?.status) {
      list = list.filter((r) => r.status === filters.status);
    }
    if (filters?.department) {
      list = list.filter(
        (r) => r.department.toLowerCase() === filters.department?.toLowerCase()
      );
    }

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async findById(id: string): Promise<AttendanceRecord | null> {
    return this.records.get(id) || null;
  }

  async findActiveByUser(userId: string, date: string): Promise<AttendanceRecord | null> {
    for (const record of this.records.values()) {
      if (record.userId === userId && record.date === date && !record.checkOut) {
        return record;
      }
    }
    return null;
  }

  async create(data: CreateAttendanceData): Promise<AttendanceRecord> {
    const id = `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const record: AttendanceRecord = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    this.records.set(id, record);
    return record;
  }

  async update(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | null> {
    const record = this.records.get(id);
    if (!record) return null;
    const updated = { ...record, ...updates };
    this.records.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.records.delete(id);
  }
}

export const attendanceRepository = new AttendanceRepository();
