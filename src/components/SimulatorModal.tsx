import React, { useState } from 'react';
import { Subject, StudentProfile } from '../types/attendance';
import { calculateAttendanceStats } from '../utils/attendanceCalculations';
import { X, Calculator, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  profile: StudentProfile;
}

export const SimulatorModal: React.FC<SimulatorModalProps> = ({
  isOpen,
  onClose,
  subjects,
  profile,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [classesToAttend, setClassesToAttend] = useState<number>(5);
  const [classesToMiss, setClassesToMiss] = useState<number>(0);

  if (!isOpen) return null;

  // Determine baseline attended and total
  let baselineAttended = 0;
  let baselineTotal = 0;
  let subjectName = 'All Aggregate Courses';

  if (selectedSubjectId === 'all') {
    baselineAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
    baselineTotal = subjects.reduce((sum, s) => sum + s.total, 0);
    subjectName = 'All Semester Courses Combined';
  } else {
    const found = subjects.find(s => s.id === selectedSubjectId);
    if (found) {
      baselineAttended = found.attended;
      baselineTotal = found.total;
      subjectName = `${found.code} - ${found.name}`;
    }
  }

  const baselinePercentage = baselineTotal > 0 
    ? Number(((baselineAttended / baselineTotal) * 100).toFixed(1))
    : 100;

  // Calculate simulated
  const simulatedAttended = baselineAttended + classesToAttend;
  const simulatedTotal = baselineTotal + classesToAttend + classesToMiss;
  const simulatedPercentage = simulatedTotal > 0
    ? Number(((simulatedAttended / simulatedTotal) * 100).toFixed(1))
    : 100;

  const deltaPercentage = Number((simulatedPercentage - baselinePercentage).toFixed(1));
  const isSafe = simulatedPercentage >= profile.targetPercentage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              "What-If" Attendance Projection Simulator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 text-xs">
          
          {/* Target Course Selector */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              Select Scope for Simulation
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Courses (Overall Aggregate Percentage)</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name} ({s.attended}/{s.total} · {((s.attended / (s.total || 1)) * 100).toFixed(1)}%)
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
            
            {/* Future Classes Attended */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-emerald-700 dark:text-emerald-400">Future Classes Attended</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                  +{classesToAttend}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                value={classesToAttend}
                onChange={(e) => setClassesToAttend(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0</span>
                <span>15</span>
                <span>30</span>
              </div>
            </div>

            {/* Future Classes Missed */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-rose-700 dark:text-rose-400">Future Classes Missed</span>
                <span className="font-mono font-bold text-rose-700 dark:text-rose-400 text-sm">
                  +{classesToMiss}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                value={classesToMiss}
                onChange={(e) => setClassesToMiss(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0</span>
                <span>10</span>
                <span>20</span>
              </div>
            </div>

          </div>

          {/* Projection Results Card */}
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {subjectName}
              </span>
              <span className="font-mono">
                Target: {profile.targetPercentage}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              
              {/* Baseline */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Current</span>
                <div className="text-2xl font-bold font-mono text-slate-700 dark:text-slate-300">
                  {baselinePercentage}%
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {baselineAttended} / {baselineTotal}
                </div>
              </div>

              {/* Transition arrow */}
              <div className="flex flex-col items-center gap-1 px-3">
                <ArrowRight className="w-5 h-5 text-slate-400" />
                <span className={`text-[11px] font-mono font-bold ${
                  deltaPercentage > 0 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : deltaPercentage < 0 
                    ? 'text-rose-600 dark:text-rose-400' 
                    : 'text-slate-400'
                }`}>
                  {deltaPercentage > 0 ? `+${deltaPercentage}%` : `${deltaPercentage}%`}
                </span>
              </div>

              {/* Simulated */}
              <div className="space-y-1 text-right">
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 uppercase font-semibold">Simulated</span>
                <div className={`text-2xl font-bold font-mono ${
                  isSafe 
                    ? 'text-emerald-700 dark:text-emerald-400' 
                    : 'text-rose-700 dark:text-rose-400'
                }`}>
                  {simulatedPercentage}%
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {simulatedAttended} / {simulatedTotal}
                </div>
              </div>

            </div>

            {/* Verdict summary */}
            <div className={`mt-2 p-2.5 rounded text-xs flex items-start gap-2 ${
              isSafe 
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 border border-emerald-200/70 dark:border-emerald-800/40' 
                : 'bg-rose-50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 border border-rose-200/70 dark:border-rose-800/40'
            }`}>
              {isSafe ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="font-semibold">Eligible & Compliant:</strong> Under this scenario, attendance reaches <span className="font-mono font-bold">{simulatedPercentage}%</span>, comfortably satisfying the institutional minimum of {profile.targetPercentage}%.
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="font-semibold">Debarment Hazard:</strong> Under this scenario, attendance falls to <span className="font-mono font-bold">{simulatedPercentage}%</span>, dropping below the mandatory {profile.targetPercentage}% requirement.
                  </div>
                </>
              )}
            </div>

          </div>

          {/* Quick presets */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400">Quick Test Scenarios:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => { setClassesToAttend(10); setClassesToMiss(0); }}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium"
              >
                +10 Perfect
              </button>
              <button
                type="button"
                onClick={() => { setClassesToAttend(0); setClassesToMiss(3); }}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium"
              >
                Skip 3 Classes
              </button>
              <button
                type="button"
                onClick={() => { setClassesToAttend(5); setClassesToMiss(1); }}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium"
              >
                Realistic Week
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 font-medium text-xs transition-colors"
          >
            Close Simulator
          </button>
        </div>

      </div>
    </div>
  );
};
