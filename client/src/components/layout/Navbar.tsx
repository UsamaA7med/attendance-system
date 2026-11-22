import { NavLink } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useAttendanceStore } from "@/store/useAttendanceStore";
import { CalendarCheck, LayoutDashboard, ListFilter, Network } from "lucide-react";

export function Navbar() {
  const { isCheckedIn } = useAttendanceStore();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-sm"
        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <span>Attendance Hub</span>
          </div>

          <nav className="flex items-center gap-1">
            <NavLink to="/" className={navLinkClass}>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink to="/records" className={navLinkClass}>
              <ListFilter className="h-4 w-4" />
              Records
            </NavLink>
            <NavLink to="/api-status" className={navLinkClass}>
              <Network className="h-4 w-4" />
              Axios & API
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant={isCheckedIn ? "default" : "secondary"}
            className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider"
          >
            {isCheckedIn ? "● Checked In" : "○ Checked Out"}
          </Badge>
        </div>
      </div>
    </header>
  );
}
