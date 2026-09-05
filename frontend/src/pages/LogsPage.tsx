import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Calendar, 
  Users, 
  FolderGit2, 
  Sliders, 
  ExternalLink,
  CheckCircle2,
  GitBranch,
  Github,
  Clock
} from '@/components/icons';
import { LogEntry, LogFilters, Severity } from '../types';
import { api } from '../services/api';

export const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  const [filters, setFilters] = useState<LogFilters>({
    repository: 'ALL',
    developer: 'ALL',
    severity: 'ALL',
    status: 'ALL',
    event: 'ALL',
    date: 'ALL',
    search: ''
  });

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getLogs(filters);
      setLogs(res.logs || []);
      setTotalCount(res.total || 0);
    } catch (e) {
      console.error('Failed to load logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const handleFilterChange = (key: keyof LogFilters, val: string) => {
    setFilters(prev => ({ ...prev, [key]: val }));
  };

  const handleResetFilters = () => {
    setFilters({
      repository: 'ALL',
      developer: 'ALL',
      severity: 'ALL',
      status: 'ALL',
      event: 'ALL',
      date: 'ALL',
      search: ''
    });
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `leakguard-logs-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-900/50">LOW</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">INFO</span>;
    }
  };

  const getEventIcon = (event: string) => {
    switch (event) {
      case 'SCAN_STARTED':
      case 'SCAN_COMPLETED':
        return <Activity className="w-4 h-4 text-sky-500" />;
      case 'FINDING_DETECTED':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'FINDING_ASSIGNED':
      case 'STATUS_CHANGED':
        return <Users className="w-4 h-4 text-indigo-500" />;
      case 'FINDING_FIXED':
      case 'FINDING_VERIFIED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'REPOSITORY_CONNECTED':
      case 'GITHUB_EVENT':
        return <Github className="w-4 h-4 text-slate-700 dark:text-slate-300" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Platform Activity & Audit Logs</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40">
              {totalCount} events logged
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time audit log tracking scan execution, finding triage, remediation lifecycle, and GitHub events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadLogs}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Logs</span>
            <span className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-500">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{totalCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">All recorded platform events</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Scan Pipeline</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {logs.filter(l => l.event.startsWith('SCAN')).length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pipeline start & completion logs</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Triage & Fixes</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {logs.filter(l => l.event === 'FINDING_FIXED' || l.event === 'FINDING_VERIFIED' || l.event === 'FINDING_ASSIGNED').length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Resolved & verified remediations</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">GitHub Webhooks</span>
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500">
              <Github className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {logs.filter(l => l.event === 'GITHUB_EVENT' || l.event === 'REPOSITORY_CONNECTED').length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Push & branch protection events</div>
        </div>
      </div>

      {/* 6-Filter Control Center (Brisk Card) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs by message, actor, file, or resource..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <button
            onClick={handleResetFilters}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 self-end md:self-center"
          >
            Reset all filters
          </button>
        </div>

        {/* 6 Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* 1. Repository Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Repository</label>
            <select
              value={filters.repository}
              onChange={(e) => handleFilterChange('repository', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Repositories</option>
              <option value="sample-repo-python">sample-repo-python</option>
              <option value="demo-project">demo-project</option>
              <option value="payment-service">payment-service</option>
            </select>
          </div>

          {/* 2. Developer Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Developer</label>
            <select
              value={filters.developer}
              onChange={(e) => handleFilterChange('developer', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Developers</option>
              <option value="Janson">Janson Williams</option>
              <option value="Elena">Elena Rostova</option>
              <option value="Marcus">Marcus Chen</option>
              <option value="Sarah">Sarah Miller</option>
              <option value="Engine">System Engine</option>
            </select>
          </div>

          {/* 3. Severity Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Severity</label>
            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Severities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="INFO">Info</option>
            </select>
          </div>

          {/* 4. Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="COMPLETED">Completed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="OPEN">Open</option>
              <option value="RESOLVED">Resolved</option>
              <option value="VERIFIED">Verified</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* 5. Event Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Event Type</label>
            <select
              value={filters.event}
              onChange={(e) => handleFilterChange('event', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Events</option>
              <option value="SCAN_STARTED">Scan Started</option>
              <option value="SCAN_COMPLETED">Scan Completed</option>
              <option value="FINDING_DETECTED">Finding Detected</option>
              <option value="FINDING_ASSIGNED">Finding Assigned</option>
              <option value="STATUS_CHANGED">Status Changed</option>
              <option value="FINDING_FIXED">Finding Fixed</option>
              <option value="FINDING_VERIFIED">Finding Verified</option>
              <option value="REPOSITORY_CONNECTED">Repository Connected</option>
              <option value="GITHUB_EVENT">GitHub Event</option>
            </select>
          </div>

          {/* 6. Date Range Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Date Range</label>
            <select
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Time</option>
              <option value="today">Today</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table (Brisk CRM Design) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Event Type</th>
                <th className="py-3.5 px-4">Repository</th>
                <th className="py-3.5 px-4">Developer</th>
                <th className="py-3.5 px-4">Severity / Status</th>
                <th className="py-3.5 px-4">Message / Target</th>
                <th className="py-3.5 px-4 text-right">Timestamp</th>
                <th className="py-3.5 px-4 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading platform event logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                    No audit logs match the current filter criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                          {getEventIcon(log.event)}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {log.event_label}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <FolderGit2 className="w-3 h-3 text-slate-400" />
                        {log.repository}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={log.developer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={log.developer?.name || 'User'}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">{log.developer?.name || 'System'}</div>
                          <div className="text-[10px] text-slate-400">{log.developer?.role || 'Automation'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {getSeverityBadge(log.severity)}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {log.status}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="truncate text-slate-700 dark:text-slate-300" title={log.message}>
                        {log.message}
                      </div>
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                        {log.target_resource}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      <span className="block text-[10px] text-slate-400 font-sans">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  {getEventIcon(selectedLog.event)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{selectedLog.event_label}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{selectedLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Message:</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{selectedLog.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Repository</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{selectedLog.repository}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Resource</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">{selectedLog.target_resource}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Severity / Status</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {getSeverityBadge(selectedLog.severity)}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedLog.status}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Timestamp</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{new Date(selectedLog.timestamp).toISOString()}</span>
                </div>
              </div>

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Metadata Payload</span>
                  <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-40">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
