import React, { useState } from 'react';
import { Search, Filter, AlertTriangle } from '@/components/icons';
import { IssueFinding } from '../types';

interface FindingsListPageProps {
  issues: IssueFinding[];
  onSelectIssue: (id: string) => void;
}

export const FindingsListPage: React.FC<FindingsListPageProps> = ({
  issues,
  onSelectIssue
}) => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = issues.filter(i => {
    if (severityFilter !== 'ALL' && i.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && i.status !== statusFilter) return false;
    if (search && !i.file.toLowerCase().includes(search.toLowerCase()) && !(i.reason || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="pb-2 border-b border-slate-100 dark:border-slate-800/60">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Findings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Review resource leaks detected across your repositories.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search findings or file names..."
            className="w-full pl-8 pr-3 py-1.5 rounded-md bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All severities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800/60 text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-800/20">
              <th className="py-2.5 px-4 font-medium">Severity</th>
              <th className="py-2.5 px-4 font-medium">Finding</th>
              <th className="py-2.5 px-4 font-medium">Repository</th>
              <th className="py-2.5 px-4 font-medium">File</th>
              <th className="py-2.5 px-4 font-medium">Status</th>
              <th className="py-2.5 px-4 font-medium text-right">Detected</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No findings match the selected filters.
                </td>
              </tr>
            ) : (
              filtered.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => onSelectIssue(f.id)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-medium ${
                      f.severity === 'HIGH' || f.severity === 'CRITICAL' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        f.severity === 'HIGH' || f.severity === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-500'
                      }`} />
                      {f.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                    {f.reason || 'Resource handle is not closed'}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    sample-repo-python
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {f.file}:{f.line}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-medium">
                      {f.status || 'Open'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400 font-mono">
                    2 min ago
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
