import React, { useState, useEffect } from 'react';
import { Subject, TimetableSlot, DayOfWeek, ClassType } from '../types/attendance';
import { DAYS_OF_WEEK, checkTimetableCollision } from '../utils/attendanceCalculations';
import { X, Clock, AlertCircle } from 'lucide-react';

interface AddTimetableSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  existingSlots: TimetableSlot[];
  slotToEdit?: TimetableSlot | null;
  onSaveSlot: (slot: Omit<TimetableSlot, 'id'>, slotId?: string) => void;
}

export const AddTimetableSlotModal: React.FC<AddTimetableSlotModalProps> = ({
  isOpen,
  onClose,
  subjects,
  existingSlots,
  slotToEdit,
  onSaveSlot,
}) => {
  const [day, setDay] = useState<DayOfWeek>('Monday');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [subjectId, setSubjectId] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [type, setType] = useState<ClassType>('theory');
  const [collisionWarning, setCollisionWarning] = useState<string | null>(null);

  useEffect(() => {
    if (slotToEdit) {
      setDay(slotToEdit.day);
      setStartTime(slotToEdit.startTime);
      setEndTime(slotToEdit.endTime);
      setSubjectId(slotToEdit.subjectId);
      setRoom(slotToEdit.room || '');
      setType(slotToEdit.type);
    } else {
      setDay('Monday');
      setStartTime('09:00');
      setEndTime('10:00');
      if (subjects.length > 0) {
        setSubjectId(subjects[0].id);
        setType(subjects[0].type);
        setRoom(subjects[0].room || '');
      }
    }
    setCollisionWarning(null);
  }, [slotToEdit, isOpen, subjects]);

  // Sync type and room default when subject selection changes
  const handleSubjectChange = (newSubId: string) => {
    setSubjectId(newSubId);
    const sub = subjects.find(s => s.id === newSubId);
    if (sub) {
      setType(sub.type);
      if (sub.room) setRoom(sub.room);
    }
  };

  // Check collision whenever day/start/end changes
  useEffect(() => {
    if (!startTime || !endTime) return;
    if (startTime >= endTime) {
      setCollisionWarning('End time must be later than start time.');
      return;
    }

    const collision = checkTimetableCollision(
      { day, startTime, endTime, subjectId, type, room },
      existingSlots,
      slotToEdit?.id
    );

    if (collision.hasCollision && collision.conflictingSlot) {
      const confSub = subjects.find(s => s.id === collision.conflictingSlot?.subjectId);
      setCollisionWarning(
        `Time overlaps with ${confSub?.name || 'another class'} (${collision.conflictingSlot.startTime}–${collision.conflictingSlot.endTime}) on ${day}.`
      );
    } else {
      setCollisionWarning(null);
    }
  }, [day, startTime, endTime, subjectId, type, existingSlots, slotToEdit, subjects]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startTime >= endTime) return;

    onSaveSlot(
      { day, startTime, endTime, subjectId, room, type },
      slotToEdit?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {slotToEdit ? 'Edit Timetable Slot' : 'Add Timetable Class Slot'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
          
          {/* Day Selection */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              Day of Week
            </label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value as DayOfWeek)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {DAYS_OF_WEEK.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Conflict Warning */}
          {collisionWarning && (
            <div className="p-2.5 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span>{collisionWarning}</span>
            </div>
          )}

          {/* Subject Select */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              Associated Course
            </label>
            <select
              value={subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name} ({s.type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Type & Room */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Session Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ClassType)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="theory">Theory Lecture</option>
                <option value="lab">Laboratory (Practical)</option>
                <option value="tutorial">Tutorial</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Room / Hall
              </label>
              <input
                type="text"
                placeholder="e.g. Hall 204 or Lab 3"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={Boolean(collisionWarning && startTime >= endTime)}
              className="px-4 py-1.5 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors"
            >
              {slotToEdit ? 'Save Changes' : 'Add Slot'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
