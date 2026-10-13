import { Subject, AttendanceAnalytics, TimetableSlot, DayOfWeek, AttendanceStatus } from '../types/attendance';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Calculates attendance analytics for a single subject or overall aggregate
 */
export function calculateAttendanceStats(
  attended: number,
  total: number,
  targetPercentage: number = 75
): AttendanceAnalytics {
  if (total <= 0) {
    return {
      currentPercentage: 100,
      totalAttended: 0,
      totalClasses: 0,
      status: 'safe',
      classesNeededForTarget: 0,
      safeClassesToBunk: 0,
    };
  }

  const currentPercentage = Number(((attended / total) * 100).toFixed(1));

  let status: 'safe' | 'warning' | 'critical';
  if (currentPercentage >= targetPercentage) {
    status = 'safe';
  } else if (currentPercentage >= targetPercentage - 5) {
    status = 'warning';
  } else {
    status = 'critical';
  }

  let classesNeededForTarget = 0;
  let safeClassesToBunk = 0;

  if (currentPercentage < targetPercentage) {
    // Formula: (target * (T + N) - (P + N)) <= 0 => N * (100 - target) >= target * T - 100 * P
    const numerator = targetPercentage * total - 100 * attended;
    const denominator = 100 - targetPercentage;
    if (denominator > 0) {
      classesNeededForTarget = Math.max(0, Math.ceil(numerator / denominator));
    }
  } else {
    // Formula: (P / (T + M)) * 100 >= target => target * M <= 100 * P - target * T
    const numerator = 100 * attended - targetPercentage * total;
    if (targetPercentage > 0) {
      safeClassesToBunk = Math.max(0, Math.floor(numerator / targetPercentage));
    }
  }

  return {
    currentPercentage,
    totalAttended: attended,
    totalClasses: total,
    status,
    classesNeededForTarget,
    safeClassesToBunk,
  };
}

/**
 * Calculates overall aggregate attendance across all subjects
 */
export function calculateOverallStats(
  subjects: Subject[],
  targetPercentage: number = 75
): AttendanceAnalytics {
  const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
  const totalClasses = subjects.reduce((sum, s) => sum + s.total, 0);
  return calculateAttendanceStats(totalAttended, totalClasses, targetPercentage);
}

/**
 * Converts "HH:MM" (24-hour) to minutes from midnight for sorting and collision checks
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  const hours = parts[0] || 0;
  const minutes = parts[1] || 0;
  return hours * 60 + minutes;
}

/**
 * Formats "09:00" or minutes to 12-hour readable format like "9:00 AM" or "2:30 PM"
 */
export function formatTime12h(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const hours = h || 0;
  const minutes = String(m || 0).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes} ${ampm}`;
}

/**
 * Formats minutes into readable human duration, e.g. "45m" or "1h 30m"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

/**
 * Checks if two time intervals overlap on the half-open interval: [startA, endA) and [startB, endB)
 */
export function doSlotsOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);
  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

/**
 * Verifies if a new or updated slot conflicts with existing slots on that day
 */
export function checkTimetableCollision(
  slot: Omit<TimetableSlot, 'id'>,
  existingSlots: TimetableSlot[],
  excludeSlotId?: string
): { hasCollision: boolean; conflictingSlot?: TimetableSlot; reason?: string } {
  const startMin = timeToMinutes(slot.startTime);
  const endMin = timeToMinutes(slot.endTime);

  if (endMin <= startMin) {
    return { 
      hasCollision: true, 
      reason: 'End time must be later than start time.' 
    };
  }

  if (endMin - startMin < 20) {
    return {
      hasCollision: true,
      reason: 'Class duration must be at least 20 minutes.',
    };
  }

  for (const existing of existingSlots) {
    if (excludeSlotId && existing.id === excludeSlotId) continue;
    if (existing.day !== slot.day) continue;

    if (doSlotsOverlap(slot.startTime, slot.endTime, existing.startTime, existing.endTime)) {
      return { 
        hasCollision: true, 
        conflictingSlot: existing,
        reason: `Overlaps with existing class scheduled from ${formatTime12h(existing.startTime)} to ${formatTime12h(existing.endTime)}.`,
      };
    }
  }

  return { hasCollision: false };
}

/**
 * Resolves day of week from a given ISO Date string "YYYY-MM-DD" accurately
 */
export function getDayFromDate(dateStr: string): DayOfWeek {
  if (!dateStr) return getCurrentDayOfWeek();
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, (month || 1) - 1, day || 1);
  const dayIdx = dateObj.getDay(); // 0 is Sunday, 1 is Monday ...
  const map: Record<number, DayOfWeek> = {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    0: 'Monday',
  };
  return map[dayIdx] || 'Monday';
}

/**
 * Calculates ISO "YYYY-MM-DD" for a specific DayOfWeek within the current active week
 */
export function getDateForDayOfCurrentWeek(targetDay: DayOfWeek, refDate: Date = new Date()): string {
  const dayIndexMap: Record<DayOfWeek, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const targetDayIdx = dayIndexMap[targetDay];
  const currentDayIdx = refDate.getDay(); // 0 is Sunday, 1 is Monday
  const currentWeekMondayDiff = currentDayIdx === 0 ? -6 : 1 - currentDayIdx;

  const targetDate = new Date(refDate);
  targetDate.setDate(refDate.getDate() + currentWeekMondayDiff + (targetDayIdx - 1));

  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dd = String(targetDate.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns current day of week (Monday..Sunday -> clamped to Monday..Saturday)
 */
export function getCurrentDayOfWeek(): DayOfWeek {
  const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday ...
  const map: Record<number, DayOfWeek> = {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    0: 'Monday',
  };
  return map[dayIndex] || 'Monday';
}

export type SlotLiveState = 
  | 'in-progress' 
  | 'upcoming' 
  | 'completed' 
  | 'past-date' 
  | 'future-date';

/**
 * Accurately determines current live status of a slot, taking into account the selected date
 */
export function getSlotLiveStatus(
  day: DayOfWeek,
  startTime: string,
  endTime: string,
  targetDateStr?: string
): SlotLiveState {
  const todayIso = new Date().toISOString().split('T')[0];
  const targetDate = targetDateStr || todayIso;

  if (targetDate < todayIso) {
    return 'past-date';
  }
  if (targetDate > todayIso) {
    return 'future-date';
  }

  const currentDay = getCurrentDayOfWeek();
  if (day !== currentDay) {
    return 'past-date';
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);

  if (currentMinutes >= startMin && currentMinutes < endMin) {
    return 'in-progress';
  } else if (currentMinutes < startMin) {
    return 'upcoming';
  } else {
    return 'completed';
  }
}

/**
 * Live Schedule Finder:
 * Identifies the currently active class or the next upcoming class today
 */
export function getLiveScheduleSnapshot(
  timetableSlots: TimetableSlot[],
  subjects: Subject[]
): {
  activeSlot?: TimetableSlot;
  activeSubject?: Subject;
  activeRemainingMinutes?: number;
  nextSlot?: TimetableSlot;
  nextSubject?: Subject;
  nextMinutesUntilStart?: number;
} {
  const today = getCurrentDayOfWeek();
  const todaySlots = timetableSlots
    .filter(s => s.day === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let activeSlot: TimetableSlot | undefined;
  let nextSlot: TimetableSlot | undefined;

  for (const slot of todaySlots) {
    const startMin = timeToMinutes(slot.startTime);
    const endMin = timeToMinutes(slot.endTime);

    if (currentMinutes >= startMin && currentMinutes < endMin) {
      activeSlot = slot;
      break;
    } else if (currentMinutes < startMin && !nextSlot) {
      nextSlot = slot;
    }
  }

  return {
    activeSlot,
    activeSubject: activeSlot ? subjects.find(s => s.id === activeSlot!.subjectId) : undefined,
    activeRemainingMinutes: activeSlot ? timeToMinutes(activeSlot.endTime) - currentMinutes : undefined,
    nextSlot,
    nextSubject: nextSlot ? subjects.find(s => s.id === nextSlot!.subjectId) : undefined,
    nextMinutesUntilStart: nextSlot ? timeToMinutes(nextSlot.startTime) - currentMinutes : undefined,
  };
}

/**
 * Minimalist, calming pastel palette designed specifically to avoid eye strain.
 * High WCAG AA legibility without fluorescent saturation or jarring clashes.
 */
export const EYE_FRIENDLY_PALETTES = [
  { 
    id: 'indigo', 
    name: 'Muted Steel Blue', 
    bg: 'bg-slate-100 dark:bg-slate-800/80', 
    text: 'text-slate-800 dark:text-slate-200', 
    border: 'border-slate-300 dark:border-slate-700', 
    badge: 'bg-slate-200/90 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300/60 dark:border-slate-700' 
  },
  { 
    id: 'sage', 
    name: 'Sage Celadon', 
    bg: 'bg-emerald-50/70 dark:bg-emerald-950/20', 
    text: 'text-emerald-900 dark:text-emerald-200', 
    border: 'border-emerald-200/80 dark:border-emerald-800/40', 
    badge: 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50' 
  },
  { 
    id: 'ochre', 
    name: 'Warm Ochre', 
    bg: 'bg-amber-50/70 dark:bg-amber-950/20', 
    text: 'text-amber-900 dark:text-amber-200', 
    border: 'border-amber-200/80 dark:border-amber-800/40', 
    badge: 'bg-amber-100/80 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50' 
  },
  { 
    id: 'teal', 
    name: 'Nordic Teal', 
    bg: 'bg-teal-50/70 dark:bg-teal-950/20', 
    text: 'text-teal-900 dark:text-teal-200', 
    border: 'border-teal-200/80 dark:border-teal-800/40', 
    badge: 'bg-teal-100/80 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 border border-teal-200 dark:border-teal-800/50' 
  },
  { 
    id: 'violet', 
    name: 'Soft Lavender', 
    bg: 'bg-indigo-50/70 dark:bg-indigo-950/20', 
    text: 'text-indigo-900 dark:text-indigo-200', 
    border: 'border-indigo-200/80 dark:border-indigo-800/40', 
    badge: 'bg-indigo-100/80 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50' 
  },
  { 
    id: 'rose', 
    name: 'Subdued Terracotta', 
    bg: 'bg-rose-50/70 dark:bg-rose-950/20', 
    text: 'text-rose-900 dark:text-rose-200', 
    border: 'border-rose-200/80 dark:border-rose-800/40', 
    badge: 'bg-rose-100/80 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50' 
  },
  { 
    id: 'slate', 
    name: 'Graphite', 
    bg: 'bg-stone-100 dark:bg-stone-850', 
    text: 'text-stone-800 dark:text-stone-200', 
    border: 'border-stone-300 dark:border-stone-700', 
    badge: 'bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-200 border border-stone-300/60 dark:border-stone-700' 
  },
];

export function getSubjectColorTheme(colorId?: string) {
  return EYE_FRIENDLY_PALETTES.find(p => p.id === colorId) || EYE_FRIENDLY_PALETTES[0];
}
