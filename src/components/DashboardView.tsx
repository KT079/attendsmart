import React from 'react';
import { 
  Subject, 
  TimetableSlot, 
  StudentProfile, 
  AttendanceRecord,
  AttendanceStatus 
} from '../types/attendance';
import { 
  calculateAttendanceStats, 
  calculateOverallStats,
  getCurrentDayOfWeek,
  getSlotLiveStatus,
  getSubjectColorTheme,
  formatTime12h
} from '../utils/attendanceCalculations';
import { 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  Plus, 
  Minus, 
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Check,
  X,
  Ban
} from 'lucide-react';

interface DashboardViewProps {
  subjects: Subject[];
  timetableSlots: TimetableSlot[];
  profile: StudentProfile;
  attendanceLogs: AttendanceRecord[];
  onMarkAttendance: (subjectId: string, status: AttendanceStatus, slotId?: string) => void;
  onNavigateToTab: (tab: 'timetable' | 'subjects' | 'logs' | 'reports') => void;
  onOpenSimulator: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  subjects,
  timetableSlots,
  profile,
  attendanceLogs,
  onMarkAttendance,
  onNavigateToTab,
  onOpenSimulator,
}) => {
  const overallStats = calculateOverallStats(subjects, profile.targetPercentage);
  const currentDay = getCurrentDayOfWeek();
  const todayIso = new Date().toISOString().split('T')[0];

  // Find today's slots and sort chronologically
  const todaySlots = timetableSlots
    .filter(slot => slot.day === currentDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Identify subjects below target threshold
  const criticalSubjects = subjects.filter(sub => {
    const stats = calculateAttendanceStats(sub.attended, sub.total, profile.targetPercentage);
    return stats.status === 'critical' || stats.status === 'warning';
  });

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Semester Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Attendance Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {profile.name} · {profile.rollNumber} · {profile.semester}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTab('timetable')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>View Full Timetable</span>
          </button>
        </div>
      </div>

      {/* Threshold Alert Banner (If Any Subject Is Critical / Approaching Shortage) */}
      {criticalSubjects.length > 0 && (
        <div className="p-4 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-semibold">
                Attention Required: {criticalSubjects.length} {criticalSubjects.length === 1 ? 'Course' : 'Courses'} Below {profile.targetPercentage}% Minimum
              </h4>
              <div className="text-xs text-amber-800/90 dark:text-amber-300/90 space-y-1 mt-1">
                {criticalSubjects.map(sub => {
                  const stats = calculateAttendanceStats(sub.attended, sub.total, profile.targetPercentage);
                  return (
                    <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-0.5 border-t border-amber-200/50 dark:border-amber-900/30 first:border-0 first:pt-0">
                      <span>
                        <strong className="font-semibold text-amber-950 dark:text-amber-100">{sub.name} ({sub.code})</strong>: Currently at{' '}
                        <span className="font-mono font-bold">{stats.currentPercentage}%</span> ({sub.attended}/{sub.total})
                      </span>
                      <span className="font-medium text-rose-800 dark:text-rose-300">
                        Attend next {stats.classesNeededForTarget} consecutive {stats.classesNeededForTarget === 1 ? 'class' : 'classes'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metric Cards (Single-Elevation, Serene Color Grading) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Aggregate Attendance */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Overall Attendance</span>
            <ShieldCheck className={`w-4 h-4 ${
              overallStats.status === 'safe' 
                ? 'text-emerald-700 dark:text-emerald-400' 
                : 'text-amber-700 dark:text-amber-400'
            }`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {overallStats.currentPercentage}%
            </span>
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
              overallStats.status === 'safe' 
                ? 'text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40' 
                : 'text-rose-800 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40'
            }`}>
              {overallStats.status === 'safe' ? 'Compliant' : 'Shortage'}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Semester Units</span>
            <span className="font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">
              {overallStats.totalAttended} / {overallStats.totalClasses}
            </span>
          </div>
        </div>

        {/* Metric 2: Safe Bunks Allowance */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Safe Skips Allowed</span>
            <TrendingUp className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {overallStats.safeClassesToBunk}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              classes total
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Minimum Baseline</span>
            <span className="font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">
              {profile.targetPercentage}% required
            </span>
          </div>
        </div>

        {/* Metric 3: Courses at Risk */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Watchlist Courses</span>
            <AlertTriangle className={`w-4 h-4 ${
              criticalSubjects.length > 0 ? 'text-amber-600' : 'text-slate-400'
            }`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${
              criticalSubjects.length > 0 
                ? 'text-amber-700 dark:text-amber-300' 
                : 'text-slate-900 dark:text-slate-100'
            }`}>
              {criticalSubjects.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              of {subjects.length} courses
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Clearance State</span>
            <span className={`font-medium ${criticalSubjects.length === 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
              {criticalSubjects.length > 0 ? 'Action Needed' : 'All Clear'}
            </span>
          </div>
        </div>

        {/* Metric 4: Today's Classes */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Today ({currentDay})</span>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {todaySlots.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              sessions scheduled
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Schedule Tab</span>
            <button 
              onClick={() => onNavigateToTab('timetable')}
              className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline font-medium"
            >
              Open Timetable →
            </button>
          </div>
        </div>

      </div>

      {/* Today's Schedule Live Action Strip */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Today's Schedule ({currentDay})
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              · Quick Attendance Logger
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {todayIso}
          </span>
        </div>

        {todaySlots.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            No academic sessions scheduled for {currentDay}. Use this time to review coursework.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {todaySlots.map(slot => {
              const subject = subjects.find(s => s.id === slot.subjectId);
              if (!subject) return null;

              const liveStatus = getSlotLiveStatus(slot.day, slot.startTime, slot.endTime, todayIso);
              const colorTheme = getSubjectColorTheme(subject.color);

              // Check if already logged today
              const todayLog = attendanceLogs.find(
                log => log.date === todayIso && (log.slotId === slot.id || log.subjectId === subject.id)
              );

              return (
                <div 
                  key={slot.id} 
                  className={`p-3 rounded-md border text-xs transition-all ${
                    liveStatus === 'in-progress' 
                      ? 'border-indigo-400/80 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs' 
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-slate-600 dark:text-slate-400 font-medium">
                      {formatTime12h(slot.startTime)}–{formatTime12h(slot.endTime)}
                    </span>
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                      liveStatus === 'in-progress' 
                        ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/60 dark:text-indigo-200 font-semibold' 
                        : liveStatus === 'completed'
                        ? 'bg-slate-200/70 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                    }`}>
                      {liveStatus === 'in-progress' ? 'In Session' : liveStatus === 'completed' ? 'Passed' : 'Upcoming'}
                    </span>
                  </div>

                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate" title={subject.name}>
                    {subject.name}
                  </p>
                  
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between mt-1">
                    <span>{subject.code}</span>
                    <span>{slot.room || subject.room}</span>
                  </div>

                  {/* 1-Click Action for This Slot */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200/70 dark:border-slate-700/60 flex items-center gap-1.5">
                    {todayLog ? (
                      <div className="w-full flex items-center justify-between text-[11px]">
                        <span className={`font-semibold flex items-center gap-1 ${
                          todayLog.status === 'present' 
                            ? 'text-emerald-700 dark:text-emerald-400' 
                            : todayLog.status === 'cancelled'
                            ? 'text-slate-600 dark:text-slate-400'
                            : 'text-rose-700 dark:text-rose-400'
                        }`}>
                          {todayLog.status === 'present' ? <Check className="w-3 h-3" /> : todayLog.status === 'cancelled' ? <Ban className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>{todayLog.status.toUpperCase()}</span>
                        </span>
                        <button
                          onClick={() => onMarkAttendance(subject.id, todayLog.status === 'present' ? 'absent' : 'present', slot.id)}
                          className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline text-[10px]"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => onMarkAttendance(subject.id, 'present', slot.id)}
                          className="flex-1 py-1 px-2 text-center text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 rounded border border-emerald-200 dark:border-emerald-800/50 font-medium transition-colors"
                        >
                          + Present
                        </button>
                        <button
                          onClick={() => onMarkAttendance(subject.id, 'absent', slot.id)}
                          className="flex-1 py-1 px-2 text-center text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded border border-rose-200 dark:border-rose-800/50 font-medium transition-colors"
                        >
                          + Absent
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Course Breakdown Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Course-Wise Progress Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time calculation with safe skip margins and required catch-up quotas
            </p>
          </div>
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1 text-xs text-indigo-700 dark:text-indigo-300 hover:underline font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate What-If</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(subject => {
            const stats = calculateAttendanceStats(subject.attended, subject.total, profile.targetPercentage);
            const colorTheme = getSubjectColorTheme(subject.color);

            return (
              <div 
                key={subject.id}
                className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Subject Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                        {subject.code} · {subject.type.toUpperCase()}
                        {subject.type === 'lab' && ` (${subject.labWeight}x weight)`}
                      </span>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5 line-clamp-1" title={subject.name}>
                        {subject.name}
                      </h4>
                    </div>

                    <span className={`text-base font-bold font-mono tabular-nums shrink-0 ${
                      stats.status === 'safe'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : stats.status === 'warning'
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-rose-700 dark:text-rose-400'
                    }`}>
                      {stats.currentPercentage}%
                    </span>
                  </div>

                  {/* Progress Bar (Muted & Eye-Friendly) */}
                  <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        stats.status === 'safe'
                          ? 'bg-emerald-600 dark:bg-emerald-500'
                          : stats.status === 'warning'
                          ? 'bg-amber-600 dark:bg-amber-500'
                          : 'bg-rose-600 dark:bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, stats.currentPercentage)}%` }}
                    />
                  </div>

                  {/* Counts & Status Breakdown */}
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Attended: <strong className="font-mono text-slate-800 dark:text-slate-200">{subject.attended}</strong> / {subject.total}
                    </span>
                    <span className="text-[11px]">
                      {subject.faculty || 'Faculty'}
                    </span>
                  </div>

                  {/* Advice Box */}
                  <div className={`mt-3 p-2.5 rounded text-xs ${
                    stats.status === 'safe'
                      ? 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60'
                      : 'bg-amber-50/70 dark:bg-amber-950/20 text-amber-950 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900/40'
                  }`}>
                    {stats.status === 'safe' ? (
                      <p>
                        Safe margin: Can safely miss <strong className="font-mono font-semibold text-emerald-800 dark:text-emerald-300">{stats.safeClassesToBunk}</strong> upcoming {stats.safeClassesToBunk === 1 ? 'class' : 'classes'} without dipping below {profile.targetPercentage}%.
                      </p>
                    ) : (
                      <p>
                        Action needed: Must attend next <strong className="font-mono font-semibold text-rose-800 dark:text-rose-300">{stats.classesNeededForTarget}</strong> consecutive {stats.classesNeededForTarget === 1 ? 'class' : 'classes'} to reach {profile.targetPercentage}%.
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Add/Remove Attendance Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">Record:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onMarkAttendance(subject.id, 'present')}
                      className="px-2.5 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded border border-emerald-200 dark:border-emerald-800/50 transition-colors flex items-center gap-1"
                      title="Add 1 present class"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Present</span>
                    </button>
                    <button
                      onClick={() => onMarkAttendance(subject.id, 'absent')}
                      className="px-2.5 py-1 text-xs font-medium text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded border border-rose-200 dark:border-rose-800/50 transition-colors flex items-center gap-1"
                      title="Add 1 absent class"
                    >
                      <Minus className="w-3 h-3" />
                      <span>Absent</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
