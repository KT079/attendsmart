import React, { useState, useEffect } from 'react';
import { Subject, ClassType } from '../types/attendance';
import { EYE_FRIENDLY_PALETTES } from '../utils/attendanceCalculations';
import { X, BookOpen } from 'lucide-react';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectToEdit?: Subject | null;
  onSaveSubject: (subject: Omit<Subject, 'id'>, subjectId?: string) => void;
}

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  subjectToEdit,
  onSaveSubject,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<ClassType>('theory');
  const [credits, setCredits] = useState<number>(3);
  const [labWeight, setLabWeight] = useState<number>(1);
  const [attended, setAttended] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [faculty, setFaculty] = useState('');
  const [room, setRoom] = useState('');
  const [color, setColor] = useState('indigo');

  useEffect(() => {
    if (subjectToEdit) {
      setCode(subjectToEdit.code);
      setName(subjectToEdit.name);
      setType(subjectToEdit.type);
      setCredits(subjectToEdit.credits);
      setLabWeight(subjectToEdit.labWeight);
      setAttended(subjectToEdit.attended);
      setTotal(subjectToEdit.total);
      setFaculty(subjectToEdit.faculty || '');
      setRoom(subjectToEdit.room || '');
      setColor(subjectToEdit.color || 'indigo');
    } else {
      setCode('');
      setName('');
      setType('theory');
      setCredits(3);
      setLabWeight(1);
      setAttended(0);
      setTotal(0);
      setFaculty('');
      setRoom('');
      setColor('indigo');
    }
  }, [subjectToEdit, isOpen]);

  const handleTypeChange = (newType: ClassType) => {
    setType(newType);
    if (newType === 'lab') {
      setLabWeight(2);
      setCredits(2);
      setColor('teal');
    } else {
      setLabWeight(1);
      setCredits(3);
      setColor('indigo');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    onSaveSubject(
      {
        code: code.trim(),
        name: name.trim(),
        type,
        credits: Number(credits),
        labWeight: Number(labWeight),
        attended: Math.max(0, Number(attended)),
        total: Math.max(Number(attended), Number(total)),
        faculty: faculty.trim(),
        room: room.trim(),
        color,
      },
      subjectToEdit?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {subjectToEdit ? 'Edit Course Details' : 'Add New Academic Course'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs overflow-y-auto">
          
          {/* Code and Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Course Code
              </label>
              <input
                type="text"
                placeholder="e.g. CS-501"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-mono uppercase focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Course Type
              </label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value as ClassType)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="theory">Theory Lecture</option>
                <option value="lab">Laboratory (Practical)</option>
                <option value="tutorial">Tutorial</option>
              </select>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              Course Title
            </label>
            <input
              type="text"
              placeholder="e.g. Distributed Database Systems"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Credits and Lab Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Credits
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Session Weight {type === 'lab' && '(Lab multiplier)'}
              </label>
              <input
                type="number"
                min={1}
                max={4}
                value={labWeight}
                onChange={(e) => setLabWeight(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Initial Attendance Numbers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Classes Attended
              </label>
              <input
                type="number"
                min={0}
                value={attended}
                onChange={(e) => setAttended(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Total Classes Held
              </label>
              <input
                type="number"
                min={attended}
                value={total}
                onChange={(e) => setTotal(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Faculty & Room */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Professor / Faculty
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Alan Turing"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Room / Laboratory
              </label>
              <input
                type="text"
                placeholder="e.g. Hall 302"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Pastel Color Palette */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1.5">
              Subject Color Theme (Minimalist Muted)
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {EYE_FRIENDLY_PALETTES.map(p => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setColor(p.id)}
                  className={`w-7 h-7 rounded-md border flex items-center justify-center text-[10px] font-bold transition-transform ${p.badge} ${
                    color === p.id ? 'ring-2 ring-indigo-500 ring-offset-1 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={p.name}
                >
                  {color === p.id ? '✓' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 font-medium transition-colors"
            >
              {subjectToEdit ? 'Update Course' : 'Create Course'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
