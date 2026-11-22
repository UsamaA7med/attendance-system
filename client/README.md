# Attendance System - Client Application

React + Vite + TypeScript frontend application configured with Tailwind CSS v4, shadcn/ui, React Router, Zustand, and Axios.

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite`
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives + Lucide icons)
- **Routing**: [React Router](https://reactrouter.com/) (v7)
- **State Management**: [Zustand](https://zustand.docs.pmnd.rs/) with LocalStorage persistence
- **HTTP Client**: [Axios](https://axios-http.com/) configured with interceptors and base URL

## 📁 Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── Navbar.tsx         # Navigation header with active links & status
│   │   └── ui/                    # shadcn/ui components (button, card, input, badge)
│   ├── lib/
│   │   ├── api.ts                 # Configured Axios instance with interceptors
│   │   └── utils.ts               # Class merging utilities (cn)
│   ├── pages/
│   │   ├── Dashboard.tsx          # Metric cards and quick check-in actions
│   │   ├── Records.tsx            # Attendance log table with instant search
│   │   └── ApiStatus.tsx          # Axios API integration test & status view
│   ├── store/
│   │   └── useAttendanceStore.ts  # Zustand store for attendance state
│   ├── App.tsx                    # React Router configuration
│   ├── index.css                  # Tailwind CSS v4 theme and shadcn tokens
│   └── main.tsx                   # Application entry point
├── components.json                # shadcn/ui CLI configuration
├── vite.config.ts                 # Vite setup with Tailwind v4 & path aliases
└── tsconfig.app.json              # TypeScript configuration
```

## 🛠️ Available Scripts

- `npm run dev` - Start local development server
- `npm run build` - Type check and compile production bundle
- `npm run lint` - Run ESLint code quality checks
- `npm run preview` - Preview production build locally

## 🧩 Adding More shadcn/ui Components

```bash
npx shadcn add <component-name>
```
