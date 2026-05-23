export type ProgramCategory = 
  | 'Academic Enrichment'
  | 'STEM & AI'
  | 'Life Skills'
  | 'Career Guidance'
  | 'Diagnostic Assessments'
  | 'Teacher Orientation'
  | 'Events & Clubs';

export type ProgramStatus = 'On-track' | 'At Risk' | 'Delayed' | 'Closed';

export interface Program {
  id: string;
  name: string;
  category: ProgramCategory;
  vendor: string;
  schoolOwner: string;
  classCohorts: string[];
  targetStudents: number;
  completedStudents: number;
  budgetAllocated: number;
  budgetUsed: number;
  status: ProgramStatus;
  lastUpdated: string;
}

export type ActivityStatus = 'Planned' | 'Completed' | 'Delayed' | 'Cancelled';

export interface Activity {
  id: string;
  programId: string;
  topic: string;
  targetClass: string;
  targetDate: string;
  actualDate?: string;
  facilitator: string;
  attendancePercent: number;
  status: ActivityStatus;
  notes?: string;
}

export interface Assessment {
  id: string;
  programId: string;
  name: string;
  subject: string;
  gradeLevels: string[];
  conductedDate: string;
  participationRate: number;
  averageMarks: number;
  competencyBands: {
    high: number;
    target: number;
    remediation: number;
  };
}

export type DocumentStatus = 'Approved' | 'Pending Review' | 'Missing';

export interface EvidenceDocument {
  id: string;
  programId: string;
  title: string;
  fileName: string;
  type: 'PDF' | 'Image' | 'Video' | 'Sheet';
  uploadedDate?: string;
  contributor: string;
  status: DocumentStatus;
}

export type SeverityIndex = 'Critical' | 'Moderate' | 'Low';
export type TaskStatus = 'Open' | 'In Progress' | 'Resolved';

export interface ActionItem {
  id: string;
  programId?: string;
  description: string;
  owner: string;
  dueDate: string;
  severity: SeverityIndex;
  status: TaskStatus;
}

export interface SystemData {
  programs: Program[];
  activities: Activity[];
  assessments: Assessment[];
  documents: EvidenceDocument[];
  actions: ActionItem[];
}
