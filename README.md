# School Program Command Centre (SPCC)

A clean admin dashboard prototype built for Indian school leadership to oversee multiple academic, enrichment, and co-curricular programs.

## Setup Instructions

1. Ensure you have Node.js (v18+) installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## Architecture

This is a **frontend-only App Shell** built with React, Vite, and Tailwind CSS. It is fully responsive and prioritizes a clean, readable layout matching the specified design direction (professional, calm, status-driven).

### Features Implemented
- App Shell with left-side navigation rail.
- Top command header displaying school context and live system status.
- Primary page routing via active tab state.
- EmptyState and LoadingState UI components.
- Initial placeholder modules for:
  - Overview / Command Centre
  - Programs Directory
  - Activities Scheduler & Logs
  - Diagnostic Assessments
  - Evidence Portal
  - Action Tracker
  - Report Builder

### Intentionally Not Implemented
- Full Chart Logic (Recharts logic removed in favor of shell layout per instructions)
- External API calls or data fetching
- Database connectivity or real persistence
- Authentication / User roles
- School ERP transactional modules (fees, timetable)
- The components rely on mock local data to set the scaffolding context.
