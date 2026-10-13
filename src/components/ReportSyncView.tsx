import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Subject, StudentProfile, AttendanceRecord, TimetableSlot } from '../types/attendance';
import { calculateAttendanceStats, calculateOverallStats } from '../utils/attendanceCalculations';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Printer, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Table
} from 'lucide-react';

interface ReportSyncViewProps {
  subjects: Subject[];
  timetableSlots: TimetableSlot[];
  profile: StudentProfile;
  attendanceLogs: AttendanceRecord[];
  onImportSubjects: (newSubjects: Subject[]) => void;
}

export const ReportSyncView: React.FC<ReportSyncViewProps> = ({
  subjects,
  timetableSlots,
  profile,
  attendanceLogs,
  onImportSubjects,
}) => {
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<Subject[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const overallStats = calculateOverallStats(subjects, profile.targetPercentage);

  // Handle XLSX / CSV File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setUploadStatus('Reading file...');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json<any>(worksheet);

        if (!data || data.length === 0) {
          throw new Error('Sheet appears to be empty or does not contain recognizable tabular rows.');
        }

        // Map row headers flexibly
        const imported: Subject[] = data.map((row: any, index: number) => {
          const code = row['Code'] || row['Course Code'] || row['Subject Code'] || `CS-${500 + index}`;
          const name = row['Name'] || row['Course Name'] || row['Subject'] || row['Title'] || `Course ${index + 1}`;
          const attended = Number(row['Attended'] || row['Present'] || 0);
          const total = Number(row['Total'] || row['Total Classes'] || row['Classes Held'] || attended);
          const type = (row['Type'] || '').toLowerCase().includes('lab') ? 'lab' : 'theory';
          const credits = Number(row['Credits'] || (type === 'lab' ? 2 : 3));
          const labWeight = Number(row['Weight'] || row['Lab Weight'] || (type === 'lab' ? 2 : 1));
          const faculty = row['Faculty'] || row['Professor'] || row['Teacher'] || 'Faculty';
          const room = row['Room'] || row['Hall'] || 'TBA';

          return {
            id: `imported-${Date.now()}-${index}`,
            code: String(code).trim(),
            name: String(name).trim(),
            attended: Math.max(0, attended),
            total: Math.max(attended, total),
            type,
            credits,
            labWeight,
            faculty: String(faculty).trim(),
            room: String(room).trim(),
            color: type === 'lab' ? 'teal' : 'indigo',
          };
        });

        setParsedPreview(imported);
        setUploadStatus(`Parsed ${imported.length} courses successfully. Click Import below to apply.`);
      } catch (err: any) {
        setErrorMessage(err.message || 'Error parsing spreadsheet file.');
        setUploadStatus(null);
      }
    };

    reader.onerror = () => {
      setErrorMessage('Could not read the uploaded file.');
      setUploadStatus(null);
    };

    reader.readAsBinaryString(file);
  };

  // Apply parsed preview
  const handleConfirmImport = () => {
    if (parsedPreview && parsedPreview.length > 0) {
      onImportSubjects(parsedPreview);
      setParsedPreview(null);
      setUploadStatus('Imported courses successfully!');
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  // Export to XLSX
  const handleExportXLSX = () => {
    const rows = subjects.map(s => {
      const stats = calculateAttendanceStats(s.attended, s.total, profile.targetPercentage);
      return {
        'Course Code': s.code,
        'Course Name': s.name,
        'Type': s.type.toUpperCase(),
        'Credits': s.credits,
        'Lab Weight': s.labWeight,
        'Attended Classes': s.attended,
        'Total Classes': s.total,
        'Percentage': `${stats.currentPercentage}%`,
        'Status': stats.status.toUpperCase(),
        'Faculty': s.faculty || '',
        'Room': s.room || '',
        'Safe Bunks Remaining': stats.safeClassesToBunk,
        'Classes Needed to Reach Target': stats.classesNeededForTarget,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Summary');

    // Also append timetable sheet
    const timetableRows = timetableSlots.map(t => {
      const sub = subjects.find(s => s.id === t.subjectId);
      return {
        'Day': t.day,
        'Start Time': t.startTime,
        'End Time': t.endTime,
        'Course Code': sub?.code || '',
        'Course Name': sub?.name || '',
        'Type': t.type.toUpperCase(),
        'Room': t.room || sub?.room || '',
      };
    });
    const timetableWorksheet = XLSX.utils.json_to_sheet(timetableRows);
    XLSX.utils.book_append_sheet(workbook, timetableWorksheet, 'Weekly Timetable');

    const fileName = `AttendSmart_${profile.rollNumber || 'Report'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Download a sample import template
  const handleDownloadSampleTemplate = () => {
    const sampleRows = [
      { 'Course Code': 'CS-501', 'Course Name': 'Data Structures & Algorithms', 'Type': 'Theory', 'Attended': 28, 'Total': 32, 'Credits': 4, 'Faculty': 'Dr. Thorne', 'Room': 'Hall 204' },
      { 'Course Code': 'CS-502', 'Course Name': 'Operating Systems Architecture', 'Type': 'Theory', 'Attended': 22, 'Total': 30, 'Credits': 4, 'Faculty': 'Prof. Rostova', 'Room': 'Hall 102' },
      { 'Course Code': 'CS-505L', 'Course Name': 'Operating Systems Lab', 'Type': 'Lab', 'Attended': 14, 'Total': 16, 'Credits': 2, 'Lab Weight': 2, 'Faculty': 'Dr. Thorne', 'Room': 'Lab 3' },
    ];
    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, 'AttendSmart_Sample_Import_Template.xlsx');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Reports, Sheets & Excel Sync</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Import spreadsheets from institutional portals, export audit files, or prepare print reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportXLSX}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 rounded-md transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Two Column Grid: Upload / Import + Export Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Box 1: Spreadsheet Upload & Parser */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Upload Attendance Spreadsheet (XLSX / CSV)
            </h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Import institutional ERP or portal export files. AttendSmart automatically maps headers for Code, Name, Attended, and Total.
          </p>

          {/* Upload Drop Area */}
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors bg-slate-50/50 dark:bg-slate-800/20">
            <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <label className="cursor-pointer">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Choose XLSX or CSV file
              </span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports Microsoft Excel (.xlsx, .xls) and CSV sheets
            </p>
          </div>

          {/* Status / Errors */}
          {uploadStatus && (
            <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{uploadStatus}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-2.5 rounded bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedPreview && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Preview ({parsedPreview.length} courses identified):
                </span>
                <button
                  onClick={handleConfirmImport}
                  className="px-3 py-1 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 transition-colors"
                >
                  Confirm & Replace Courses
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded text-xs divide-y divide-slate-100 dark:divide-slate-800">
                {parsedPreview.map((p, idx) => (
                  <div key={idx} className="p-2 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="font-mono font-semibold">{p.code}</span> · {p.name}
                    </div>
                    <span className="font-mono text-slate-600 dark:text-slate-400">
                      {p.attended}/{p.total} ({((p.attended / (p.total || 1)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Need a starting structure?</span>
            <button
              onClick={handleDownloadSampleTemplate}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>Download Sample Template</span>
            </button>
          </div>
        </div>

        {/* Box 2: Institutional Print Report Card */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Official Progress Report Summary
            </h3>
          </div>

          <div className="p-4 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-2 font-mono">
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5 font-sans font-semibold text-slate-800 dark:text-slate-200">
              <span>{profile.name}</span>
              <span>{profile.rollNumber}</span>
            </div>
            
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Program:</span>
              <span className="font-sans text-slate-900 dark:text-slate-100">{profile.program}</span>
            </div>

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Semester:</span>
              <span className="font-sans text-slate-900 dark:text-slate-100">{profile.semester}</span>
            </div>

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Overall Attendance:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                {overallStats.totalAttended} / {overallStats.totalClasses} ({overallStats.currentPercentage}%)
              </span>
            </div>

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Policy Threshold:</span>
              <span className="font-sans text-slate-900 dark:text-slate-100">{profile.targetPercentage}% Required</span>
            </div>

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Examination Clearance:</span>
              <span className={overallStats.status === 'safe' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                {overallStats.status === 'safe' ? 'ELIGIBLE' : 'DEBARMENT AT RISK'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Quick Export Actions:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={handleExportXLSX}
                className="py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-md font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center flex items-center justify-center gap-1.5"
              >
                <Table className="w-3.5 h-3.5 text-indigo-500" />
                <span>Spreadsheet (.xlsx)</span>
              </button>

              <button
                onClick={() => window.print()}
                className="py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-md font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Browser Print / PDF</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
