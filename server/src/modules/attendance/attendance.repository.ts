import { AttendanceRecord, CreateAttendanceData } from "./attendance.types.js";

class AttendanceRepository {
  private records: Map<string, AttendanceRecord> = new Map();

  constructor() {
    this.seedDefaultRecords();
  }

  private seedDefaultRecords() {
    const today = new Date().toISOString().split("T")[0];
    const defaults: AttendanceRecord[] = [
      {
        id: "att-1",
        userId: "usr-1",
        employeeName: "Osama Admin",
        department: "Engineering",
        role: "Software Engineer",
        date: today,
        checkIn: "09:02 AM",
        checkOut: "05:15 PM",
        durationMinutes: 493,
        status: "present",
        createdAt: new Date().toISOString(),
      },
      {
        id: "att-2",
        userId: "usr-2",
        employeeName: "Sarah Jenkins",
        department: "Design",
        role: "Product Designer",
        date: today,
        checkIn: "09:45 AM",
        checkOut: "05:30 PM",
        durationMinutes: 465,
        status: "late",
        createdAt: new Date().toISOString(),
      },
      {
        id: "att-3",
        userId: "usr-3",
        employeeName: "Alex Rivera",
        department: "DevOps",
        role: "DevOps Engineer",
        date: today,
        checkIn: "08:55 AM",
        status: "present",
        createdAt: new Date().toISOString(),
      },
    ];

    defaults.forEach((r) => this.records.set(r.id, r));
  }

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
