import React, { useState, useEffect } from 'react';
import { 
  Subject, 
  TimetableSlot, 
  DayOfWeek, 
  AttendanceRecord,
  AttendanceStatus 
} from '../types/attendance';
import { 
  DAYS_OF_WEEK, 
  getCurrentDayOfWeek, 
  getDayFromDate,
  getDateForDayOfCurrentWeek,
  getSlotLiveStatus,
  getLiveScheduleSnapshot,
  getSubjectColorTheme,
  formatTime12h,
  formatDuration,
  timeToMinutes
} from '../utils/attendanceCalculations';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Edit3, 
  MapPin,
  User,
  RotateCcw,
  Layers,
  Sparkles,
  Ban,
  CheckCheck,
  ChevronRight
} from 'lucide-react';

interface TimetableTrackerProps {
  subjects: Subject[];
  timetableSlots: TimetableSlot[];
  attendanceLogs: AttendanceRecord[];
  onMarkAttendance: (subjectId: string, status: AttendanceStatus, slotId?: string, customDate?: string) => void;
  onRemoveLogForSlot: (slotId: string, date: string) => void;
  onAddSlot: () => void;
  onEditSlot: (slot: TimetableSlot) => void;
  onDeleteSlot: (slotId: string) => void;
}

export const TimetableTracker: React.FC<TimetableTrackerProps> = ({
  subjects,
  timetableSlots,
  attendanceLogs,
  onMarkAttendance,
  onRemoveLogForSlot,
  onAddSlot,
  onEditSlot,
  onDeleteSlot,
}) => {
  const currentActualDay = getCurrentDayOfWeek();
  const todayIso = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => getDayFromDate(todayIso));
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Keep a live clock ticker (every 30 seconds) to refresh in-session / countdown statuses accurately
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number>(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTimeMinutes(now.getHours() * 60 + now.getMinutes());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // When date picker changes, synchronize day tab automatically
  const handleDateChange = (newDateStr: string) => {
    setSelectedDate(newDateStr);
    const derivedDay = getDayFromDate(newDateStr);
    setSelectedDay(derivedDay);
  };

  // When day tab is clicked, synchronize date picker to that day in the current week
  const handleDayTabClick = (day: DayOfWeek) => {
    setSelectedDay(day);
    const dateForDay = getDateForDayOfCurrentWeek(day);
    setSelectedDate(dateForDay);
  };

  // Filter and sort slots chronologically
  const daySlots = timetableSlots
    .filter(slot => slot.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Helper to find log for a specific slot on selected date
  const getLogForSlot = (slotId: string, subjectId: string) => {
    return attendanceLogs.find(
      log => log.date === selectedDate && (log.slotId === slotId || (log.subjectId === subjectId && !log.slotId))
    );
  };

  // Live snapshot calculation for today
  const liveSnapshot = getLiveScheduleSnapshot(timetableSlots, subjects);

  // Quick batch mark for the day
  const handleMarkAllDay = (status: AttendanceStatus) => {
    for (const slot of daySlots) {
      onMarkAttendance(slot.subjectId, status, slot.id, selectedDate);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Timetable & Scheduling Engine</span>
            {selectedDate === todayIso && (
              <span className="text-[11px] font-medium font-sans px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                Today
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Automated conflict detection, live class countdowns, and date-synchronized attendance logging
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Daily Tracker
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Weekly Schedule
            </button>
          </div>

          {/* Add Slot Button */}
          <button
            onClick={onAddSlot}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-md transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Class Slot</span>
          </button>
        </div>
      </div>

      {/* Live Class Status Banner (If viewing today) */}
      {selectedDate === todayIso && (
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
            <div>
              {liveSnapshot.activeSlot ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    Currently In Session:
                  </span>
                  <span className="font-medium text-indigo-700 dark:text-indigo-300">
                    {liveSnapshot.activeSubject?.name} ({liveSnapshot.activeSubject?.code})
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">
                    {formatTime12h(liveSnapshot.activeSlot.startTime)}–{formatTime12h(liveSnapshot.activeSlot.endTime)} ({formatDuration(liveSnapshot.activeRemainingMinutes || 0)} left)
                  </span>
                </div>
              ) : liveSnapshot.nextSlot ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    Next Upcoming Session:
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {liveSnapshot.nextSubject?.name} ({liveSnapshot.nextSubject?.code})
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                    Starts in {formatDuration(liveSnapshot.nextMinutesUntilStart || 0)} at {formatTime12h(liveSnapshot.nextSlot.startTime)}
                  </span>
                  <span className="text-slate-400">({liveSnapshot.nextSlot.room || 'Room TBA'})</span>
                </div>
              ) : (
                <span className="text-slate-600 dark:text-slate-400">
                  All scheduled academic sessions for today have concluded.
                </span>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 self-end sm:self-center">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Live Clock: {formatTime12h(`${Math.floor(currentTimeMinutes / 60)}:${currentTimeMinutes % 60}`)}</span>
          </div>
        </div>
      )}

      {/* Date & Day Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* Day Selector Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay === day;
            const isToday = currentActualDay === day;
            const count = timetableSlots.filter(s => s.day === day).length;

            return (
              <button
                key={day}
                onClick={() => handleDayTabClick(day)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{day.substring(0, 3)}</span>
                <span className={`text-[10px] px-1 rounded ${
                  isSelected 
                    ? 'bg-slate-800 text-slate-200 dark:bg-slate-200 dark:text-slate-800' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {count}
                </span>
                {isToday && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-emerald-500'}`} title="Today" />
                )}
              </button>
            );
          })}
        </div>

        {/* Date Selector & "Today" Quick Jump */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => {
              handleDateChange(todayIso);
            }}
            className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-medium hover:underline flex items-center gap-1"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Today's Date</span>
          </button>
          
          <input
            type="date"
            aria-label="Select date for timetable tracking"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
      </div>

      {/* VIEW MODE 1: DAILY DETAIL & QUICK MARK VIEW */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{selectedDay}'s Classes</span>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  ({daySlots.length} scheduled session{daySlots.length === 1 ? '' : 's'})
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Active Date: {selectedDate}
              </p>
            </div>

            {/* Batch actions if slots exist */}
            {daySlots.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 text-[11px]">Batch:</span>
                <button
                  onClick={() => handleMarkAllDay('present')}
                  className="px-2 py-1 text-[11px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/40 rounded transition-colors"
                >
                  Mark All Present
                </button>
                <button
                  onClick={() => handleMarkAllDay('absent')}
                  className="px-2 py-1 text-[11px] font-medium text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-800/40 rounded transition-colors"
                >
                  Mark All Absent
                </button>
              </div>
            )}
          </div>

          {daySlots.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <Calendar className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No Classes Scheduled for {selectedDay}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                No lecture periods or laboratory sessions have been placed into this day's slot matrix.
              </p>
              <button
                onClick={onAddSlot}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-200/70 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Class Slot to {selectedDay}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {daySlots.map((slot, index) => {
                const subject = subjects.find(s => s.id === slot.subjectId);
                if (!subject) return null;

                const liveStatus = getSlotLiveStatus(slot.day, slot.startTime, slot.endTime, selectedDate);
                const colorTheme = getSubjectColorTheme(subject.color);
                const log = getLogForSlot(slot.id, subject.id);

                return (
                  <div
                    key={slot.id}
                    className={`p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-lg border transition-all ${
                      liveStatus === 'in-progress'
                        ? 'border-indigo-400/90 dark:border-indigo-500/80 bg-indigo-50/20 dark:bg-indigo-950/15 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      
                      {/* Left: Time & Subject info */}
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-28 shrink-0">
                          <div className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100">
                            {formatTime12h(slot.startTime)}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            to {formatTime12h(slot.endTime)}
                          </div>

                          <div className="mt-1">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded ${
                              liveStatus === 'in-progress'
                                ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/60 dark:text-indigo-200 font-semibold'
                                : liveStatus === 'completed'
                                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                : liveStatus === 'upcoming'
                                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'bg-slate-50 text-slate-500 dark:bg-slate-800/40'
                            }`}>
                              {liveStatus === 'in-progress' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />}
                              <span>
                                {liveStatus === 'in-progress' ? 'In Session' : 
                                 liveStatus === 'completed' ? 'Passed' : 
                                 liveStatus === 'upcoming' ? 'Upcoming' : 
                                 liveStatus === 'past-date' ? 'Past Date' : 'Future'}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Subject title & details */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
                              {subject.code}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                            <span className={`text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded ${colorTheme.badge}`}>
                              {slot.type}
                              {slot.type === 'lab' && ` (${subject.labWeight}x weight)`}
                            </span>
                          </div>

                          <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
                            {subject.name}
                          </h4>

                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{slot.room || subject.room || 'Room TBA'}</span>
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{subject.faculty || 'Faculty'}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions & Attendance Logger */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        
                        {/* Attendance State for this session */}
                        {log ? (
                          <div className="flex items-center gap-2 p-1.5 px-3 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                            <div className="flex items-center gap-1.5 font-medium">
                              {log.status === 'present' ? (
                                <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                              ) : log.status === 'cancelled' ? (
                                <Ban className="w-4 h-4 text-slate-500" />
                              ) : (
                                <X className="w-4 h-4 text-rose-700 dark:text-rose-400" />
                              )}
                              
                              <span className={
                                log.status === 'present' 
                                  ? 'text-emerald-800 dark:text-emerald-400 font-semibold' 
                                  : log.status === 'cancelled'
                                  ? 'text-slate-600 dark:text-slate-400 font-semibold'
                                  : 'text-rose-800 dark:text-rose-400 font-semibold'
                              }>
                                {log.status.toUpperCase()}
                              </span>

                              {slot.type === 'lab' && log.status !== 'cancelled' && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ({log.units} units)
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => onRemoveLogForSlot(slot.id, selectedDate)}
                              className="ml-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded transition-colors"
                              title="Reset/Undo attendance mark for this slot"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onMarkAttendance(subject.id, 'present', slot.id, selectedDate)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded border border-emerald-200 dark:border-emerald-800/50 transition-colors flex items-center gap-1"
                              title="Record attendance as Present"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Present</span>
                            </button>
                            
                            <button
                              onClick={() => onMarkAttendance(subject.id, 'absent', slot.id, selectedDate)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded border border-rose-200 dark:border-rose-800/50 transition-colors flex items-center gap-1"
                              title="Record attendance as Absent"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Absent</span>
                            </button>

                            <button
                              onClick={() => onMarkAttendance(subject.id, 'cancelled', slot.id, selectedDate)}
                              className="px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 rounded border border-slate-200 dark:border-slate-700 transition-colors"
                              title="Mark class cancelled / faculty on leave (no attendance penalty)"
                            >
                              Cancelled
                            </button>
                          </div>
                        )}

                        {/* Slot Edit/Delete tools */}
                        <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-800">
                          <button
                            onClick={() => onEditSlot(slot)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit schedule slot"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteSlot(slot.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete schedule slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: FULL WEEKLY SCHEDULE MATRIX */}
      {viewMode === 'week' && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <span>Full Weekly Schedule Matrix</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete semester timetable across Monday to Saturday with synchronized room allocations
              </p>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {timetableSlots.length} Total Slots
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  <th className="py-2.5 px-3 w-28 border-r border-slate-200 dark:border-slate-800">Day</th>
                  <th className="py-2.5 px-3">Scheduled Classes & Room Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {DAYS_OF_WEEK.map((day) => {
                  const slotsForDay = timetableSlots
                    .filter(s => s.day === day)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime));
                  const isToday = currentActualDay === day;

                  return (
                    <tr 
                      key={day} 
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                        isToday ? 'bg-slate-50/70 dark:bg-slate-850' : ''
                      }`}
                    >
                      <td className="py-3 px-3 align-top font-medium border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span>{day}</span>
                          {isToday && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Today" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                          {slotsForDay.length} {slotsForDay.length === 1 ? 'class' : 'classes'}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {slotsForDay.length === 0 ? (
                          <span className="text-slate-400 italic text-[11px]">No classes scheduled</span>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                            {slotsForDay.map(slot => {
                              const subject = subjects.find(s => s.id === slot.subjectId);
                              if (!subject) return null;
                              const colorTheme = getSubjectColorTheme(subject.color);

                              return (
                                <div 
                                  key={slot.id}
                                  className="p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:shadow-xs transition-shadow"
                                >
                                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                    <span className="font-mono font-medium">{formatTime12h(slot.startTime)}</span>
                                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                                      {slot.type}
                                    </span>
                                  </div>

                                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs mt-1 truncate" title={subject.name}>
                                    {subject.name}
                                  </p>

                                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                                    <span>{subject.code}</span>
                                    <span>{slot.room || subject.room || 'TBA'}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};
