import React from 'react';
import { 
  Calendar, 
  BarChart2, 
  BookOpen, 
  Clock, 
  FileSpreadsheet, 
  Calculator, 
  RotateCcw,
  Sun,
  Moon
} from 'lucide-react';
import { StudentProfile } from '../types/attendance';

export type ActiveTab = 'dashboard' | 'timetable' | 'subjects' | 'logs' | 'reports';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  onOpenSimulator: () => void;
  onResetData: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  overallPercentage: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  profile,
  setProfile,
  onOpenSimulator,
  onResetData,
  isDarkMode,
  setIsDarkMode,
  overallPercentage,
}) => {
  const navTabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Overview', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'timetable', label: 'Timetable Tracker', icon: <Calendar className="w-4 h-4" /> },
    { id: 'subjects', label: 'Courses & Policies', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'logs', label: 'Daily History', icon: <Clock className="w-4 h-4" /> },
    { id: 'reports', label: 'Excel & Reports', icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Single-element Brand Wordmark with subtle academic context */}
          <div className="flex items-center gap-4 shrink-0">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className="text-left group flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
                AS
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                  AttendSmart
                </span>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>{profile.program}</span>
                  <span aria-hidden="true">·</span>
                  <span className={`font-mono tabular-nums font-semibold ${
                    overallPercentage >= profile.targetPercentage 
                      ? 'text-emerald-700 dark:text-emerald-400' 
                      : 'text-amber-700 dark:text-amber-400'
                  }`}>
                    {overallPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Clean, unboxed typography with calm active states) */}
          <nav className="hidden md:flex items-center gap-1">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions & Utilities */}
          <div className="flex items-center gap-2">
            
            {/* Target Threshold Selector */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400">Policy:</span>
              <select
                aria-label="Target attendance threshold"
                value={profile.targetPercentage}
                onChange={(e) => setProfile(prev => ({ ...prev, targetPercentage: Number(e.target.value) }))}
                className="bg-transparent font-semibold font-mono text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer text-xs"
              >
                <option value={75} className="dark:bg-slate-800">75% Mandatory</option>
                <option value={80} className="dark:bg-slate-800">80% Target</option>
                <option value={85} className="dark:bg-slate-800">85% Safe</option>
                <option value={90} className="dark:bg-slate-800">90% Honors</option>
              </select>
            </div>

            {/* What-If Simulator Action */}
            <button
              onClick={onOpenSimulator}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-md transition-colors whitespace-nowrap"
              title="Test safe misses or catch-up scenarios"
            >
              <Calculator className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Simulator</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setIsDarkMode(prev => !prev)}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle visual theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Reset Data Button */}
            <button
              onClick={onResetData}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset to Sample Semester Data"
              aria-label="Reset to default sample data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100 dark:border-slate-800 no-scrollbar">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
