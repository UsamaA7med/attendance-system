import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AttendanceRecord {
  id: string;
  employeeName: string;
  role: string;
  checkIn: string;
  checkOut?: string;
  status: "present" | "late" | "absent";
}

interface AttendanceState {
  records: AttendanceRecord[];
  isCheckedIn: boolean;
  lastCheckInTime: string | null;
  checkIn: (employeeName: string, role: string) => void;
  checkOut: () => void;
  addRecord: (record: AttendanceRecord) => void;
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set) => ({
      records: [
        {
          id: "rec-1",
          employeeName: "Osama",
          role: "Software Engineer",
          checkIn: "09:02 AM",
          checkOut: "05:15 PM",
          status: "present",
        },
        {
          id: "rec-2",
          employeeName: "Sarah Jenkins",
          role: "Product Designer",
          checkIn: "09:45 AM",
          checkOut: "05:30 PM",
          status: "late",
        },
        {
          id: "rec-3",
          employeeName: "Alex Rivera",
          role: "DevOps Engineer",
          checkIn: "08:55 AM",
          status: "present",
        },
      ],
      isCheckedIn: false,
      lastCheckInTime: null,
      checkIn: (employeeName: string, role: string) => {
        const timeStr = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const newRecord: AttendanceRecord = {
          id: `rec-${Date.now()}`,
          employeeName,
          role,
          checkIn: timeStr,
          status: "present",
        };
        set((state) => ({
          isCheckedIn: true,
          lastCheckInTime: timeStr,
          records: [newRecord, ...state.records],
        }));
      },
      checkOut: () => {
        const timeStr = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        set((state) => {
          const updated = [...state.records];
          if (updated.length > 0 && !updated[0].checkOut) {
            updated[0] = { ...updated[0], checkOut: timeStr };
          }
          return {
            isCheckedIn: false,
            records: updated,
          };
        });
      },
      addRecord: (record: AttendanceRecord) =>
        set((state) => ({ records: [record, ...state.records] })),
    }),
    {
      name: "attendance-storage",
    }
  )
);
