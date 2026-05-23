# School Program Command Centre (SPCC)
## Product Architecture & Design Document (v1 Prototype)

---

### 1. Product Overview & Context
The **School Program Command Centre (SPCC)** is a specialized, high-fidelity operations tracking and Business Intelligence (BI) dashboard for Indian private and progressive CBSE/ICSE schools. Unlike standard ERPs that focus on transactional administrative workflows (fees, admissions, payroll, timetabling), the SPCC is designed purely as an **Academic & Enrichment Operations Command Engine**. 

In modern Indian K-12 schools, multiple co-curricular programs (STEM labs, career counseling, remedial coaching, life-skills modules, board diagnostics, inter-school sports prep) run simultaneously. Principals and Academic Coordinators often lack a single pane of glass to know which programs are actually active, whether sessions are on schedule, how many students have achieved competency, what documentation is pending, and which programs are at risk of stalling. This prototype solves this coordination chaos.

---

### 2. User Roles
The system accommodates five distinct personas, each with specific information needs and operational profiles:

1. **The Principal / Director / School Owner (Strategic Viewer)**
   - *Behavioral Profile:* Extremely time-poor, consumes high-level aggregates, demands immediate spotting of lagging programs, compliance risks, or wasted investment.
   - *Key Goal:* Ensure parents see enrichment values, board assessments are on track, and operational bottlenecks are rapidly resolved.

2. **Academic Coordinator / Vice-Principal (Core Operator)**
   - *Behavioral Profile:* Detail-oriented, responsible for syllabus completion, diagnostics, remediation, and board compliance.
   - *Key Goal:* Verify that academic enrichment and diagnostics actually happen, review assessments, and push teachers on trailing syllabus or actions.

3. **Activity & STEM Coordinator (Co-curricular Lead)**
   - *Behavioral Profile:* Manages dynamic events, vendor coordination (e.g., external robotics or career prep agencies), compliance documentation, and resource scheduling.
   - *Key Goal:* Keep workshops and events organized, collect completion certificates, and track student reach ratios.

4. **External Program Vendor / Facilitator (External Partner)**
   - *Behavioral Profile:* Lives outside the permanent staff structure, conducts specialized cohorts (NTSE prep, robotics, design thinking).
   - *Key Goal:* Log session completions, upload assessment results, and demonstrate program efficacy to school leadership to secure renewals.

5. **Class Teacher / Program Coordinator (Data Submitter)**
   - *Behavioral Profile:* Overburdened with everyday clerical work. Highly resistant to complex UI inputs.
   - *Key Goal:* Log attendance, mark simple status checkmarks, submit diagnostic status, and flag blockers in less than 30 seconds.

---

### 3. Information Architecture (IA)
The application is structured into a streamlined, single-screen responsive hub (or a tabbed layout inside a single-page view structure) optimized for desktop administrators:

```
[ School Program Command Centre Layout ]
 ├── Global Filter & Status Ribbon (Class Range, Academic Term, Program Category)
 └── Modules (Navigation tabs switching the core view area)
      ├── 1. Command Centre (Super Dashboard: Key Metrics, Pulse Charts, Immediate Blockers, Focus Area)
      ├── 2. Program Directory (Categorized view of active initiatives, reaches, and vendor health)
      ├── 3. Session Scheduler & Logs (Weekly activity tracker, completion statuses, teacher/hours)
      ├── 4. Cognitive & Diagnostic Center (Diagnostic tests, NTSE/Olympiad prep metrics, competency bands)
      ├── 5. Evidence & Compliance (Document statuses, photo/video uploads, coordinator reviews)
      ├── 6. Action Tracker (Pending follow-ups, resource approvals, warning alerts for school heads)
      └── 7. Report Builder (Reach analysis, program scorecard generation, printable pdf templates)
```

---

### 4. Comprehensive Module Breakdown

#### MODULE 1: Command Centre / Overview
* **Purpose:** Executive summary of all ongoing enrichment activities, overall wellness index of school programs, and operational bottlenecks.
* **Primary User:** School Principal, Academic Director.
* **Key Questions Answered:**
  - Are our active programs generally healthy, or are projects stalled?
  - What is our total student reach percentage across the school (Nursery - Grade 12)?
  - What compliance documents or assessments are critically overdue *today*?
* **Required Data:** Summary counts of active programs, total unique student coverage metrics, compliance completion percentages, consolidated tracker of risks/blockers.
* **Main UI Components:**
  - *High-Density Metric Cards:* Active Programs, Overall Session Completion Rate, Evidence Compliance %, Open Core Blockers.
  - *Program Category Heatmap:* A color-coded matrix (Academic Enrichment vs. STEM vs. Life Skills) showing health status.
  - *Urgent Action Rail:* Top 3 pending critical operations requiring Principal-level intervention (e.g., "Vendor Payment Clearance", "CBSE Diagnostic Submission Overdue").
* **Charts/Tables:** 
  - Dual line-bar chart showing planned vs. actual sessions conducted over the last 12 weeks.
  - Category-wise student coverage horizontal bar chart (percentage reach).
* **Filters Needed:** Global Academic Year/Term, Class Stage (Primary, Middle, Secondary, Senior Secondary).
* **Failure/Empty States:**
  - *No programs initialized:* Display a professional onboarding placeholder with immediate actionable draft import CTA.
  - *Stale data alert:* Indicator showing when the dashboard was last updated by coordinators.
* **Standard Exclusions:** Real-time school security feeds, fee dues tracking, exam schedule builders.

---

#### MODULE 2: Programs (Management & Directory)
* **Purpose:** Catalog and benchmark the structural programs implemented throughout the school year.
* **Primary User:** Academic Coordinator, external vendors.
* **Key Questions Answered:**
  - What specific external curriculum/vendor programs (e.g., LEGO Robotics lab, Mindler Career Counseling) are running, and what class cohorts do they cover?
  - Who is the designated school owner (teacher) and the external vendor facilitator?
  - What is the budget vs. execution efficiency of this program?
* **Required Data:** Program ID, Category, Vendor Name, School Owner, Class Cohorts, Student Target Count, Budget, Health Index (On-track, At Risk, Delayed, Closed).
* **Main UI Components:**
  - *Rich Grid Cards:* Beautiful, content-dense cards displaying program category badges, school coordinator avatars, target class pill badges, and progress bar trackers.
  - *Quick Drawer Panel:* Slide-out detail view containing program objectives, contact details of the vendor, and budget utilization charts.
* **Charts/Tables:** 
  - Active Programs Table sorting by class range reach, completion rates, and owner responsiveness.
* **Filters Needed:** Search by Name, Category tag multi-select, Lead Owner dropdown, Budget range sliders.
* **Failure/Empty States:**
  - *Zero results:* Clean "No matching programs found" state with quick-clear filters shortcut.
* **Standard Exclusions:** Vendor contracts document signer, bidding/invoicing software.

---

#### MODULE 3: Activities / Sessions
* **Purpose:** Daily and weekly tracking log of scheduled enrichment events, remedial sessions, and STEM lab hours.
* **Primary User:** Teachers, Activity Coordinators, External Instructors.
* **Key Questions Answered:**
  - Was yesterday's robotics workshop actually completed? If delayed, what was the reason?
  - Which teacher logged the hours, and what was the approximate attendance rate?
  - Are we on track to hit our target sessions for this educational term?
* **Required Data:** Activity ID, Program Association, Target Dates, Actual Date, Facilitator Name, Topic, Target Class, Attendance %, Status (Planned, Completed, Delayed, Cancelled).
* **Main UI Components:**
  - *Timeline Ledger:* A beautiful, interactive vertical timeline of sessions sorted chronologically.
  - *Interactive Completion Checklist:* Allow coordinators to flag planned sessions as "Completed" with automated logging of date-times.
* **Charts/Tables:**
  - Interactive grid ledger displaying the sessions, searchable by topic terms.
  - Pie chart showing session completion status breakdown.
* **Filters Needed:** Date range picker, Status pills, Cohort Class selector.
* **Failure/Empty States:**
  - *No activities scheduled this week:* Gentle, comforting notification urging coordinator to populate schedules.
* **Standard Exclusions:** Complex timetable conflicts solver, substitution teacher auto-assignment engine.

---

#### MODULE 4: Assessments (Diagnostic & Competency Indicators)
* **Purpose:** Consolidated view of student competency cohorts across diagnostic evaluations, ASSET exams, career readiness tests, and NTSE mock stats.
* **Primary User:** Academic Director, Vice-Principal.
* **Key Questions Answered:**
  - What is the class-wise competency breakdown for the latest Math diagnostic?
  - What percentage of Grade 10 students have completed their Career Suitability assessment?
  - Which batches need immediate academic remedial support based on diagnostic findings?
* **Required Data:** Assessment Name, Associated Program, Subject, Grade Levels, Conducted Date, Completion/Participation Rate, Average Marks, Competency Cohort Split (High Performance, Target Core, Needs Remediation).
* **Main UI Components:**
  - *Diagnostic Scatter-Grid:* Scatter mapping showing Participation vs. Mean Score for rapid identification of struggling academic segments.
  - *Competency Band Stack:* Visual horizontal bars illustrating the percentages of student cohorts in various mastery levels.
* **Charts/Tables:**
  - Recharts stacked bar chart of Competency Distirbutions by subjects.
* **Filters Needed:** Subject category, Cohort Class, assessment provider (Vendor vs. Internal Board).
* **Failure/Empty States:**
  - *Assessment results pending upload:* Clean placeholder showing "Upload Assessment Excel Draft" wizard.
* **Standard Exclusions:** Actual student personal reports generator, deep individual item-analysis matrix.

---

#### MODULE 5: Documentation / Evidence Portal
* **Purpose:** Storage, review, and verification of operational compliance evidence (photos, videos, attendance sheets, circulars).
* **Primary User:** Activity Coordinator, Principal.
* **Key Questions Answered:**
  - Has the STEM vendor uploaded the CBSE robotics activity report?
  - Is there concrete photographic evidence for the Career Fair session to present on social channels?
  - Which program assets are missing compliance documents?
* **Required Data:** Document ID, Program, Event Title, File Name, Type, Uploaded Date, Contributor, Status (Approved, Pending Review, Missing/Overdue).
* **Main UI Components:**
  - *Grid Gallery:* Preview-oriented grid layout with immediate click-to-preview capability.
  - *Review Dashboard View:* Side-by-side comparative ledger with Quick Action buttons ("Approve Quality", "Request Re-upload", "Send Reminder to Teacher").
* **Charts/Tables:**
  - List table showing critical programs categorized by "Missing Documentation" indices.
* **Filters Needed:** Document Status, Program Category, Upload Date range.
* **Failure/Empty States:**
  - *No evidence uploaded yet:* Informative placeholder showing file drag-and-drop zones.
* **Standard Exclusions:** Massive cloud-drive file sync engine, real-time photo editor.

---

#### MODULE 6: Action Tracker / Risks
* **Purpose:** Task tracking and risk management center to coordinate immediate remedial actions and resource constraints.
* **Primary User:** Principal, Academic Coordinators, Teachers.
* **Key Questions Answered:**
  - What is stopping a stalled robotics lab session from resuming (e.g., "Kits stuck in customs")?
  - Who has been assigned to resolve a specific curriculum gap?
  - What action items are overdue, and what are their severity levels?
* **Required Data:** Task ID, Related Program, Task Description, Owner, Due Date, Severity Index (Critical, Moderate, Low), Resolution Status.
* **Main UI Components:**
  - *Kanban-style Board or Status Lanes:* A simplified 3-column operational board showing Open, In Progress, and Resolved tasks.
  - *Critical Risk Strip:* Glowing warning elements pinned to the top of the tracker indicating critical, unresolved blockers.
* **Charts/Tables:**
  - High-density list table highlighting active risks and physical roadblocks.
* **Filters Needed:** Task Owner dropdown, Severity Level, Target Due Date range.
* **Failure/Empty States:**
  - *No open risks:* Gratifying serene state with message "All school programs are functionally stable today!"
* **Standard Exclusions:** Complex multi-person team chat software, automated JIRA integrations.

---

#### MODULE 7: Reports & Analytics
* **Purpose:** Generate printable summaries, scorecards, and cross-metric assessments for management board meetings.
* **Primary User:** Principals, School Management Board, Program Managers.
* **Key Questions Answered:**
  - Which classes had the highest co-curricular engagement ratios this term?
  - What is the overall health index score card of our external academic vendors?
  - What summary metrics can we print to showcase to visiting board inspectors?
* **Required Data:** Aggregate analytical metrics across all previous modules.
* **Main UI Components:**
  - *Quick Report Builder:* A clean options grid to generate custom reports on selective metrics.
  - *Interactive PDF Preview Screen:* A clean paper-formatted sheet template layout within the web screen that shifts automatically during standard browser print (`Ctrl + P`).
* **Charts/Tables:** 
  - Comprehensive analytical radar or comparative bar charts.
* **Filters Needed:** Program category selection, Level grouping (Primary vs Intermediate).
* **Failure/Empty States:**
  - *No report parameters selected:* Clean prompt stating "Select school parameters to generate an executive report."
* **Standard Exclusions:** SQL/NoSQL visual query makers, multi-branch multi-school comparison hubs.

---

### 5. Detailed V1 Scope
The prototype focuses purely on showing realistic academic operations data using **synthesized, responsive local states**. It incorporates:
- Fully functional local state management supporting creation of new programs, logging new activities, uploading mock evidence files, logging action/risks list items, and updating statuses locally.
- High-contrast, clean professional styling customized with Inter and Space Grotesk fonts.
- Multi-perspective switching between different dashboard view layouts without page loads.
- Ready-to-go pre-populated seed data representing typical Indian private and CBSE schools.

---

### 6. Selected V2 Ideas
- Integration of Google Sheets API using persistent OAuth storage for dynamic collaborative data entering by multiple coordinators.
- Automatic document analysis via Gemini model processing to read uploaded certificates and extract scores/attendance metrics automatically.
- Automated email digests sent using server-side Cron notifications for alerting academic owners about critical compliance deficits.

---

### 7. Core Risks & Anti-Patterns
To prevent this prototype from failing or breaking in real-world environments, we identify these technical and operational risks:

* **Operational Risk: The "Data Entry Tax" Death Trap**
  * *The Anti-Pattern:* Busy CBSE teachers are already drowned under tons of board compliance registers. If the SPCC app requires them to fill deep, complex forms with dozens of text fields to log simple class activities, they will simply stop using it. The prototype will become a graveyard of stale data.
  * *The Prevention:* The activities module must support single-click status updates and extremely simplified 2-parameter inputs. Data logging must feel as frictionless as marking attendance on a physical register.

* **UX Risk: "ERP-creep" Overload**
  * *The Anti-Pattern:* Overwhelming the user by turning the prototype into a bloated classroom management system, mixing in homework assignments, exam grades, or parent communication logs. This dilutes the focus, confuses principals, and makes the dashboard redundant.
  * *The Prevention:* Strictly exclude standard transactional ERP variables from the views. Maintain modular focus solely on program-level metrics, diagnostic thresholds, and completion compliance.

* **Design Risk: UI "Aesthetic Chaos" in Board Meetings**
  * *The Anti-Pattern:* Using flashy gaming layouts, dark neon grids, or complex dashboard patterns that look cool in web prototypes but are unreadable to Indian school principles (who often print dashboards onto physical sheets of paper or view them on older boardroom displays with poor contrast).
  * *The Prevention:* Use high-contrast editorial layouts with crisp gray scales, elegant sans-serif typography, soft color-indicator badges, and excellent print stylesheets.

---

### 8. Recommended Build Order
To ensure a robust, failure-proof setup:
1. **Infrastructure Prep:** Configure project metadata and global styling parameters (Typography, Tailwind colors).
2. **Context & Seed Setup:** Define type interfaces and seed high-fidelity mock data mimicking an Indian private school (e.g., "Silver Oaks International, Bengaluru").
3. **Command Engine Frame:** Build the global layout, navigation tabs, and filters.
4. **Interactive Mock Modules:** Populate individual tab modules with local state bindings, letting users add or edit elements iteratively.
5. **Insights & Visualizations:** Embed high-fidelity Recharts visual scoreboards.
6. **Polishing & Verification:** Run final compile audits to guarantee absolute zero-fault runtime.
