# School Program Command Centre (SPCC)
### Operational & Academic Program Tracking Platform (v1.2 Full-Stack Integration)

The **School Program Command Centre (SPCC)** is a specialized, one-stop operations hub designed specifically for school principals, vice-principals, coordinators, and directors to track all active enrichment initiatives, board diagnostics, remedial cohorts, co-curricular workshops, and compliance criteria in their educational institutions.

This enterprise-grade prototype is configured default with real-world dataset representing **Sunrise Public School, West Bengal (Academic Year 2025-26)**.

---

## 📖 Operational User Guide (How School Authorities Use This Platform)

To ensure that enrichment programs are delivering actual academic value and compliance objectives, school authorities can navigate the platform through their typical weekly administrative workflow:

### 1. Weekly Compliance Audit & Blockers Check (Command Centre Tab)
- **High-Level Heatcheck**: Upon opening the platform, the school leadership (Principal or Director) immediately reviews the core operational scorecards—Active Programs counts, Global Session Completion Rates, overall Evidence Compliance, and Outstanding Core Risk items.
- **The Urgent Action Rail**: Critical bottlenecks (such as payment clearances or overdue CBSE submissions) are pinned directly to the screen so leadership can focus on immediate hurdles without reading through lengthy reports.
- **Session Attendance Trends**: Real-time visual tracking of planned vs. actual sessions shows if vendors are actually conducting classes on-schedule or if student attendance is declining.

### 2. Multi-Vendor Audit & Direct Qualitative Validation (Programs Directory Tab)
- **Program & Owner Alignment**: A transparent directory lists exactly who owns which program (e.g., LEGO Robotics lab, Mindler Career Counseling), which grade cohorts (Grades 5-8) are targeted, and who is their external vendor partner.
- **Immediate Financial Assessment**: Tracks allocated budgets versus utilized funds to prevent over-spending.
- **Dynamic Field-Review Form**: Below each expanded program, school coordinators or visiting principals can log direct evaluations classifying themselves as **Teacher, Principal, or Vendor**. They select a target deliverable, rate it (1-5 stars), and leave comments.
- **Integrated Operators Notification**: High-severity remarks (low scores <= 2) instantly trigger system-wide alert notifications, making operational flaws impossible to hide.

### 3. Curriculum & Syllabus Lag Review (Session logs Tab)
- **Chronological Accountability**: The timeline logs every remedial class, Olympiad pep-talk, or STEM workshop session.
- **Audit Delayed Classes**: Authorities can filter specifically for classes marked "Delayed" or "Cancelled," see which teacher or external trainer was responsible, view attendance parameters, and follow up directly on lost academic hours.

### 4. Remedial Planning & Subject Benchmarks (Cognitive Assessments Tab)
- **Diagnostic Mapping**: Academic Coordinators inspect assessment scores (e.g., NCERT standards, ASSET exams, logic evaluation grids) plotted dynamically to spot struggling segments.
- **Competency Band Management**: Review exact proportions of students who are "High Performance", "Target Core", or "Needs Remediation" (Academic Remediation Required). If more than 25% of students fall in the remediation category, a coaching pipeline is initiated.

### 5. Social & CBSE Inspections Documentation (Evidence Portal Tab)
- **Audit Verification**: CBSE and ICSE regulations require physical evidence of co-curricular classes (photographs, activity write-ups, attendance lists).
- **Approved Assets Library**: Coordinators filter for "Pending Review" uploads from vendors. They inspect the PDF or image quality directly on the screen, and click to update status directly to "Approved" or "Missing."

### 6. Action Closure Tracking (Action Tracker Tab)
- **Remediation Milestones**: Rather than tracking tasks in chaotic notebooks, all corrective directives (e.g., "Replace faulty STEM components", "Procure extra career guides") are assigned clear due dates, owners, and severity statuses.
- **Status Progression**: Move tasks with high-density visual lanes from "Open" through "In Progress" to "Resolved" to maintain momentum.

### 7. Core Board & Inspector Reporting (Report Builder Tab)
- **Custom printable Scorecards**: When visiting inspectors or board members request summaries, choose which parameters to include (Financial charts, class reaches, vendor audits) and click to compile.
- **Print-Optimization**: The page automatically reformats into clean, border-aligned paper layouts during a regular browser print (`Ctrl + P` or `Cmd + P`), producing a board-ready report.

### 8. Gemini Co-Pilot Audits (AI Advisory Centre Tab)
- **Live Contextualization**: Parses the live database, connecting assessment results, action states, delay trackers, and reviews.
- **Strategic Remediation Planner**: Principals trigger one-click analytical audits:
  1. *Cognitive Remediation Planner*: Formulates high-fidelity remedial structures based on low competency bands of cohorts.
  2. *Session Lag Stagnation Audit*: Evaluates trainer delays & drafts professional administrative warning emails.
  3. *Action Item Prioritizer*: Maps out solutions for critical risks.
  4. *Compliance Audit*: Flags missing सीबीएसई / CBSE certificates.
- **Executive Q&A**: Type in any custom query to get a logical, formatted operational diagnostic plan.

---

## 🛠️ Technical Setup & Stack Architecture

At its foundation, this platform is a modern full-stack web application designed for absolute data safety:

1. **Client Interface**: Built as a responsive Single-Page Application (SPA) utilizing **React 18** with **Vite**, styled using the utility classes of **Tailwind CSS**.
2. **Icons & Animations**: High-contrast icons from `@phosphor-icons/react` and interactive micro-transitions powered by **motion** (importing from `motion/react`).
3. **Backend Server**: Powered by a robust **Express** Node.js backend (`server.ts`) running on port `3000`.
4. **Secure Proxy API Routes**: Since API keys should never be exposed to the client-side browser, the client makes a request to `/api/gemini/clarify`. The Node backend securely communicates with Google GenAI using the modern `@google/genai` SDK and the `gemini-3.5-flash` model.
5. **Typescript Isolation**: All operational schemas are structurally bound through `/src/types.ts`.

### Running Locally

1. **Environmental Configuration**:
   Create a `.env` file (or set your secrets in the settings panel):
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   NODE_ENV=development
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Run Development Mode (Express + Vite)**:
   ```bash
   npm run dev
   ```
4. **Build Production Asset Bundles (Compiled CommonJS server & client)**:
   ```bash
   npm run build
   ```
5. **Start Production Container Server**:
   ```bash
   npm run start
   ```
