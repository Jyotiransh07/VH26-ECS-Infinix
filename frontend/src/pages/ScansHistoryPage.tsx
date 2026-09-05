import React, { useState } from 'react';
import { Play, Search } from '@/components/icons';
import { ScanResult } from '../types';

interface ScansHistoryPageProps {
  scans: ScanResult[];
  onTriggerScan: () => void;
  onSelectScan: (scan: ScanResult) => void;
}

export const ScansHistoryPage: React.FC<ScansHistoryPageProps> = ({
  scans,
  onTriggerScan,
  onSelectScan
}) => {
  const [repoFilter, setRepoFilter] = useState('ALL');

  const filtered = scans.filter(s => repoFilter === 'ALL' || (s.repository_name || '').includes(repoFilter));

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Scans
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Run and review static analysis repository scans.
          </p>
        </div>
        <button
          onClick={onTriggerScan}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-teal-600 hover:bg-teal-500 text-white transition-colors cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run scan</span>
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800/60 text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-800/20">
              <th className="py-2.5 px-4 font-medium">Repository</th>
              <th className="py-2.5 px-4 font-medium">Branch</th>
              <th className="py-2.5 px-4 font-medium">Files</th>
              <th className="py-2.5 px-4 font-medium">Findings</th>
              <th className="py-2.5 px-4 font-medium">Duration</th>
              <th className="py-2.5 px-4 font-medium">Status</th>
              <th className="py-2.5 px-4 font-medium text-right">Started</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
            {filtered.map((s, idx) => (
              <tr
                key={s.id || idx}
                onClick={() => onSelectScan(s)}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 cursor-pointer transition-colors"
              >
                <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-white">
                  {s.repository_name || 'sample-repo-python'}
                </td>
                <td className="py-3 px-4 font-mono text-slate-500">
                  main
                </td>
                <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                  {s.summary?.files_scanned || 6}
                </td>
                <td className="py-3 px-4">
                  <span className={`font-mono font-semibold ${
                    (s.summary?.definite_leaks || 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {s.summary?.definite_leaks || 0}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-slate-400">
                  {s.duration_ms || 142} ms
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                    (s.summary?.definite_leaks || 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      (s.summary?.definite_leaks || 0) > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    {(s.summary?.definite_leaks || 0) > 0 ? 'Needs attention' : 'Passed'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-slate-400 font-mono">
                  {idx === 0 ? 'Just now' : `${idx * 30}m ago`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
