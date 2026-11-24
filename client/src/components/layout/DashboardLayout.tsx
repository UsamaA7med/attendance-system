import { useState } from "react";
import { NavLink, useLocation, useNavigate, Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CalendarCheck,
  CalendarDays,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  Users,
  ShieldCheck,
  Menu,
  X,
  LogOut,
} from "lucide-react";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuthStore();
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isTeacher = user?.role?.toLowerCase() === "teacher";

  // Redirect root path (/) to appropriate landing view
  if (location.pathname === "/") {
    return <Navigate to={isTeacher ? "/classes" : "/attendance"} replace />;
  }

  const navItems = isTeacher
    ? [
        {
          title: "Classes",
          path: "/classes",
          icon: BookOpen,
          badge: null,
        },
        {
          title: "Lectures",
          path: "/lectures",
          icon: CalendarDays,
          badge: null,
        },
        {
          title: "Attendance",
          path: "/attendance",
          icon: ClipboardCheck,
          badge: null,
        },
        {
          title: "Students",
          path: "/students",
          icon: Users,
          badge: null,
        },
      ]
    : isAdmin
    ? [
        {
          title: "Attendance",
          path: "/attendance",
          icon: ClipboardCheck,
          badge: null,
        },
        {
          title: "Classes",
          path: "/classes",
          icon: BookOpen,
          badge: null,
        },
        {
          title: "Lectures",
          path: "/lectures",
          icon: CalendarDays,
          badge: null,
        },
        {
          title: "Students",
          path: "/students",
          icon: Users,
          badge: null,
        },
        {
          title: "Teachers",
          path: "/teachers",
          icon: GraduationCap,
          badge: null,
        },
        {
          title: "Staff",
          path: "/staff",
          icon: ShieldCheck,
          badge: null,
        },
      ]
    : [
        {
          title: "Attendance",
          path: "/attendance",
          icon: ClipboardCheck,
          badge: null,
        },
        {
          title: "Lectures",
          path: "/lectures",
          icon: CalendarDays,
          badge: null,
        },
        {
          title: "Students",
          path: "/students",
          icon: Users,
          badge: null,
        },
      ];

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/attendance":
        return isTeacher ? "My Class Attendance" : "Student Attendance";
      case "/students":
        return isTeacher ? "My Students" : "Students Directory";
      case "/classes":
        return isTeacher ? "My Classes" : "Classes";
      case "/lectures":
        return isTeacher ? "My Lectures" : "Lectures";
      case "/teachers":
        return "Teachers Management";
      case "/staff":
        return "Staff Management";
      default:
        return "Attendance Hub";
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully", {
      description: "You have been logged out. Redirecting to login.",
    });
    navigate("/login", { replace: true });
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? "bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-neutral-900"
        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800/60"
    }`;

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4">
      {/* Brand & Navigation */}
      <div className="space-y-6">
        {/* Logo & Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white shadow dark:bg-white dark:text-neutral-900">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-neutral-900 dark:text-neutral-50">
              Attendance Hub
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Educational Center Portal
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="space-y-1">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Navigation
          </p>

          <nav className="space-y-1 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={navLinkClasses}
                  end={item.path === "/"}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`ml-2 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${
                        location.pathname === item.path
                          ? "bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-900"
                          : "bg-neutral-200/80 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        {/* User Card & Logout Button */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 px-1 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-bold uppercase">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                {user?.name || "Staff Member"}
              </p>
              <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                {user?.email || ""}
              </p>
            </div>
            {user?.role && (
              <Badge variant="outline" className="text-[10px] font-bold uppercase shrink-0">
                {user.role}
              </Badge>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white p-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 flex flex-col md:flex-row font-sans">
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        {sidebarContent}
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/95 px-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            aria-label="Open sidebar navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 font-bold text-base">
            <CalendarCheck className="h-5 w-5" />
            <span>Attendance Hub</span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-neutral-950/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-72 max-w-[80vw] flex-1 flex-col bg-white dark:bg-neutral-950 shadow-2xl z-10">
            <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <span className="font-semibold text-sm">Navigation Menu</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                aria-label="Close sidebar navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* Desktop Top Status Bar */}
        <header className="hidden md:flex h-16 items-center justify-between border-b border-neutral-200 bg-white/80 px-8 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80 sticky top-0 z-20">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {getPageTitle()}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Attendance System Dashboard & Operational Controls
            </p>
          </div>
        </header>

        {/* Route Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto min-w-0">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
