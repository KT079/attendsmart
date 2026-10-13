import React, { useState, useEffect } from 'react';
import { 
  Subject, 
  TimetableSlot, 
  AttendanceRecord, 
  StudentProfile,
  AttendanceStatus 
} from './types/attendance';
import { 
  DEFAULT_PROFILE, 
  DEFAULT_SUBJECTS, 
  DEFAULT_TIMETABLE_SLOTS, 
  DEFAULT_ATTENDANCE_LOGS 
} from './data/defaultData';
import { calculateOverallStats } from './utils/attendanceCalculations';
import { Header, ActiveTab } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TimetableTracker } from './components/TimetableTracker';
import { SubjectManager } from './components/SubjectManager';
import { AttendanceLogView } from './components/AttendanceLogView';
import { ReportSyncView } from './components/ReportSyncView';
import { AddTimetableSlotModal } from './components/AddTimetableSlotModal';
import { AddSubjectModal } from './components/AddSubjectModal';
import { SimulatorModal } from './components/SimulatorModal';

export default function App() {
  // Theme state: default to eye-friendly, calm light mode or saved preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('attendSmart_theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('attendSmart_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('attendSmart_theme', 'light');
    }
  }, [isDarkMode]);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Student profile state
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('attendSmart_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  useEffect(() => {
    localStorage.setItem('attendSmart_profile', JSON.stringify(profile));
  }, [profile]);

  // Subjects state
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('attendSmart_subjects');
    return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS;
  });

  useEffect(() => {
    localStorage.setItem('attendSmart_subjects', JSON.stringify(subjects));
  }, [subjects]);

  // Timetable slots state
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem('attendSmart_timetable');
    return saved ? JSON.parse(saved) : DEFAULT_TIMETABLE_SLOTS;
  });

  useEffect(() => {
    localStorage.setItem('attendSmart_timetable', JSON.stringify(timetableSlots));
  }, [timetableSlots]);

  // Attendance history logs state
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('attendSmart_logs');
    return saved ? JSON.parse(saved) : DEFAULT_ATTENDANCE_LOGS;
  });

  useEffect(() => {
    localStorage.setItem('attendSmart_logs', JSON.stringify(attendanceLogs));
  }, [attendanceLogs]);

  // Modals state
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotToEdit, setSlotToEdit] = useState<TimetableSlot | null>(null);

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);

  const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);

  // Overall attendance percentage calculation
  const overallStats = calculateOverallStats(subjects, profile.targetPercentage);

  // -------------------------------------------------------------
  // ACCURATE ATTENDANCE RECORDING & ROLLBACK MATH
  // -------------------------------------------------------------

  const getAttendanceWeights = (status: AttendanceStatus, units: number) => {
    switch (status) {
      case 'present':
      case 'excused':
        return { attended: units, total: units };
      case 'absent':
        return { attended: 0, total: units };
      case 'cancelled':
        return { attended: 0, total: 0 };
    }
  };

  const handleMarkAttendance = (
    subjectId: string, 
    status: AttendanceStatus, 
    slotId?: string,
    customDate?: string
  ) => {
    const targetDateIso = customDate || new Date().toISOString().split('T')[0];
    const targetSubject = subjects.find(s => s.id === subjectId);
    if (!targetSubject) return;

    const units = targetSubject.type === 'lab' ? (targetSubject.labWeight || 2) : 1;

    // Check if an entry already exists for this slot/subject on target date
    const existingIndex = attendanceLogs.findIndex(
      l => l.date === targetDateIso && (slotId ? l.slotId === slotId : l.subjectId === subjectId)
    );

    if (existingIndex >= 0) {
      const oldLog = attendanceLogs[existingIndex];
      if (oldLog.status === status) return; // already identical

      const oldWeights = getAttendanceWeights(oldLog.status, oldLog.units);
      const newWeights = getAttendanceWeights(status, units);

      const deltaAttended = newWeights.attended - oldWeights.attended;
      const deltaTotal = newWeights.total - oldWeights.total;

      setSubjects(prev => prev.map(s => {
        if (s.id === subjectId) {
          const nextAttended = Math.max(0, s.attended + deltaAttended);
          const nextTotal = Math.max(nextAttended, s.total + deltaTotal);
          return {
            ...s,
            attended: nextAttended,
            total: nextTotal,
          };
        }
        return s;
      }));

      // Update log record
      setAttendanceLogs(prev => {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          status,
          units,
          timestamp: Date.now(),
        };
        return copy;
      });

    } else {
      // New attendance mark for target date
      const newWeights = getAttendanceWeights(status, units);

      const newRecord: AttendanceRecord = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        date: targetDateIso,
        timestamp: Date.now(),
        subjectId,
        slotId,
        status,
        units,
      };

      setAttendanceLogs(prev => [newRecord, ...prev]);

      // Update subject counts
      setSubjects(prev => prev.map(s => {
        if (s.id === subjectId) {
          const nextAttended = s.attended + newWeights.attended;
          const nextTotal = s.total + newWeights.total;
          return {
            ...s,
            attended: nextAttended,
            total: nextTotal,
          };
        }
        return s;
      }));
    }
  };

  const handleRemoveLogForSlot = (slotId: string, date: string) => {
    const existing = attendanceLogs.find(l => l.slotId === slotId && l.date === date);
    if (!existing) return;

    const weights = getAttendanceWeights(existing.status, existing.units);

    // Rollback subject counts
    setSubjects(prev => prev.map(s => {
      if (s.id === existing.subjectId) {
        const nextAttended = Math.max(0, s.attended - weights.attended);
        const nextTotal = Math.max(nextAttended, s.total - weights.total);
        return {
          ...s,
          attended: nextAttended,
          total: nextTotal,
        };
      }
      return s;
    }));

    setAttendanceLogs(prev => prev.filter(l => l.id !== existing.id));
  };

  const handleDeleteLog = (logId: string) => {
    const log = attendanceLogs.find(l => l.id === logId);
    if (!log) return;

    const weights = getAttendanceWeights(log.status, log.units);

    setSubjects(prev => prev.map(s => {
      if (s.id === log.subjectId) {
        const nextAttended = Math.max(0, s.attended - weights.attended);
        const nextTotal = Math.max(nextAttended, s.total - weights.total);
        return {
          ...s,
          attended: nextAttended,
          total: nextTotal,
        };
      }
      return s;
    }));

    setAttendanceLogs(prev => prev.filter(l => l.id !== logId));
  };

  const handleClearAllLogs = () => {
    if (window.confirm('Are you sure you want to clear all recorded daily attendance history?')) {
      setAttendanceLogs([]);
    }
  };

  const handleQuickAdjustAttendance = (subjectId: string, attendedDelta: number, totalDelta: number) => {
    setSubjects(prev => prev.map(s => {
      if (s.id === subjectId) {
        const nextAttended = Math.max(0, s.attended + attendedDelta);
        const nextTotal = Math.max(nextAttended, s.total + totalDelta);
        return { ...s, attended: nextAttended, total: nextTotal };
      }
      return s;
    }));
  };

  // -------------------------------------------------------------
  // TIMETABLE CRUD
  // -------------------------------------------------------------

  const handleSaveSlot = (slotData: Omit<TimetableSlot, 'id'>, slotId?: string) => {
    if (slotId) {
      setTimetableSlots(prev => prev.map(s => s.id === slotId ? { ...slotData, id: slotId } : s));
    } else {
      const newSlot: TimetableSlot = {
        ...slotData,
        id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      };
      setTimetableSlots(prev => [...prev, newSlot]);
    }
  };

  const handleDeleteSlot = (slotId: string) => {
    setTimetableSlots(prev => prev.filter(s => s.id !== slotId));
  };

  // -------------------------------------------------------------
  // SUBJECT CRUD
  // -------------------------------------------------------------

  const handleSaveSubject = (subjectData: Omit<Subject, 'id'>, subjectId?: string) => {
    if (subjectId) {
      setSubjects(prev => prev.map(s => s.id === subjectId ? { ...subjectData, id: subjectId } : s));
    } else {
      const newSubject: Subject = {
        ...subjectData,
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      };
      setSubjects(prev => [...prev, newSubject]);
    }
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (window.confirm('Delete this course? Associated timetable slots and logs will also be removed.')) {
      setSubjects(prev => prev.filter(s => s.id !== subjectId));
      setTimetableSlots(prev => prev.filter(s => s.subjectId !== subjectId));
      setAttendanceLogs(prev => prev.filter(l => l.subjectId !== subjectId));
    }
  };

  const handleImportSubjects = (newSubjects: Subject[]) => {
    setSubjects(newSubjects);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all semester courses, weekly timetable, and logs back to default demo state?')) {
      setProfile(DEFAULT_PROFILE);
      setSubjects(DEFAULT_SUBJECTS);
      setTimetableSlots(DEFAULT_TIMETABLE_SLOTS);
      setAttendanceLogs(DEFAULT_ATTENDANCE_LOGS);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        setProfile={setProfile}
        onOpenSimulator={() => setIsSimulatorModalOpen(true)}
        onResetData={handleResetData}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        overallPercentage={overallStats.currentPercentage}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            subjects={subjects}
            timetableSlots={timetableSlots}
            profile={profile}
            attendanceLogs={attendanceLogs}
            onMarkAttendance={(subjectId, status, slotId) => handleMarkAttendance(subjectId, status, slotId)}
            onNavigateToTab={setActiveTab}
            onOpenSimulator={() => setIsSimulatorModalOpen(true)}
          />
        )}

        {activeTab === 'timetable' && (
          <TimetableTracker
            subjects={subjects}
            timetableSlots={timetableSlots}
            attendanceLogs={attendanceLogs}
            onMarkAttendance={handleMarkAttendance}
            onRemoveLogForSlot={handleRemoveLogForSlot}
            onAddSlot={() => {
              setSlotToEdit(null);
              setIsSlotModalOpen(true);
            }}
            onEditSlot={(slot) => {
              setSlotToEdit(slot);
              setIsSlotModalOpen(true);
            }}
            onDeleteSlot={handleDeleteSlot}
          />
        )}

        {activeTab === 'subjects' && (
          <SubjectManager
            subjects={subjects}
            profile={profile}
            onAddSubject={() => {
              setSubjectToEdit(null);
              setIsSubjectModalOpen(true);
            }}
            onEditSubject={(subject) => {
              setSubjectToEdit(subject);
              setIsSubjectModalOpen(true);
            }}
            onDeleteSubject={handleDeleteSubject}
            onQuickAdjustAttendance={handleQuickAdjustAttendance}
            onOpenSimulator={() => setIsSimulatorModalOpen(true)}
          />
        )}

        {activeTab === 'logs' && (
          <AttendanceLogView
            logs={attendanceLogs}
            subjects={subjects}
            onDeleteLog={handleDeleteLog}
            onClearAllLogs={handleClearAllLogs}
          />
        )}

        {activeTab === 'reports' && (
          <ReportSyncView
            subjects={subjects}
            timetableSlots={timetableSlots}
            profile={profile}
            attendanceLogs={attendanceLogs}
            onImportSubjects={handleImportSubjects}
          />
        )}
      </main>

      {/* Modals */}
      <AddTimetableSlotModal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        subjects={subjects}
        existingSlots={timetableSlots}
        slotToEdit={slotToEdit}
        onSaveSlot={handleSaveSlot}
      />

      <AddSubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        subjectToEdit={subjectToEdit}
        onSaveSubject={handleSaveSubject}
      />

      <SimulatorModal
        isOpen={isSimulatorModalOpen}
        onClose={() => setIsSimulatorModalOpen(false)}
        subjects={subjects}
        profile={profile}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 py-5 bg-white/70 dark:bg-slate-900/60 mt-12 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p>
            AttendSmart · Student Attendance & Progress Tracker · {profile.institution}
          </p>
          <div className="flex items-center gap-3">
            <span>Minimum Policy: {profile.targetPercentage}%</span>
            <span aria-hidden="true">·</span>
            <span>Total Units: {overallStats.totalClasses}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
