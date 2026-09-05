import React from 'react';
import { FileText, Download } from '@/components/icons';

export const ReportsHubPage: React.FC = () => {
  const downloadJSON = () => {
    const data = {
      leakguard_version: "0.1.0",
      status: "BLOCKED",
      findings_count: 4,
      target: "sample-repo-python",
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leakguard_report.json';
    a.click();
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="pb-2 border-b border-slate-100 dark:border-slate-800/60">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Reports
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Export structured JSON and SARIF reports from static analysis runs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">JSON Report</h3>
            <p className="text-xs text-slate-400 mt-0.5">Machine-readable finding diagnostics and leaking paths.</p>
          </div>
          <button
            onClick={downloadJSON}
            className="px-3 py-1.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">SARIF Standard Report</h3>
            <p className="text-xs text-slate-400 mt-0.5">OASIS standard format for GitHub Code Scanning and IDEs.</p>
          </div>
          <button
            onClick={downloadJSON}
            className="px-3 py-1.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download SARIF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
