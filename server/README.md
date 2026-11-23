# Attendance System - Server Application

Express backend built using the **Feature-Based Modular Monolith Architecture** with TypeScript, Zod, and JWT authentication.

## 🏛️ Architecture Overview: Feature-Based Modular Monolith

Unlike traditional horizontal layer-based structures (where all controllers, routes, or models are lumped together), this application organizes code into **high-cohesion, low-coupling feature modules** based on domain boundaries:

```
server/
├── src/
│   ├── app.ts                         # Express app assembly & global middleware
│   ├── server.ts                      # Server bootstrap & graceful shutdown
│   ├── config/                        # Global typed environment configuration (Zod)
│   │   └── env.ts
│   ├── core/                          # Cross-cutting infrastructure & shared utilities
│   │   ├── errors/                    # Standardized AppError hierarchy
│   │   │   └── app-error.ts
│   │   ├── middleware/                # Global middlewares (error, notFound, validate, auth)
│   │   │   ├── authenticate.ts
│   │   │   ├── error-handler.ts
│   │   │   ├── not-found.ts
│   │   │   └── validate.ts
│   │   └── utils/
│   │       ├── api-response.ts        # Consistent API response envelope
│   │       └── logger.ts              # Centralized logging
│   └── modules/                       # Domain / Feature Modules
│       ├── auth/                      # Authentication (Login, Register, Token generation)
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── auth.routes.ts
│       │   ├── auth.schema.ts
│       │   └── index.ts
│       ├── users/                     # Users / Employees Domain
│       │   ├── users.controller.ts
│       │   ├── users.service.ts
│       │   ├── users.repository.ts
│       │   ├── users.routes.ts
│       │   ├── users.schema.ts
│       │   ├── users.types.ts
│       │   └── index.ts
│       ├── attendance/                # Attendance Tracking Domain
│       │   ├── attendance.controller.ts
│       │   ├── attendance.service.ts
│       │   ├── attendance.repository.ts
│       │   ├── attendance.routes.ts
│       │   ├── attendance.schema.ts
│       │   ├── attendance.types.ts
│       │   └── index.ts
│       └── reports/                   # Reporting & Analytics Domain
│           ├── reports.controller.ts
│           ├── reports.service.ts
│           ├── reports.routes.ts
│           └── index.ts
├── tsconfig.json
├── package.json
└── .env
```

### 🧩 Module Encapsulation Rule
Each module owns its routes, controller, business service, repository, and validation schemas. It exposes a public contract through `index.ts` (router, public services, types), preventing deep internal coupling across features.

---

## 📦 Installed Dependencies

- **Framework**: `express`
- **Security & Utilities**: `cors`, `helmet`, `morgan`, `compression`, `cookie-parser`, `dotenv`
- **Validation**: `zod`
- **Auth & Security**: `jsonwebtoken`, `bcryptjs`
- **TypeScript & Tooling**: `typescript`, `tsx` (hot-reloader), `rimraf`, `@types/*`

---

## 📡 API Endpoints

### 1. General & System
- `GET /health` - Service health status
- `GET /api` - API metadata & feature directory

### 2. Authentication (`/api/auth`)
- `POST /api/auth/login` - Authenticate staff/admin & receive JWT token
- `POST /api/auth/register` - Register a new staff profile
- `GET /api/auth/me` - Get authenticated user profile *(Requires Bearer Token)*

### 3. Attendance (`/api/attendance`)
- `GET /api/attendance` - Query records (filters: `userId`, `date`, `status`, `department`)
- `GET /api/attendance/summary/today` - Real-time statistics for today
- `GET /api/attendance/:id` - Fetch single record by ID
- `POST /api/attendance/check-in` - Log check-in (auto detects on-time vs late)
- `POST /api/attendance/check-out` - Complete session and compute duration

### 4. Users (`/api/users`)
- `GET /api/users` - List all staff *(Requires Auth)*
- `GET /api/users/:id` - Fetch staff profile *(Requires Auth)*
- `POST /api/users` - Create user *(Admin only)*
- `PATCH /api/users/:id` - Update user *(Admin only)*
- `DELETE /api/users/:id` - Remove user *(Admin only)*

### 5. Reports (`/api/reports`)
- `GET /api/reports/overview` - Department breakdown and attendance rates *(Requires Auth)*

---

## 🛠️ Scripts & Commands

```bash
cd /home/osama/attendance-system/server

# Start development server with live reload
npm run dev

# Check TypeScript types
npm run typecheck

# Build for production
npm run build

# Start production server
npm start
```
