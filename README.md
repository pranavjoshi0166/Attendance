# AttendanceMate

A complete personal attendance tracker web application with a smooth, modern, mobile-responsive UI.

## Features

### 🎯 Core Features

1. **Subjects / Weekly Schedule**
   - Add subjects with name, code, color, and teacher
   - Define fixed weekly lecture schedules (e.g., Mon 9am-10am: DBMS)
   - Auto-generate lectures for each week from schedules

2. **Calendar View**
   - Month view calendar with color-coded date tiles:
     - **Green** = attended all lectures that day
     - **Red** = missed one or more lectures that day
     - **Gray** = future or not yet marked
   - Click any date to view and mark attendance for that day's lectures
   - Smooth scrolling and transitions
   - Fully responsive for mobile & desktop

3. **Attendance Marking**
   - Mark lectures as: **Present / Absent / Late / Excused**
   - Auto-update calendar date colors immediately
   - Edit past attendance records

4. **Dashboard**
   - Personalized greeting: "Good Morning, Pranav 👋"
   - **Line Chart**: Attendance trends over weeks (Attended vs Missed)
   - **Summary Cards**: Overall Attendance %, Total Attended, Total Missed
   - **Pie Chart**: Breakdown of Present / Absent / Late / Excused
   - Clean, non-scroll-breaking layout

5. **Reports & Export**
   - Date range picker for custom reports
   - Table view: Date | Subject | Lecture | Status | Notes
   - **PDF Export**: Includes charts and summary statistics
   - **Excel Export**: Multi-sheet workbook with data and summary

6. **Settings**
   - Dark/Light Mode toggle
   - Attendance threshold alerts (warn if below set %)
   - Backup/Export all data as JSON
   - Import data from JSON backup
   - Reset all data option (with confirmation)

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **UI Components**: Radix UI + shadcn/ui
- **Data Persistence**: In-memory storage (can be extended to database)
- **Export**: jsPDF, html2canvas, SheetJS (xlsx)
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
   ```bash
   cd ImageAnalysisAI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to:
   ```
   http://localhost:5000
   ```

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
ImageAnalysisAI/
├── client/              # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utility functions
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   └── storage.ts      # Data storage layer
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schemas
└── package.json         # Dependencies and scripts
```

## Usage Guide

### 1. Add Subjects

1. Navigate to **Subjects** page
2. Click **Add Subject**
3. Fill in:
   - Subject Name (e.g., "Data Structures")
   - Subject Code (e.g., "CS201")
   - Instructor Name
   - Color (for visual identification)

### 2. Create Weekly Schedules

1. In **Subjects** page, go to **Weekly Schedules** tab
2. Select a subject and click **Add Schedule**
3. Set:
   - Day of week (Monday-Sunday)
   - Start time and end time
   - Lecture title

### 3. Generate Lectures

1. Go to **Calendar** page
2. Click **Generate Lectures** button
3. Lectures will be auto-generated for the next 90 days based on your weekly schedules

### 4. Mark Attendance

1. Click any date on the calendar
2. A dialog will show all lectures for that day
3. Click **Present**, **Absent**, **Late**, or **Excused** for each lecture
4. The calendar date tile will update color immediately:
   - Green = All attended
   - Red = One or more missed
   - Gray = Not yet marked

### 5. View Reports

1. Go to **Reports** page
2. Select date range and/or subject filter
3. View attendance records in table
4. Export as PDF or Excel

### 6. Settings

- **Theme**: Toggle between light/dark mode
- **Threshold**: Set attendance percentage alert threshold
- **Export Data**: Download all data as JSON backup
- **Import Data**: Restore from JSON backup file
- **Reset Data**: Clear all data (use with caution!)

## Color Scheme

- **Primary**: Teal (#0ea5a0)
- **Present**: Green (#22c55e)
- **Absent**: Red (#ef4444)
- **Late**: Amber (#f59e0b)
- **Excused**: Blue (#3b82f6)
- **Neutral/Future**: Gray (#d1d5db)

## Mobile Responsive

The app is fully responsive and works seamlessly on:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktops (1024px+)

All pages use responsive grid layouts and adaptive spacing.

## API Endpoints

- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create subject
- `GET /api/lectures` - Get all lectures
- `POST /api/lectures` - Create lecture
- `PUT /api/lectures/:id` - Update lecture attendance
- `GET /api/weekly-schedules` - Get weekly schedules
- `POST /api/weekly-schedules` - Create weekly schedule
- `POST /api/weekly-schedules/generate` - Generate lectures from schedules
- `GET /api/statistics` - Get attendance statistics

## Development

### Type Checking

```bash
npm run check
```

### Database Schema

The app uses Drizzle ORM with PostgreSQL schema. See `shared/schema.ts` for data models.

## License

MIT

## Support

For issues or questions, please check the codebase or create an issue in the repository.

---

**AttendanceMate** - Track your attendance with style! 📚✅

