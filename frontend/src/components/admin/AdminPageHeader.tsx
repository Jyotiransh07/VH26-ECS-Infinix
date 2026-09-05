import React from 'react';
import { RefreshCw, Download } from '@/components/icons';

interface AdminPageHeaderProps {
  title: string;
  description: string;
  onRefresh?: () => void;
  onExportCsv?: () => void;
  lastUpdatedSeconds?: number;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  description,
  onRefresh,
  onExportCsv,
  lastUpdatedSeconds = 10
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            ADMIN CONSOLE
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
          {title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {lastUpdatedSeconds !== undefined && (
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Updated {lastUpdatedSeconds}s ago
          </span>
        )}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Refresh latest telemetry"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Refresh</span>
          </button>
        )}
        {onExportCsv && (
          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
        )}
      </div>
    </div>
  );
};
