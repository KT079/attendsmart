import React, { useState } from 'react';
import { Subject, StudentProfile } from '../types/attendance';
import { 
  calculateAttendanceStats, 
  getSubjectColorTheme 
} from '../utils/attendanceCalculations';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  FlaskConical, 
  Sparkles,
  Check,
  X
} from 'lucide-react';

interface SubjectManagerProps {
  subjects: Subject[];
  profile: StudentProfile;
  onAddSubject: () => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
  onQuickAdjustAttendance: (subjectId: string, attendedDelta: number, totalDelta: number) => void;
  onOpenSimulator: () => void;
}

export const SubjectManager: React.FC<SubjectManagerProps> = ({
  subjects,
  profile,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
  onQuickAdjustAttendance,
  onOpenSimulator,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'theory' | 'lab'>('all');

  const filteredSubjects = subjects.filter(sub => {
    const matchesSearch = 
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.faculty && sub.faculty.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || sub.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Course Catalog & Policies</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Configure academic credits, laboratory session multipliers, and target quotas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-500" />
            <span>Simulator</span>
          </button>

          <button
            onClick={onAddSubject}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-md transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Lab Policy Note Banner */}
      <div className="p-3.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
        <FlaskConical className="w-4 h-4 text-slate-600 dark:text-slate-400 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">Lab Multiplier & Session Policy: </span>
          <span>
            Laboratory sessions are weighted at <strong>2.0x</strong> by default (reflecting 2-hour or 3-hour practical blocks). 
            Marking attendance for a lab session automatically incorporates its weight into total units held.
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by code, title, or professor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 mr-1 hidden sm:inline">Type:</span>
          {(['all', 'theory', 'lab'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                filterType === type
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {type === 'all' ? 'All Courses' : type}
            </button>
          ))}
        </div>
      </div>

      {/* High-Density Structured Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-3">Type & Weight</th>
                <th className="py-3 px-3">Attended / Total</th>
                <th className="py-3 px-3">Percentage</th>
                <th className="py-3 px-3">Margin / Quota</th>
                <th className="py-3 px-3 text-right">Quick Log</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No matching courses found.
                  </td>
                </tr>
              ) : (
                filteredSubjects.map(sub => {
                  const stats = calculateAttendanceStats(sub.attended, sub.total, profile.targetPercentage);
                  const colorTheme = getSubjectColorTheme(sub.color);

                  return (
                    <tr 
                      key={sub.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Course Name & Code */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                            {sub.code}
                          </span>
                        </div>
                        <div className="text-slate-700 dark:text-slate-300 font-medium mt-0.5 line-clamp-1">
                          {sub.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {sub.faculty} · {sub.room || 'Room TBA'}
                        </div>
                      </td>

                      {/* Type & Lab Weight */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${colorTheme.badge}`}>
                          {sub.type}
                        </span>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {sub.type === 'lab' ? `${sub.labWeight}x weight` : `${sub.credits} credits`}
                        </div>
                      </td>

                      {/* Attended / Total */}
                      <td className="py-3 px-3 font-mono tabular-nums text-slate-700 dark:text-slate-300 font-medium">
                        {sub.attended} / {sub.total}
                      </td>

                      {/* Percentage & Progress indicator */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono tabular-nums font-bold text-sm ${
                            stats.status === 'safe'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : stats.status === 'warning'
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-rose-700 dark:text-rose-400'
                          }`}>
                            {stats.currentPercentage}%
                          </span>
                        </div>
                        <div className="w-20 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full ${
                              stats.status === 'safe'
                                ? 'bg-emerald-600'
                                : stats.status === 'warning'
                                ? 'bg-amber-600'
                                : 'bg-rose-600'
                            }`}
                            style={{ width: `${Math.min(100, stats.currentPercentage)}%` }}
                          />
                        </div>
                      </td>

                      {/* Margin Advice */}
                      <td className="py-3 px-3 text-[11px]">
                        {stats.status === 'safe' ? (
                          <span className="text-emerald-700 dark:text-emerald-400">
                            Can skip <strong>{stats.safeClassesToBunk}</strong>
                          </span>
                        ) : (
                          <span className="text-rose-700 dark:text-rose-400 font-medium">
                            Need <strong>{stats.classesNeededForTarget}</strong> to hit {profile.targetPercentage}%
                          </span>
                        )}
                      </td>

                      {/* Quick Attendance Log Buttons */}
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onQuickAdjustAttendance(sub.id, 1, 1)}
                            className="p-1 px-1.5 text-[11px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 rounded border border-emerald-200 dark:border-emerald-800/40 transition-colors"
                            title="Mark 1 Present"
                          >
                            +P
                          </button>
                          <button
                            onClick={() => onQuickAdjustAttendance(sub.id, 0, 1)}
                            className="p-1 px-1.5 text-[11px] font-medium text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded border border-rose-200 dark:border-rose-800/40 transition-colors"
                            title="Mark 1 Absent"
                          >
                            +A
                          </button>
                        </div>
                      </td>

                      {/* Edit / Delete actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onEditSubject(sub)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit course metadata"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteSubject(sub.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
