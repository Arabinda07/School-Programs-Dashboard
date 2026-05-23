# Data Overview

This directory (`/src/data/mock/`) contains realistically imperfect synthetic data for the **School Program Command Centre** prototype representing operations at *Sunrise Public School*.

### 1. The Files

*   `programs.json` (12 records): Master list of tracking initiatives (Robotics, Career Prep, Math Circles).
*   `activities.json` (~60 records): Granular logs showing scheduled and executed events for sections and programs.
*   `assessments.json` (~35 records): Outcome performance percentages, band cohorts, and baseline variance.
*   `documentation.json` (~100 records): Compliance proofs (photos, reports) and their statuses.
*   `action_items.json` (~40 records): Project management bottlenecks and risks.
*   `feedback.json` (~50 records): Qualitative ratings from teachers and vendors.
*   `classes.json` (10 records): The cohorts (Classes 6-10, Sections A & B).
*   `teachers.json` (25 records): Master staff directory and role mappings.

### 2. Relationships

The data adheres strictly to the relational star-schema described in your `DATA_MODEL.md`. 
*   Fact entries (`activities`, `assessments`, `documentation`, `action_items`, `feedback`) contain a `program_id` joining back to the programs dimension.
*   Fact entries also optionally contain `class_id`, `owner_id`, or `activity_id` references to track responsibility and cohort targeting.

### 3. Deliberate Data Quality Anomalies

This data is dynamically generated to mirror reality and contain several common architectural edge cases:

*   **The Ghost Sessions**: Some `activities` are marked `Completed` but possess no `actual_date` or `0` for `students_attended`. 
*   **Orphaned Documents**: Roughly 5% of `documentation.json` entries point to an invalid `PRG-999` `program_id` (representing cancelled or misfiled programs).
*   **Missing Outcomes**: Some `assessments` lack `conducted_date` and have a `participation_rate` of `0` causing null averages.
*   **Downward Variance**: Certain assessments capture negative `baseline_variance`, indicating structural performance regressions.
*   **Hanging Delays**: Some `activities` are flagged `Delayed` with `target_date` in the past, yet no resolution notes exist.
*   **Resource Hoards**: Some programs show "Active" or "On-track" but have attached "Critical" risk items within `action_items.json`.

### 4. Supporting Dashboard Modules

*   **programs.json & teachers.json**: Core directory rendering and assignment mapping.
*   **activities.json**: Yields the "Session & Activities Ledger" module and overall reach metrics.
*   **assessments.json**: Fuels the "Diagnostic View" with stacked bar charts and competency splits.
*   **documentation.json**: Required for the grid layouts rendering the "Evidence Portal" module.
*   **action_items.json**: Populates the 3-column "Kanban Action Tracker".
*   *Across all tables*: Multi-join metrics calculate the Command Centre scorecards.
