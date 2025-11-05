# AttendanceMate

## Overview

AttendanceMate is a smart personal attendance tracking application designed for students to manage lecture attendance, view analytics, and generate reports. The application provides a clean, dashboard-centric interface for recording attendance across subjects, visualizing attendance patterns through charts, and exporting data to PDF and Excel formats.

The application is built as a full-stack web application with a modern React frontend and Express backend, using PostgreSQL for data persistence. It emphasizes visual data presentation with donut charts, attendance breakdowns, and comprehensive reporting capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query (React Query) for server state management and data fetching
- Recharts for data visualization (pie charts, bar charts, line charts)

**UI Framework:**
- Shadcn/ui component library based on Radix UI primitives
- Tailwind CSS for styling with a custom design system
- Design philosophy: Clean card-based architecture inspired by Notion and Linear
- Typography: Inter/Manrope font families for modern, readable interface
- Color scheme: Teal accent colors with neutral base palette
- Responsive layout system with mobile-first approach

**Component Structure:**
- Page components for major routes (Dashboard, Calendar, Subjects, Reports, Settings)
- Reusable UI components (StatCard, SubjectCard, AttendanceChart, UpcomingLectureCard)
- App-level components (AppSidebar, ThemeToggle)
- Form handling with React Hook Form and Zod validation

**State Management:**
- TanStack Query for server data caching and synchronization
- React hooks for local component state
- No global state management library (Redux/Zustand) - relies on React Query cache
- Custom hooks pattern for data operations (useSubjects, useLectures, useStatistics)

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for type-safe server code
- RESTful API design pattern
- In-memory storage with MemStorage class (development/demo mode)
- Prepared for database integration via storage interface

**API Structure:**
- `/api/subjects` - CRUD operations for subject management
- `/api/lectures` - CRUD operations for lecture scheduling and attendance
- `/api/statistics` - Aggregated attendance analytics

**Database Schema (Drizzle ORM):**
- `subjects` table: Subject information (name, code, teacher, color coding)
- `lectures` table: Lecture scheduling with attendance status tracking
- PostgreSQL as the target database (configured via Neon serverless driver)
- Migration support through Drizzle Kit

**Storage Interface Pattern:**
- IStorage interface defines contract for all data operations
- MemStorage provides in-memory implementation for development
- Database storage can be swapped in by implementing IStorage interface
- Abstraction allows testing without database dependency

### Data Models

**Subject Entity:**
- Unique ID, name, course code, teacher name
- Color property for visual categorization in UI
- Relationship: One subject has many lectures

**Lecture Entity:**
- Unique ID, subject reference, title
- Scheduling: date, start time, end time
- Attendance tracking: status (Present/Absent/Late/Excused), notes
- Optional notes field for additional context

**Attendance Status Types:**
- Present (green indicator)
- Absent (red indicator)
- Late (yellow indicator)
- Excused (blue indicator)

### Design System

**Card-Based Layout:**
- All major UI components contained in distinct cards with subtle shadows
- Consistent padding (p-6 to p-8) across cards
- Hover elevation effects for interactive elements
- Border-left accent on subject cards matching subject color

**Spacing System:**
- Tailwind spacing units: 2, 4, 6, 8, 12, 16 for consistent rhythm
- Grid layouts with gap-6 for section separation
- Responsive margins: mx-4 md:mx-8 lg:mx-12
- Max container width: max-w-7xl for large screens

**Typography Hierarchy:**
- Page titles: text-2xl/text-3xl, font-semibold
- Card headers: text-lg, font-semibold
- Stat numbers: text-4xl, font-bold
- Body text: text-sm/text-base
- Metadata labels: text-xs, font-medium, uppercase

**Theme Support:**
- Light and dark mode with CSS custom properties
- Theme toggle component persists preference to localStorage
- Color variables defined in index.css with HSL values
- Automatic border computation for buttons using CSS variables

### External Dependencies

**UI Component Libraries:**
- @radix-ui/* - Headless UI primitives for accessible components (20+ packages)
- shadcn/ui - Pre-built component implementations
- lucide-react - Icon library
- recharts - Chart visualization library
- embla-carousel-react - Carousel functionality

**Form Management:**
- react-hook-form - Form state and validation
- @hookform/resolvers - Validation resolver integration
- zod - Schema validation library
- drizzle-zod - Bridge between Drizzle ORM and Zod schemas

**Data Fetching:**
- @tanstack/react-query - Server state management
- Built-in fetch API for HTTP requests

**Database & ORM:**
- drizzle-orm - TypeScript ORM for SQL databases
- drizzle-kit - Migration and schema management tools
- @neondatabase/serverless - PostgreSQL driver for Neon database
- PostgreSQL as the production database

**Styling:**
- tailwindcss - Utility-first CSS framework
- tailwind-merge - Utility for merging Tailwind classes
- clsx - Conditional className utility
- class-variance-authority - Type-safe variant API

**Development Tools:**
- vite - Build tool and dev server
- @vitejs/plugin-react - React support for Vite
- typescript - Type checking
- tsx - TypeScript execution engine
- esbuild - Production bundling

**Replit-Specific Integrations:**
- @replit/vite-plugin-runtime-error-modal - Error overlay
- @replit/vite-plugin-cartographer - Code navigation (development only)
- @replit/vite-plugin-dev-banner - Development indicator (development only)

**Date & Time:**
- date-fns - Date manipulation and formatting library

**Routing:**
- wouter - Lightweight client-side routing

**Session Management:**
- express-session (implied by connect-pg-simple dependency)
- connect-pg-simple - PostgreSQL session store for Express