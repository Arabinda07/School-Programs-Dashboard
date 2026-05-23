# SPCC Data Model & Synthetic Data Plan (v1 Prototype)

---

## 1. Data Model Overview
The SPCC v1 Data Model is designed as a star-schema-inspired relational model optimized for BI dashboarding and operational tracking. The model centers around `programs` as the core entity, with `activities`, `assessments`, `documentation`, and `action_items` acting as fact/transactional tables linked to the programs. 

Because v1 focuses strictly on high-level operational visibility rather than student individual evaluation, we use aggregated metrics (e.g., student reach counts, average completion percentages) rather than massive fact tables mapping thousands of individual students.

**Target School Context:**
- **Name:** Sunrise Public School, Durgapur, West Bengal
- **Scope:** Classes 6 to 10 (Sect A, B) ~ 600 students
- **Scale:** 8-12 Programs, 40-60 Activities, ~25 Teachers

---

## 2. Table Schemas

### 1. `programs` (Core Entity)
Tracks the high-level initiatives running in the school.
- `id` (String/UUID, PK) - e.g., "PRG-001"
- `name` (String, Req) - e.g., "Robotics Bootcamp"
- `category` (String, Req) - e.g., "STEM / Robotics"
- `vendor` (String, Opt) - e.g., "STEMpedia", or "Internal"
- `owner_id` (String, Req, FK -> teachers) - e.g., "TCH-012"
- `target_student_count` (Integer, Req) - e.g., 120
- `status` (String, Req) - e.g., "Active", "Completed", "On Hold"
- `start_date` (Date, Opt) - Target kick-off
- `end_date` (Date, Opt) - Target completion
- `budget_allocated` (Numeric, Opt) - e.g., 25000
- `budget_consumed` (Numeric, Opt) - e.g., 10000

### 2. `classes` (Dimension)
Defines the cohort grain.
- `id` (String, PK) - e.g., "CLS-6A"
- `grade_level` (Integer, Req) - e.g., 6
- `section` (String, Req) - e.g., "A"
- `student_strength` (Integer, Req) - e.g., 40
- `class_teacher_id` (String, Req, FK -> teachers) - e.g., "TCH-005"

### 3. `activities` (Fact - Operational Logs)
Logs execution of specific sessions.
- `id` (String, PK) - e.g., "ACT-104"
- `program_id` (String, Req, FK -> programs)
- `class_id` (String, Req, FK -> classes)
- `topic` (String, Req) - e.g., "Line Follower Logic"
- `target_date` (Date, Req) - When it was supposed to happen
- `actual_date` (Date, Opt) - When it actually happened. Null if pending/delayed.
- `facilitator_id` (String, Req, FK -> teachers) 
- `status` (String, Req) - "Planned", "Completed", "Delayed", "Cancelled"
- `students_attended` (Integer, Opt) - Null if not yet happened
- `notes` (String, Opt) - Reason for delay, missing kits, etc.

### 4. `assessments` (Fact - Aggregate Results)
Stores cohort-level diagnostic performance (No PII).
- `id` (String, PK) - e.g., "ASM-022"
- `program_id` (String, Req, FK -> programs)
- `class_id` (String, Req, FK -> classes)
- `name` (String, Req) - e.g., "Phase 1 Diagnostic"
- `conducted_date` (Date, Opt)
- `students_participated` (Integer, Opt)
- `average_score_percent` (Numeric, Opt)
- `band_high_percent` (Numeric, Opt) - e.g., 25 (meaning 25% students in High band)
- `band_target_percent` (Numeric, Opt)
- `band_remediation_percent` (Numeric, Opt)
- `baseline_variance` (Numeric, Opt) - Improvement/decline from previous test

### 5. `documentation` (Fact - Compliance)
Tracks mandatory evidence and reports.
- `id` (String, PK) - e.g., "DOC-045"
- `program_id` (String, Req, FK -> programs)
- `activity_id` (String, Opt, FK -> activities) 
- `title` (String, Req) - e.g., "Q1 Vendor Report"
- `type` (String, Req) - "PDF", "Image", "Video", "Sheet"
- `status` (String, Req) - "Pending", "Uploaded", "Approved", "Rejected"
- `due_date` (Date, Req) 
- `uploaded_date` (Date, Opt)
- `file_url` (String, Opt)

### 6. `action_items` (Fact - Risk Management)
Tracks bottlenecks and operational blocks.
- `id` (String, PK) - e.g., "ACTN-010"
- `program_id` (String, Opt, FK -> programs)
- `description` (String, Req) - e.g., "Need projector replacement in Room 5"
- `owner_id` (String, Req, FK -> teachers)
- `severity` (String, Req) - "Critical", "Moderate", "Low"
- `status` (String, Req) - "Open", "In Progress", "Resolved"
- `due_date` (Date, Req)
- `resolved_date` (Date, Opt)

### 7. `feedback` (Fact - Qualitative)
- `id` (String, PK)
- `program_id` (String, Req, FK -> programs)
- `activity_id` (String, Opt, FK -> activities)
- `source` (String, Req) - "Teacher", "Principal", "Vendor"
- `sentiment_score` (Integer, Req) - 1 to 5 scale
- `comment` (String, Opt)
- `submitted_date` (Date, Req)

### 8. `teachers` (Dimension)
- `id` (String, PK) - e.g., "TCH-001"
- `name` (String, Req)
- `role` (String, Req) - "Principal", "Academic Coordinator", "Teacher", "Vendor Facilitator"
- `department` (String, Opt)

### 9. `calendar` (dim_date)
Standard dimensional table for time-series parsing.
- `date` (Date, PK)
- `academic_year` (String) - e.g., "2025-26"
- `term` (String) - "Term 1", "Term 2"
- `is_holiday` (Boolean)
- `holiday_name` (String, Opt)

---

## 3. Relationships
- **Programs** 1:N **Activities**, **Assessments**, **Documentation**, **Action Items**, **Feedback**
- **Teachers** 1:N **Programs** (as owners), 1:N **Activities** (as facilitators), 1:N **Action Items** (as owners)
- **Classes** 1:N **Activities**, 1:N **Assessments**
- **Activities** 1:N **Documentation** (e.g. photos for a specific session), 1:N **Feedback**

---

## 4. Calculated Metric Definitions
- **Active Programs**: Count of `programs` where status IN ('Active', 'At Risk', 'Delayed').
- **Program Completion Rate**: `programs.budget_consumed` / `programs.budget_allocated` (Financial) OR nested aggregation of completed activities.
- **Activity Completion Rate**: Count of `activities` with status 'Completed' / Total count of `activities` per `program_id`.
- **Delayed Activities**: Count of `activities` with status 'Delayed' OR (`target_date` < TODAY and `status` = 'Planned').
- **Student Reach**: Sum of `activities.students_attended` (distinct grouped by class if mapping permits) / Sum of `programs.target_student_count`.
- **Class Coverage**: Distinct count of `activities.class_id` mapped per program.
- **Average Attendance Rate**: SUM(`activities.students_attended`) / SUM(`classes.student_strength` mapped to those activities).
- **Assessment Completion Rate**: Count of `assessments` with a `conducted_date` / Total scheduled `assessments`.
- **Average Score**: Average of `assessments.average_score_percent` weighted by `students_participated`.
- **Improvement from Baseline**: `assessments.baseline_variance` values averaged.
- **Documentation Completion Rate**: Count of `documentation` where status = 'Approved' / Total `documentation` records.
- **Open Action Items**: Count of `action_items` where status = 'Open'.
- **Overdue Action Items**: Count of `action_items` where status = 'Open' AND `due_date` < TODAY.
- **High Priority Risks**: Count of `action_items` where status != 'Resolved' AND `severity` = 'Critical'.
- **Upcoming Activities This Week**: Count of `activities` where `target_date` is between TODAY and (TODAY + 7 Days).

---

## 5. Synthetic Data Generation Rules (Sunrise Public School)
- **Scale Limits:** Generate exactly 10 programs, 50 activities, 20 assessment cohorts, 80 doc items, and 25 action items.
- **Distribution:** 
  - 60% of programs are "Active", 20% "Delayed", 10% "At Risk", 10% "Completed".
  - Classes 6-10 have Sections A & B (10 class records). Each has exactly 60 students to maintain the 600 total.
  - Assessment scores should cluster around 65-80% to look realistic.
- **Names:** Use standard Indian names for teachers (e.g., "Arun Mukherjee", "Smita Chatterji", "Vikram Das").
- **Vendor:** Mix internal programs (Vendor="Internal") with standard Indian EdTech archetypes (Vendor="Mindspark", "STEMpedia", "Creya").

---

## 6. Data Quality Rules
- **Null Safety:** 
  - `actual_date` in activities MUST be null if status is 'Planned' or 'Delayed'.
  - `students_attended` MUST be null if activity is not 'Completed'.
  - `uploaded_date` in documentation MUST be null if status is 'Pending' or 'Missing'.
- **Logical Bounds:**
  - `students_attended` cannot exceed `classes.student_strength`.
  - Competency bands (`band_high_percent` + `band_target_percent` + `band_remediation_percent`) MUST sum to exactly 100 for any given assessment.
  - Assessment `average_score_percent` must be between 0 and 100.

---

## 7. Edge Cases & Adversarial "Messy Data" Handling
The prototype dashboard logic MUST be defensive against these injected synthetic imperfections:
1. **The Ghost Session:** An activity is marked 'Completed' but `students_attended` is 0 or NULL, and there is no associated `actual_date`. (Dashboard should flag this as a data entry anomaly).
2. **Infinite Delay:** An activity has `target_date` from three months ago, status is 'Delayed', and no `actual_date` exists. It just hangs there.
3. **Inconsistent Class Naming:** Some records say "Class 6" while others say "6A" or "Grade 6". The `class_id` mapping must normalize this natively.
4. **Missing Assessment Data:** An assessment record exists but participation is 0%, meaning the vendor didn't execute the test. Division-by-zero checks on `average_score` aggregations are mandatory.
5. **Orphaned Evidence:** A `documentation` item is 'Approved' but its parent `program` is 'Cancelled'.
6. **The Hoarder:** One program has 3 "Critical" Action Items, but the program itself is marked "On-track". (Dashboard UI should visually warn of this conflict).
7. **Negative Baseline:** A baseline variance in `assessments` is negative (e.g., -5%), meaning the cohort performed worse than last term. UI must handle red/downward arrows gracefully.
