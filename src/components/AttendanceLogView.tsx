import React, { useState } from 'react';
import { AttendanceRecord, Subject } from '../types/attendance';
import { 
  Clock, 
  Trash2, 
  Filter, 
  Check, 
  X, 
  Calendar, 
  FileText,
  Search
} from 'lucide-react';

interface AttendanceLogViewProps {
  logs: AttendanceRecord[];
  subjects: Subject[];
  onDeleteLog: (logId: string) => void;
  onClearAllLogs: () => void;
}

export const AttendanceLogView: React.FC<AttendanceLogViewProps> = ({
  logs,
  subjects,
  onDeleteLog,
  onClearAllLogs,
}) => {
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchNote, setSearchNote] = useState<string>('');

  const filteredLogs = logs
    .filter(log => {
      const matchSubject = subjectFilter === 'all' || log.subjectId === subjectFilter;
      const matchStatus = statusFilter === 'all' || log.status === statusFilter;
      const matchSearch = !searchNote || (log.note && log.note.toLowerCase().includes(searchNote.toLowerCase()));
      return matchSubject && matchStatus && matchSearch;
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  const presentCount = logs.filter(l => l.status === 'present').length;
  const absentCount = logs.filter(l => l.status === 'absent').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Daily Attendance Logs & History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Audit trail of all timestamped attendance markings across the semester
          </p>
        </div>

        <div className="flex items-center gap-2">
          {logs.length > 0 && (
            <button
              onClick={onClearAllLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/40 rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Mini-Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs shadow-xs">
          <span className="text-slate-500 dark:text-slate-400">Total Entries Logged</span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {logs.length}
          </div>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs shadow-xs">
          <span className="text-slate-500 dark:text-slate-400">Present Marks</span>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {presentCount}
          </div>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs shadow-xs">
          <span className="text-slate-500 dark:text-slate-400">Absence Marks</span>
          <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {absentCount}
          </div>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs shadow-xs">
          <span className="text-slate-500 dark:text-slate-400">Ratio</span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {logs.length > 0 ? ((presentCount / logs.length) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* Subject Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Course:</span>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
          >
            <option value="all">All Courses</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400">Status:</span>
          {(['all', 'present', 'absent'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Notes */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchNote}
            onChange={(e) => setSearchNote(e.target.value)}
            className="pl-7 pr-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Structured Log Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-3">Course</th>
                <th className="py-3 px-3">Marked Status</th>
                <th className="py-3 px-3">Units</th>
                <th className="py-3 px-3">Notes & Observations</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    No attendance logs match the current filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const subject = subjects.find(s => s.id === log.subjectId);
                  const logDate = new Date(log.date + 'T12:00:00Z');

                  return (
                    <tr 
                      key={log.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                        {log.date}
                        <div className="text-[11px] font-sans text-slate-400 font-normal">
                          {logDate.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {subject ? subject.name : 'Unknown Course'}
                        </span>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {subject?.code}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 font-semibold uppercase text-[11px] ${
                          log.status === 'present'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-rose-700 dark:text-rose-400'
                        }`}>
                          {log.status === 'present' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          <span>{log.status}</span>
                        </span>
                      </td>

                      {/* Units */}
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {log.units || 1}x
                      </td>

                      {/* Notes */}
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-xs">
                        {log.note || <span className="text-slate-300 dark:text-slate-600 italic">None</span>}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onDeleteLog(log.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete this log entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
