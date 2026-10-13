export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export type ClassType = 'theory' | 'lab' | 'tutorial';

export type AttendanceStatus = 'present' | 'absent' | 'cancelled' | 'excused';

export interface Subject {
  id: string;
  code: string;
  name: string;
  attended: number;
  total: number;
  type: ClassType;
  credits: number;
  labWeight: number; // e.g. 1 for theory, 2 for 2-hour lab sessions
  faculty?: string;
  room?: string;
  color?: string; // Eye-friendly pastel/slate color identifier
}

export interface TimetableSlot {
  id: string;
  day: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string;   // "10:00"
  subjectId: string;
  room?: string;
  type: ClassType;
}

export interface AttendanceRecord {
  id: string;
  date: string; // "YYYY-MM-DD"
  timestamp: number;
  subjectId: string;
  slotId?: string;
  status: AttendanceStatus;
  units: number; // usually 1, or labWeight if lab
  note?: string;
}

export interface StudentProfile {
  name: string;
  rollNumber: string;
  semester: string;
  program: string;
  institution: string;
  targetPercentage: number; // e.g., 75 or 80
}

export interface AttendanceAnalytics {
  currentPercentage: number;
  totalAttended: number;
  totalClasses: number;
  status: 'safe' | 'warning' | 'critical';
  classesNeededForTarget: number;
  safeClassesToBunk: number;
}
