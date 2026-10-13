import { Subject, TimetableSlot, AttendanceRecord, StudentProfile } from '../types/attendance';

export const DEFAULT_PROFILE: StudentProfile = {
  name: 'Alex Rivera',
  rollNumber: 'CS-2024-089',
  semester: 'Semester V (Fall 2026)',
  program: 'B.S. in Computer Science',
  institution: 'Faculty of Engineering & Technology',
  targetPercentage: 75,
};

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'sub-1',
    code: 'CS-501',
    name: 'Data Structures & Algorithms',
    attended: 28,
    total: 32,
    type: 'theory',
    credits: 4,
    labWeight: 1,
    faculty: 'Dr. Aris Thorne',
    room: 'Hall 204',
    color: 'indigo',
  },
  {
    id: 'sub-2',
    code: 'CS-502',
    name: 'Operating Systems Architecture',
    attended: 21,
    total: 30,
    type: 'theory',
    credits: 4,
    labWeight: 1,
    faculty: 'Prof. Elena Rostova',
    room: 'Lecture Hall 102',
    color: 'rose',
  },
  {
    id: 'sub-3',
    code: 'CS-503',
    name: 'Database Management Systems',
    attended: 25,
    total: 29,
    type: 'theory',
    credits: 3,
    labWeight: 1,
    faculty: 'Dr. Marcus Vance',
    room: 'Hall 310',
    color: 'sage',
  },
  {
    id: 'sub-4',
    code: 'CS-504',
    name: 'Computer Networks & Protocols',
    attended: 19,
    total: 25,
    type: 'theory',
    credits: 3,
    labWeight: 1,
    faculty: 'Prof. Maya Lin',
    room: 'Hall 108',
    color: 'ochre',
  },
  {
    id: 'sub-5',
    code: 'CS-505L',
    name: 'Systems & Networks Practicum',
    attended: 14,
    total: 16,
    type: 'lab',
    credits: 2,
    labWeight: 2,
    faculty: 'Dr. Aris Thorne',
    room: 'Systems Lab 3',
    color: 'teal',
  },
  {
    id: 'sub-6',
    code: 'CS-506L',
    name: 'Cloud & Database Lab',
    attended: 12,
    total: 16,
    type: 'lab',
    credits: 2,
    labWeight: 2,
    faculty: 'Dr. Marcus Vance',
    room: 'Data Center Lab',
    color: 'cyan',
  },
  {
    id: 'sub-7',
    code: 'MA-501',
    name: 'Discrete Math & Probability',
    attended: 27,
    total: 28,
    type: 'theory',
    credits: 3,
    labWeight: 1,
    faculty: 'Dr. Kevin Mercer',
    room: 'Hall 401',
    color: 'violet',
  },
];

export const DEFAULT_TIMETABLE_SLOTS: TimetableSlot[] = [
  // Monday
  { id: 'slot-mon-1', day: 'Monday', startTime: '09:00', endTime: '10:00', subjectId: 'sub-1', type: 'theory', room: 'Hall 204' },
  { id: 'slot-mon-2', day: 'Monday', startTime: '10:00', endTime: '11:00', subjectId: 'sub-2', type: 'theory', room: 'Hall 102' },
  { id: 'slot-mon-3', day: 'Monday', startTime: '11:15', endTime: '12:15', subjectId: 'sub-3', type: 'theory', room: 'Hall 310' },
  { id: 'slot-mon-4', day: 'Monday', startTime: '13:30', endTime: '15:30', subjectId: 'sub-5', type: 'lab', room: 'Systems Lab 3' },

  // Tuesday
  { id: 'slot-tue-1', day: 'Tuesday', startTime: '09:00', endTime: '10:00', subjectId: 'sub-4', type: 'theory', room: 'Hall 108' },
  { id: 'slot-tue-2', day: 'Tuesday', startTime: '10:00', endTime: '11:00', subjectId: 'sub-7', type: 'theory', room: 'Hall 401' },
  { id: 'slot-tue-3', day: 'Tuesday', startTime: '11:15', endTime: '12:15', subjectId: 'sub-1', type: 'theory', room: 'Hall 204' },
  { id: 'slot-tue-4', day: 'Tuesday', startTime: '13:30', endTime: '15:30', subjectId: 'sub-6', type: 'lab', room: 'Data Center Lab' },

  // Wednesday
  { id: 'slot-wed-1', day: 'Wednesday', startTime: '09:00', endTime: '10:00', subjectId: 'sub-2', type: 'theory', room: 'Hall 102' },
  { id: 'slot-wed-2', day: 'Wednesday', startTime: '10:00', endTime: '11:00', subjectId: 'sub-3', type: 'theory', room: 'Hall 310' },
  { id: 'slot-wed-3', day: 'Wednesday', startTime: '11:15', endTime: '12:15', subjectId: 'sub-7', type: 'theory', room: 'Hall 401' },
  { id: 'slot-wed-4', day: 'Wednesday', startTime: '12:15', endTime: '13:15', subjectId: 'sub-4', type: 'theory', room: 'Hall 108' },

  // Thursday
  { id: 'slot-thu-1', day: 'Thursday', startTime: '09:00', endTime: '10:00', subjectId: 'sub-1', type: 'theory', room: 'Hall 204' },
  { id: 'slot-thu-2', day: 'Thursday', startTime: '10:00', endTime: '11:00', subjectId: 'sub-2', type: 'theory', room: 'Hall 102' },
  { id: 'slot-thu-3', day: 'Thursday', startTime: '11:15', endTime: '12:15', subjectId: 'sub-4', type: 'theory', room: 'Hall 108' },
  { id: 'slot-thu-4', day: 'Thursday', startTime: '13:30', endTime: '15:30', subjectId: 'sub-5', type: 'lab', room: 'Systems Lab 3' },

  // Friday
  { id: 'slot-fri-1', day: 'Friday', startTime: '09:00', endTime: '10:00', subjectId: 'sub-3', type: 'theory', room: 'Hall 310' },
  { id: 'slot-fri-2', day: 'Friday', startTime: '10:00', endTime: '11:00', subjectId: 'sub-7', type: 'theory', room: 'Hall 401' },
  { id: 'slot-fri-3', day: 'Friday', startTime: '11:15', endTime: '12:15', subjectId: 'sub-1', type: 'theory', room: 'Hall 204' },
  { id: 'slot-fri-4', day: 'Friday', startTime: '13:30', endTime: '14:30', subjectId: 'sub-2', type: 'tutorial', room: 'Hall 102' },
];

export const DEFAULT_ATTENDANCE_LOGS: AttendanceRecord[] = [
  { id: 'log-1', date: '2026-09-29', timestamp: Date.now() - 3600000 * 2, subjectId: 'sub-1', status: 'present', units: 1, note: 'Morning lecture' },
  { id: 'log-2', date: '2026-09-29', timestamp: Date.now() - 3600000 * 1, subjectId: 'sub-2', status: 'absent', units: 1, note: 'Missed due to train delay' },
  { id: 'log-3', date: '2026-09-28', timestamp: Date.now() - 86400000, subjectId: 'sub-3', status: 'present', units: 1 },
  { id: 'log-4', date: '2026-09-28', timestamp: Date.now() - 86400000, subjectId: 'sub-5', status: 'present', units: 2, note: 'Socket programming lab' },
  { id: 'log-5', date: '2026-09-27', timestamp: Date.now() - 86400000 * 2, subjectId: 'sub-4', status: 'present', units: 1 },
  { id: 'log-6', date: '2026-09-26', timestamp: Date.now() - 86400000 * 3, subjectId: 'sub-7', status: 'present', units: 1 },
  { id: 'log-7', date: '2026-09-25', timestamp: Date.now() - 86400000 * 4, subjectId: 'sub-2', status: 'absent', units: 1, note: 'Sick leave' },
  { id: 'log-8', date: '2026-09-25', timestamp: Date.now() - 86400000 * 4, subjectId: 'sub-1', status: 'present', units: 1 },
];
