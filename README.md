# School Program Command Centre (SPCC)

### Operational & Academic Program Tracking Platform 

The **School Program Command Centre (SPCC)** is a specialized, one-stop operations hub designed specifically for school principals, vice-principals, coordinators, and directors to track all active enrichment initiatives, board diagnostics, remedial cohorts, co-curricular workshops, and compliance criteria in their educational institutions.

This enterprise-grade application solves a critical problem in educational administration: managing multiple third-party vendors, tracking academic interventions, and ensuring compliance without relying on scattered, disjointed spreadsheets.

---

## 📖 For School Authorities: How This Platform Solves Operational Challenges

To ensure that enrichment programs are delivering actual academic value and compliance objectives, school authorities can navigate the platform through their typical administrative workflow:

### 1. Weekly Compliance Audit & Blockers Check (Command Centre)
- **High-Level Heatcheck**: Upon opening the platform, school leadership can immediately review core operational scorecards—Active Programs counts, Global Session Completion Rates, overall Evidence Compliance, and Outstanding Core Risk items.
- **Urgent Action Rail**: Critical bottlenecks (e.g., payment clearances or overdue CBSE submissions) are surfaced instantly to focus leadership on immediate hurdles.
- **Session Attendance Trends**: Real-time visual tracking of planned vs. actual sessions shows if vendors are conducting classes on-schedule or if student attendance is declining.

### 2. Multi-Vendor Audit & Direct Validation (Programs Directory)
- **Program & Owner Alignment**: A transparent directory lists program ownership, target cohorts (e.g., Grades 5-8), and external vendor partners.
- **Dynamic Field-Review Form**: Coordinators or principals can log direct evaluations classified by role (Teacher, Principal, or Vendor). They can rate deliverables and leave actionable comments.
- **Integrated Operations Notification**: High-severity remarks seamlessly trigger alerts, enforcing accountability.

### 3. Curriculum & Syllabus Lag Review (Session logs)
- **Chronological Accountability**: The timeline logs every remedial class, Olympiad prep session, or STEM workshop.
- **Audit Delayed Classes**: Authorities can filter for "Delayed" or "Cancelled" classes, identify responsible trainers, and act immediately to recover lost academic hours.

### 4. Remedial Planning & Subject Benchmarks (Cognitive Assessments)
- **Diagnostic Mapping**: Academic Coordinators can inspect assessment scores plotted dynamically to spot struggling segments.
- **Competency Band Management**: Review bands of student performance (e.g., "High Performance" vs "Needs Remediation"). If a threshold is crossed, a coaching pipeline can be structured.

### 5. Inspection Documentation (Evidence Portal)
- **Audit Verification**: Maintain physical evidence of co-curricular classes (photographs, write-ups, attendance lists) for regulatory compliance.
- **Approved Assets Library**: Coordinators can review uploaded evidence, inspect it directly, and approve or reject submissions to build a compliant record.

### 6. Action Closure Tracking (Action Tracker)
- **Remediation Milestones**: Corrective directives are assigned clear due dates, owners, and severity statuses, replacing chaotic notebook tracking.
- **Status Progression**: Move tasks visually from "Open" through "In Progress" to "Resolved" to maintain momentum and accountability.

### 7. Core Board & Inspector Reporting (Report Builder)
- **Custom Printable Scorecards**: Instantly compile reports for visiting inspectors or board members by selecting relevant modules.
- **Print-Optimization**: The layout automatically reformats for paper printing, producing board-ready documentation instantly.

### 8. AI-Assisted Audits (AI Advisory Centre)
- **Live Contextualization**: An integrated AI assistant parses the live database to connect assessment results, action states, and delays.
- **Strategic Remediation Planner**: Principals can trigger one-click strategic audits to formulate remedial structures, evaluate trainer delays, prioritize action items, or enforce compliance.

---

## 🛠️ For Engineering Leaders & Hiring Managers: Technical Architecture & Stack

At its foundation, SPCC is a modern, high-performance web application engineered for data security, strict typings, and responsive design.

### 1. Client Architecture
- **Framework**: Built as a responsive Single-Page Application (SPA) utilizing **React 18** with **Vite** for rapid Module Replacement and optimal build times.
- **Styling**: Engineered with **Tailwind CSS**, favoring a strict semantic token strategy (Slate/Charcoal palettes) over generic designs, strictly adhering to high-contrast, professional interfaces.
- **Animation & Visual Feedback**: Seamless micro-interactions and route transitions powered by **Framer Motion** (`motion/react`), enhancing the application feel without relying on bloated libraries.
- **Iconography**: Rendered efficiently via `@phosphor-icons/react` for crisp vector scalable graphics.

### 2. Backend & API Design
- **Runtime**: Powered by a robust **Express.js** Node.js backend executing scalable container workloads.
- **Secure Proxy Architecture**: Enforces strict separation of concerns. Third-party secrets (such as the Gemini API Key or Supabase configurations) are exclusively held server-side, accessed and proxy-routed natively through Express middleware (`/api/*`).
- **Data & Identity Layer**: (Optionally integrated depending on deployment) Pluggable readiness for **Supabase / PostgreSQL**, featuring distinct edge capabilities for Row-Level Security (RLS).

### 3. Artificial Intelligence Integration
- **Modern LLM Interaction**: The platform securely communicates with Google's GenAI ecosystem using the modern `@google/genai` TypeScript SDK (leveraging the `gemini-3.5-flash` model) rather than legacy equivalents.
- **System Instructions**: Contextual operations are driven by rigid, prompt-engineered structures ensuring the AI provides actionable analytical audits instead of generic conversational replies.

### 4. Code Quality & Modularity
- **Strict TypeScript**: Deep Type enforcement throughout the codebase via centralized definitions (`/src/types.ts`) ensures that properties such as Action Item status, severity ratings, and cohort parameters are robustly caught at compile time.
- **Module Separation**: The application is highly modular, splitting distinct operational domains (Command Centre, Evidence Portal, Action Tracker) into clean, standalone components to facilitate distributed team contribution and logical organization.

### 5. Deployment Build System
- **Compiled ES Module Pipeline**: Employs an ESBuild compilation step to bundle backend TypeScript down into a single `dist/server.cjs` file executable via Node environments. Includes Vite integration for seamless SPA asset serving while in production (`NODE_ENV=production`), effectively shipping a full-stack container application behind a simple, unified start command.
