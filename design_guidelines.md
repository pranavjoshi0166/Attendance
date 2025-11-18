# AttendanceMate Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from modern productivity tools like Notion and Linear, combined with the clean dashboard aesthetic of analytics platforms. The user has provided a specific design mockup that serves as the primary visual reference - all layouts must match this provided design.

## Core Design Principles
- **Clean Card-Based Architecture**: Every major component lives in distinct cards with subtle shadows
- **Data-First Design**: Information hierarchy prioritizes attendance metrics and visual data
- **Calm Productivity**: Minimal distractions, focus on clarity and quick actions
- **Dashboard-Centric**: Home screen provides comprehensive at-a-glance status

## Typography System
**Font Stack**: Inter or Manrope via Google Fonts
- **Headings**: 
  - Page Titles: text-2xl/text-3xl, font-semibold
  - Card Headers: text-lg, font-semibold
  - Stat Numbers: text-4xl, font-bold
- **Body Text**: text-sm/text-base, font-normal
- **Metadata**: text-xs, font-medium (uppercase for labels)

## Layout System
**Spacing Units**: Use Tailwind primitives of 2, 4, 6, 8, 12, 16 for consistent rhythm
- Card padding: p-6 to p-8
- Section gaps: gap-6 (grid layouts)
- Container margins: mx-4 md:mx-8 lg:mx-12
- Max container width: max-w-7xl

## Component Library

### Dashboard Components
**Summary Cards** (4-column grid on desktop, 2 on tablet, 1 on mobile):
- Large stat number at top
- Label below
- Subtle icon in corner
- Teal accent for primary metric
- White background with border

**Donut Chart Card**:
- Centered chart with legend below
- Status breakdown: Present (green), Absent (red), Late (yellow), Excused (blue)
- Percentage labels on segments

**Upcoming Lectures List**:
- Chronological list with time stamps
- Subject color-coded pills
- Lecture title and notes preview

### Subject Cards
- Subject name + code as header
- Teacher name in metadata
- Attendance percentage prominently displayed
- Color-coded left border matching subject tag
- Edit/delete actions on hover

### Calendar Interface
- Monthly grid view as primary
- Week/Day views as tabs
- Colored dots on dates indicating attendance status
- Click date → slide-in panel showing lectures
- Quick attendance toggle within panel

### Lecture Modal
- Full-screen overlay with centered card
- Form fields: Subject dropdown, Title, Date picker, Time range, Notes textarea
- Status toggle buttons (Present/Absent/Late/Excused) with distinct colors
- Recurring checkbox option

### Analytics Dashboard
- Grid layout: 2 columns on desktop
- Pie chart showing attendance breakdown
- Bar chart comparing subjects
- Line chart for weekly trends
- Export buttons (PDF/Excel) prominently placed

### Reports Interface
- Date range picker at top
- Filter by subject dropdown
- Generated report shows:
  - Summary stats cards
  - Pie chart
  - Detailed table (Date | Subject | Lecture | Status | Notes)
- Export actions as floating action buttons

## Color Strategy
**Primary Palette** (matching provided mockup):
- Primary Teal: For accents, CTAs, active states
- Success Green: Present status
- Error Red: Absent status  
- Warning Yellow: Late status
- Info Blue: Excused status
- Neutral Grays: Borders, backgrounds, text hierarchy

## Navigation
**Sidebar Navigation** (persistent on desktop, hamburger on mobile):
- Dashboard icon + label
- Calendar
- Subjects
- Reports
- Settings
- User profile at bottom

## Interactive Elements
- Buttons: Rounded corners (rounded-lg), px-6 py-2.5
- Primary buttons: Teal background, white text
- Secondary buttons: White background, teal border
- Icon buttons: Circular, p-2
- Hover states: Subtle scale and shadow increases
- No blurred backgrounds needed for this app

## Data Visualization
- Use Chart.js with custom teal/green color scheme
- Donut charts with center percentage display
- Bar charts with rounded tops
- Gridlines subtle gray
- Tooltips with white background and shadow

## Responsive Behavior
- Desktop (lg:): Sidebar visible, 4-column summary grid
- Tablet (md:): Collapsed sidebar, 2-column grid
- Mobile: Bottom navigation, single column, full-width cards

## Critical Layout Requirements
- Dashboard must show all key metrics above fold
- Calendar grid fills viewport width efficiently
- Subject list displays 8-12 subjects before scrolling
- Reports page accommodates full-width tables
- No forced viewport heights - content flows naturally

This design creates a professional, data-focused attendance tracking experience that balances visual clarity with functional depth.