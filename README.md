# attendance-system

A full-stack staff attendance tracking system built with a modern React frontend and a Feature-Based Modular Monolith Express backend.

## 🏗️ Architecture & Tech Stack

### Client (`/client`)
- **Framework**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State Management**: Zustand
- **Routing**: React Router (v7)
- **HTTP Client**: Axios

### Server (`/server`)
- **Architecture**: Feature-Based Modular Monolith (Auth, Users, Attendance, Reports)
- **Framework**: Express 5 + TypeScript (NodeNext)
- **Validation**: Zod
- **Security & Auth**: JWT + bcryptjs + Helmet + CORS
- **ORM & Database**: Prisma ORM with PostgreSQL

## 🚀 Getting Started

### 1. Backend Server Setup
```bash
cd server
npm install
npm run dev
```

### 2. Frontend Client Setup
```bash
cd client
npm install
npm run dev
```
