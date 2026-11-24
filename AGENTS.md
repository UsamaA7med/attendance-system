# Attendance System — Agent Context & Architecture Guide

> **Project-Specific Agent Instructions:**
> This file contains the architecture, data models, module structure, and coding conventions specific to the **Attendance System** project.
> Refer to the global context in `~/.gemini/AGENTS.md` for Osama's global developer profile and general engineering standards.

---

## 1. Project Overview & Status

- **Project**: Student Attendance System
- **Repository**: `git@github.com:UsamaA7med/attendance-system.git`
- **Location**: `/home/osama/attendance-system`
- **Purpose**: Full-stack web application designed for educational centers to manage students, classes, recurring schedules, enrollments, and daily attendance sessions.
- **Current Development Status**:
  - **Database & Prisma Schema**: Completed & seeded (`admin`, `staff`, `teacher`, `classes`, `students`).
  - **Authentication & Security**: Completed (Dual-token JWT architecture with 15-minute access tokens and DB-persisted refresh token rotation; role-based access control for `ADMIN`, `STAFF`, `TEACHER`).
  - **Teachers Management (Admin Workflow)**: Completed (Full CRUD RESTful API `/api/teachers` with RBAC and referential constraint protection; Teachers tab & management UI in frontend with create, edit, delete modals, metrics, search, and status filters).
  - **Classes & Lectures Management (Admin Workflow)**: Completed (Full CRUD RESTful APIs for `/api/classes` and `/api/lectures` with admin authorization guards, start time collision detection, and cascade integrity; Classes tab in frontend restricted to Admin with interactive class roster, lecture scheduling by date and unique start time, roll call modal, confirm alert delete workflows, global network indicator, and table skeleton loading states).
  - **UI/UX Refinements & Unified Deletion**: Completed (Shared `ConfirmDeleteModal` and `DeleteIconButton` with unified rose color palette; responsive table layouts with horizontal scrolling and mobile swipe hints; spinner-free disabled action button states; skeleton roll call loading in `TakeAttendanceModal`; expanded main content layout to 1600px).
  - **Frontend Core & Auth Flow**: Completed (Register, Login, Protected Routes, Dashboard Layout, Zustand store).
  - **Vercel Cloud Deployment Setup**: Completed (Unified monorepo configuration with root `vercel.json` and `api/index.js` serverless handler, standalone `client/vercel.json` for SPA rewrites, standalone `server/vercel.json`, and dynamic CORS / cookie handling for production).
  - **Students Management (Staff & Admin Workflow)**: Completed (Full CRUD RESTful API `/api/students` with Zod schema validation, transactional cascade integrity, and staff/admin RBAC; dedicated Students tab & `/students` directory in frontend with live aggregate metrics, search, class filter, create modal with optional enrollment, edit modal, and unified `ConfirmDeleteModal` dialog).
  - **Attendance Flow (Dedicated Roll Call Workflow)**: Completed (Dedicated Attendance tab & `/attendance` page focused strictly on conducting student roll call across lecture sessions, date and class filters, session metrics, quick lecture scheduling, and integrated roll call modal with dynamic on-the-fly student enrollment).
  - **Shared Data Table & Server-Side Pagination**: Completed (Comprehensive pagination infrastructure: backend `ApiResponse.paginated` envelope with `PaginationMeta` across `/api/students`, `/api/teachers`, `/api/classes`, and `/api/lectures`; reusable shadcn-style `Table` primitives in `client/src/components/ui/table.tsx`; reusable `DataTablePagination` and `DataTableContainer` in `client/src/components/common/`; fully wired with server-driven pagination across `Students`, `Teachers`, `Classes`, `LecturesTable`, and `Attendance`).
  - **Teacher Flow (Classes CRUD & Scoped Students View)**: Completed (Role-based teacher experience: teachers are automatically redirected to `/classes` upon login; navigation is scoped strictly to `Classes` and `Students`; full CRUD permissions on their own classes with automatic teacher assignment; scoped lecture scheduling and roll call for their classes; read-only student directory filtered strictly to students enrolled in their classes; strict 403 Forbidden enforcement on student mutations).
  - **Table Performance Optimization & Shared Filters**: Completed (Resolved database query bottlenecks via concurrent `Promise.all` count/fetch execution, `pg.Pool` connection pooling on Neon, and dedicated `/metrics` fast count endpoints; eliminated search thrashing with 300ms debouncing; implemented flicker-free pagination transitions via `keepPreviousData`; optimized `TakeAttendanceModal` with parallel student enrollment and single consolidated toast notification; simplified table pagination to right-aligned basic page controls with default neutral theme; created shared and reusable `DataTableFilterBar` and `FilterSelect` components unifying filters across Students, Teachers, Classes, and Attendance).
  - **Dedicated Lectures Management & Role-Based Navigation Matrix**: Completed (Separated Classes and Lectures into dedicated views; removed Dashboard tab and page with root `/` redirecting to role default views; centralized roll call execution on `/attendance`; aligned sidebar navigation and route guards across all 3 roles: Admin has Attendance, Classes, Lectures, Students, Teachers; Staff has Attendance, Lectures, Students; Teacher has Classes, Lectures, Attendance scoped strictly to their assigned classes, and Students; full CRUD on `/lectures` with EditLectureModal, CreateLectureModal, and DeleteLectureDialog).
  - **Staff Management & Admin-Only Registration**: Completed (Dedicated Staff tab & `/staff` directory in frontend for Admins with create/register modal, edit modal, delete confirmation dialog, aggregate metrics, search, and status filters; full CRUD RESTful API `/api/staff` with RBAC; public `/register` page removed and self-registration replaced with zero-trust Admin-controlled onboarding).
  - **In Progress / Next Tasks**: Reports module and analytics exports.

---

## 2. System Architecture

The project is structured as a decoupled full-stack application:

```
attendance-system/
├── client/          # React 19 + Vite + Tailwind CSS v4 + TypeScript + TanStack Query
└── server/          # Express 5 + TypeScript + Prisma ORM + PostgreSQL
```

### Backend Architecture: Feature-Based Modular Monolith
The server follows a feature-modular layout with clear separation of concerns:
```
server/src/
├── config/                  # Environment variables & runtime configurations
├── core/                    # Shared infrastructure
│   ├── database/            # Prisma client instance & DB connection
│   ├── errors/              # AppError custom error hierarchy
│   ├── middleware/          # authenticate, validate, errorHandler, notFound
│   └── utils/               # api-response, logger
├── modules/                 # Self-contained business domains
│   ├── auth/                # Controller, Service, Repository, Routes, Schema, Types
│   ├── users/               # Controller, Service, Repository, Routes, Schema, Types
│   ├── teachers/            # Controller, Service, Repository, Routes, Schema, Types
│   ├── staff/               # Controller, Service, Repository, Routes, Schema, Types
│   ├── classes/             # Controller, Service, Repository, Routes, Schema, Types
│   ├── lectures/            # Controller, Service, Repository, Routes, Schema, Types
│   ├── students/            # Controller, Service, Repository, Routes, Schema, Types
│   ├── attendance/          # Controller, Service, Repository, Routes, Schema, Types
│   └── reports/             # Controller, Service, Routes
├── app.ts                   # Express application setup & middleware stack
└── server.ts                # Server startup & listener
```

#### Layer Responsibilities:
1. **Routes (`*.routes.ts`)**: Defines endpoints, attaches authentication/authorization guards, and validation middleware.
2. **Controller (`*.controller.ts`)**: Handles HTTP requests, extracts parameters/body, calls services, and returns formatted `ApiResponse`.
3. **Service (`*.service.ts`)**: Executes business rules, authorization checks, and orchestrates repository calls.
4. **Repository (`*.repository.ts`)**: Pure database interaction via Prisma Client.
5. **Schema (`*.schema.ts`)**: Zod validation schemas for request inputs.
6. **Types (`*.types.ts`)**: TypeScript interfaces and DTO definitions.

### Frontend Architecture: Component & Layout Pattern
```
client/src/
├── components/
│   ├── auth/                # ProtectedRoute and PublicRoute navigation guards
│   ├── classes/             # Classes & Lectures modals, tables, rows, filters, metrics
│   ├── common/              # ConfirmDeleteModal, DeleteIconButton, GlobalLoadingIndicator
│   ├── layout/              # DashboardLayout (Sidebar, navigation tabs, header)
│   ├── teachers/            # Teacher modals, tables, rows, filters, metrics
│   └── ui/                  # shadcn/ui & Radix primitives (button, card, input, badge, skeleton)
├── hooks/                   # Custom TanStack Query hooks (useTeachers)
├── lib/                     # Axios instance (api.ts), TanStack queryClient, teachers API, utils
├── pages/                   # Login, Register, Dashboard, Teachers, Records, ApiStatus
├── store/                   # Zustand stores (useAuthStore, useAttendanceStore)
├── App.tsx                  # React Router (v7) route definitions
└── main.tsx                 # Entry point with global styles
```

---

## 3. Database Schema & Data Models

- **Database**: PostgreSQL (Neon Cloud / pooler)
- **ORM**: Prisma ORM with `@prisma/adapter-pg`
- **Primary Keys**: `cuid()` strings
- **Timestamps**: All models include `createdAt` and `updatedAt`

### Roles (Enum: `Role`)
- `ADMIN`: Full system control (manages users, center config, classes, teachers).
- `STAFF`: Onboards students, enrolls them in classes, marks and corrects attendance for any class.
- `TEACHER`: Assigned to specific classes; restricted to viewing their own classes and marking attendance.

### Core Entities & Relations
1. **User (`users`)**:
   - `id`, `name`, `email` (unique), `passwordHash`, `phone`, `role` (`ADMIN` | `STAFF` | `TEACHER`), `isActive`.
   - Has many: `TeacherClasses` (`Class`), `CreatedSessions` (`AttendanceSession`), `MarkedRecords` (`AttendanceRecord`), `refreshTokens` (`RefreshToken`).
2. **RefreshToken (`refresh_tokens`)**:
   - `id`, `token` (unique), `userId` (`User` - Cascade delete), `expiresAt`, `isRevoked`.
3. **Student (`students`)**:
   - `id`, `fullName`, `phone`, `parentName`, `parentPhone`, `notes`, `isActive`, `enrollmentDate`.
   - Has many: `enrollments` (`Enrollment`), `attendanceRecords` (`AttendanceRecord`).
4. **Class (`classes`)**:
   - `id`, `name`, `description`, `room`, `isActive`, `teacherId` (`User` - Restrict delete).
   - Has many: `lectures` (`Lecture`), `enrollments` (`Enrollment`).
5. **Enrollment (`enrollments`)**:
   - `studentId` (`Student` - Cascade delete), `classId` (`Class` - Cascade delete), `enrolledAt`, `status` (`ACTIVE` | `DROPPED`).
   - Unique compound key: `[studentId, classId]`.
6. **Lecture (`lectures`)**:
   - `id`, `classId` (`Class` - Cascade delete), `date` (Date), `startTime` (String "HH:mm"), `createdById` (`User` - Restrict delete), `notes`.
   - Unique compound key: `[classId, date, startTime]`.
7. **Attendance (`attendances`)**:
   - `id`, `lectureId` (`Lecture` - Cascade delete), `studentId` (`Student` - Restrict delete), `status` (`PRESENT` | `ABSENT` | `LATE` | `EXCUSED`), `markedById` (`User`), `note`, `markedAt`.
   - Unique compound key: `[lectureId, studentId]`.

---

## 4. Authentication & Security Flow

1. **Registration (Admin Only)**:
   - Route `/api/staff` or `/api/auth/register` restricted exclusively to `ADMIN`.
   - Public self-registration page removed. All staff and teacher credentials are provisioned by center administrators.
   - Passwords hashed with `bcryptjs`.
2. **Login**:
   - Route `/api/auth/login`.
   - Validates credentials and generates a token pair:
     - Access Token: JWT containing `{ userId, email, role }`, valid for 15 minutes. Set in HTTP cookie or Bearer header.
     - Refresh Token: Persisted in `RefreshToken` table, valid for 7 days.
3. **Token Refresh (Rotation)**:
   - Route `/api/auth/refresh`.
   - Validates incoming refresh token against DB. If valid and not revoked, revokes current token, issues a brand new access token and refresh token (refresh token rotation).
4. **Logout**:
   - Route `/api/auth/logout`.
   - Revokes refresh token in database and clears auth cookies.
5. **Route Protection (Client)**:
   - Unauthorized users are restricted strictly to `/login` (all other routes redirect to login).
   - Authenticated users access their role-authorized dashboard views within `DashboardLayout`.

---

## 5. Development & Operational Commands

### Backend (`/server`)
```bash
# Run in development with hot reload
npm run dev

# Run database seed
npm run db:seed

# Typecheck backend
npm run typecheck

# Build for production
npm run build
```

### Frontend (`/client`)
```bash
# Run client dev server
npm run dev

# Build client
npm run build

# Lint client
npm run lint
```

---

## 6. Project Rules for AI Agents

1. **Follow the Feature-Based Layout**: When creating or expanding an entity, place routes, controllers, services, repositories, schemas, and types inside `src/modules/<feature>/`. Do not mix business logic into controllers.
2. **Maintain Referential Integrity**: When modifying Prisma schemas, respect existing onDelete rules (`Cascade` for child records, `Restrict` for core parent entities).
3. **Keep Seed Data Aligned**: If modifying schema models, always update `server/prisma/seed.ts` to ensure fresh environments can seed without errors.
4. **No Secrets in Code**: Never hardcode database connection strings, JWT secrets, or credentials. Use `server/src/config/env.ts` with `.env`.
5. **Sync API Contracts**: Any change in backend response shape or DTOs must be updated in `client/src/lib/api.ts` and the corresponding Zustand store.
