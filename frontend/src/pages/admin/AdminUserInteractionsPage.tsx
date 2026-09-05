import React, { useState } from 'react';
import { Users, Search, Filter, Download } from '@/components/icons';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { UserInteractionDrawer } from '@/components/admin/UserInteractionDrawer';

export const AdminUserInteractionsPage: React.FC = () => {
  const [selectedInteraction, setSelectedInteraction] = useState<any | null>(null);
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const interactions = [
    {
      id: 'act-101',
      user: 'Janson Williams',
      email: 'janson@leakguard.internal',
      role: 'Security Lead',
      action: 'SCAN_EXECUTED',
      label: 'Executed Static Scan',
      target: 'sample-repo-python / main',
      detail: 'Scanned 6 files, 4 definite leaks detected',
      timestamp: '2 mins ago',
      status: 'COMPLETED'
    },
    {
      id: 'act-102',
      user: 'Elena Rostova',
      email: 'elena@leakguard.internal',
      role: 'Backend Developer',
      action: 'FINDING_TRIAGED',
      label: 'Triaged Finding',
      target: 'early_return.py:2',
      detail: 'Marked unclosed file descriptor as TRIAGED',
      timestamp: '14 mins ago',
      status: 'TRIAGED'
    },
    {
      id: 'act-103',
      user: 'Marcus Chen',
      email: 'marcus@leakguard.internal',
      role: 'DevOps Engineer',
      action: 'REPO_CONNECTED',
      label: 'Connected Repository',
      target: 'payment-service',
      detail: 'Added GitHub branch protection hook',
      timestamp: '1 hour ago',
      status: 'SUCCESS'
    },
    {
      id: 'act-104',
      user: 'Sarah Miller',
      email: 'sarah@leakguard.internal',
      role: 'Security Engineer',
      action: 'RULE_UPDATED',
      label: 'Updated Rule',
      target: 'LG003 (SQLite Pool)',
      detail: 'Added psycopg2 context manager detection',
      timestamp: '3 hours ago',
      status: 'UPDATED'
    },
    {
      id: 'act-105',
      user: 'David Kim',
      email: 'david@leakguard.internal',
      role: 'Software Engineer',
      action: 'SCAN_EXECUTED',
      label: 'Executed Static Scan',
      target: 'demo-project / main',
      detail: 'Scanned 1 file, 1 definite leak detected',
      timestamp: '5 hours ago',
      status: 'COMPLETED'
    }
  ];

  const filtered = interactions.filter(item => {
    if (filterAction !== 'ALL' && item.action !== filterAction) return false;
    if (searchQuery && !item.user.toLowerCase().includes(searchQuery.toLowerCase()) && !item.target.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const exportCsv = () => {
    const headers = 'User,Role,Action,Target,Timestamp,Status\n';
    const rows = filtered.map(i => `"${i.user}","${i.role}","${i.action}","${i.target}","${i.timestamp}","${i.status}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_interactions_audit.csv';
    a.click();
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="User Interactions"
        description="Audit log of user actions across scans, findings triage, and repository connections."
        onExportCsv={exportCsv}
      />

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search interactions by user name or target repository..."
            className="w-full pl-8 pr-3 py-1.5 rounded-md bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-2.5 py-1.5 rounded-md bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
        >
          <option value="ALL">All action types</option>
          <option value="SCAN_EXECUTED">Scans executed</option>
          <option value="FINDING_TRIAGED">Findings triaged</option>
          <option value="REPO_CONNECTED">Repositories connected</option>
          <option value="RULE_UPDATED">Rules updated</option>
        </select>
      </div>

      {/* Interactions Table */}
      <div className="rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-800/20">
              <th className="py-2.5 px-4 font-medium">Developer</th>
              <th className="py-2.5 px-4 font-medium">Action</th>
              <th className="py-2.5 px-4 font-medium">Target</th>
              <th className="py-2.5 px-4 font-medium">Details</th>
              <th className="py-2.5 px-4 font-medium text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 font-mono text-[11px]">
            {filtered.map((item) => (
              <tr 
                key={item.id} 
                onClick={() => setSelectedInteraction(item)}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 cursor-pointer transition-colors"
              >
                <td className="py-3 px-4 font-sans font-medium text-slate-900 dark:text-white">
                  <div>{item.user}</div>
                  <div className="text-[10px] text-slate-400">{item.role}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold text-[10px]">
                    {item.label}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold">
                  {item.target}
                </td>
                <td className="py-3 px-4 font-sans text-slate-500">
                  {item.detail}
                </td>
                <td className="py-3 px-4 text-right text-slate-400">
                  {item.timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Drawer */}
      <UserInteractionDrawer
        isOpen={Boolean(selectedInteraction)}
        onClose={() => setSelectedInteraction(null)}
        interaction={selectedInteraction}
      />
    </div>
  );
};
