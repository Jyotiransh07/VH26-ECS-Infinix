import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FolderGit2, 
  ChevronRight, 
  Play, 
  Activity, 
  ExternalLink,
  Workflow,
  FileCode
} from '@/components/icons';
import { ScanResult, IssueFinding, Project } from '../types';
import { DashboardStats } from '../services/api';

interface DashboardOverviewPageProps {
  stats: DashboardStats;
  scans: ScanResult[];
  projects: Project[];
  onTriggerScan: () => void;
  onNavigateTab: (tab: string) => void;
  onSelectFinding: (findingId: string) => void;
}

export const DashboardOverviewPage: React.FC<DashboardOverviewPageProps> = ({
  stats,
  scans,
  projects,
  onTriggerScan,
  onNavigateTab,
  onSelectFinding
}) => {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('30D');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{ date: string; files: number; findings: number; x: number; y: number } | null>(null);

  const { summary } = stats;

  // Realistic Clean Activity Data
  const activityPoints = timeRange === '7D' ? [
    { date: 'Aug 29', files: 12, findings: 1, x: 50, y: 130 },
    { date: 'Aug 30', files: 16, findings: 0, x: 150, y: 150 },
    { date: 'Aug 31', files: 14, findings: 2, x: 250, y: 110 },
    { date: 'Sep 01', files: 18, findings: 1, x: 350, y: 125 },
    { date: 'Sep 02', files: 22, findings: 3, x: 450, y: 95 },
    { date: 'Sep 03', files: 19, findings: 1, x: 550, y: 120 },
    { date: 'Sep 04', files: 24, findings: 4, x: 650, y: 80 }
  ] : timeRange === '30D' ? [
    { date: 'Aug 05', files: 10, findings: 1, x: 50, y: 135 },
    { date: 'Aug 10', files: 18, findings: 2, x: 150, y: 120 },
    { date: 'Aug 15', files: 22, findings: 0, x: 250, y: 150 },
    { date: 'Aug 20', files: 28, findings: 3, x: 350, y: 100 },
    { date: 'Aug 25', files: 31, findings: 1, x: 450, y: 130 },
    { date: 'Aug 30', files: 26, findings: 2, x: 550, y: 115 },
    { date: 'Sep 04', files: 34, findings: 4, x: 650, y: 75 }
  ] : [
    { date: 'Jun', files: 45, findings: 8, x: 50, y: 120 },
    { date: 'Jul', files: 62, findings: 12, x: 200, y: 90 },
    { date: 'Aug', files: 88, findings: 6, x: 400, y: 110 },
    { date: 'Sep', files: 110, findings: 4, x: 650, y: 75 }
  ];

  const recentFindings = scans[0]?.findings || [];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100 dark:border-slate-800/60">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Keep your repositories clean and prevent resource leaks before they reach production.
          </p>
        </div>
      </div>

      {/* Row 1: 4 Compact Horizontal Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div 
          onClick={() => onNavigateTab('findings')}
          className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer select-none"
        >
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Open findings</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
              {summary.open_leaks || 4}
            </span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              4 need attention
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => onNavigateTab('findings')}
          className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer select-none"
        >
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Critical</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
              {summary.definite_leaks || 2}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              High severity
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => onNavigateTab('repositories')}
          className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer select-none"
        >
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Repositories</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
              {projects.length || 5}
            </span>
            <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
              Monitored
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => onNavigateTab('scans')}
          className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer select-none"
        >
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Last scan</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight truncate">
              Today, 10:42 AM
            </span>
            <span className="text-xs font-mono text-slate-400">
              sample-repo
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Scan Activity (8 cols) & Repository Health (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Large: Scan Activity */}
        <div className="lg:col-span-8 p-4 sm:p-5 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Scan activity
              </h3>
              <p className="text-xs text-slate-400">
                Scans completed over the selected period.
              </p>
            </div>

            {/* Time Controls */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-0.5 rounded-md text-xs font-medium text-slate-500">
              {(['7D', '30D', '90D'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setTimeRange(tab)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                    timeRange === tab
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-2xs'
                      : 'hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Neutral SVG Area Chart */}
          <div className="relative h-44 w-full">
            <svg viewBox="0 0 700 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="40" x2="680" y2="40" stroke="currentColor" className="text-slate-100 dark:text-slate-800/60" strokeDasharray="3 3" />
              <line x1="40" y1="90" x2="680" y2="90" stroke="currentColor" className="text-slate-100 dark:text-slate-800/60" strokeDasharray="3 3" />
              <line x1="40" y1="140" x2="680" y2="140" stroke="currentColor" className="text-slate-100 dark:text-slate-800/60" strokeDasharray="3 3" />

              {/* Area & Line */}
              <path
                d={`M ${activityPoints.map(p => `${p.x} ${p.y}`).join(' L ')} L ${activityPoints[activityPoints.length - 1].x} 170 L ${activityPoints[0].x} 170 Z`}
                fill="url(#chartFill)"
              />
              <path
                d={`M ${activityPoints.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                fill="none"
                stroke="#0d9488"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {activityPoints.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#0d9488"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-transform hover:scale-150"
                    onMouseEnter={() => setHoveredDataPoint(pt)}
                    onMouseLeave={() => setHoveredDataPoint(null)}
                  />
                  <text
                    x={pt.x}
                    y="172"
                    textAnchor="middle"
                    className="text-[10px] fill-slate-400 font-mono"
                  >
                    {pt.date}
                  </text>
                </g>
              ))}
            </svg>

            {/* Clean Tooltip */}
            {hoveredDataPoint && (
              <div 
                className="absolute -top-3 p-2 bg-slate-900 text-white dark:bg-slate-800 rounded shadow-md text-xs pointer-events-none z-20 border border-slate-700"
                style={{ left: `${(hoveredDataPoint.x / 700) * 100}%`, transform: 'translateX(-50%)' }}
              >
                <div className="font-semibold text-[11px] text-slate-200">{hoveredDataPoint.date}</div>
                <div className="text-slate-400 text-[10px] mt-0.5">{hoveredDataPoint.files} files scanned</div>
                <div className="text-teal-400 text-[10px] font-medium">{hoveredDataPoint.findings} findings</div>
              </div>
            )}
          </div>
        </div>

        {/* Small: Repository Health */}
        <div className="lg:col-span-4 p-4 sm:p-5 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Repository health
              </h3>
              <button 
                onClick={() => onNavigateTab('repositories')}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
              >
                View all
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-900 dark:text-white block">
                    core-api
                  </span>
                  <span className="text-[11px] text-slate-400">main · Scanned 10m ago</span>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Healthy
                  </span>
                  <span className="text-[10px] text-slate-400 block">0 open findings</span>
                </div>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-900 dark:text-white block">
                    demo-project
                  </span>
                  <span className="text-[11px] text-slate-400">main · Scanned 1h ago</span>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Needs attention
                  </span>
                  <span className="text-[10px] text-slate-400 block">3 open findings</span>
                </div>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-900 dark:text-white block">
                    sample-repo-python
                  </span>
                  <span className="text-[11px] text-slate-400">main · Scanned just now</span>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Critical
                  </span>
                  <span className="text-[10px] text-slate-400 block">4 open findings</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onTriggerScan}
            className="w-full mt-3 py-2 px-3 rounded text-xs font-medium bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3 h-3" />
            <span>Scan a repository</span>
          </button>
        </div>

      </div>

      {/* Row 3: Recent Findings (8 cols) & Recent Scans (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Large: Recent Findings Table */}
        <div className="lg:col-span-8 p-4 sm:p-5 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Recent findings
              </h3>
              <p className="text-xs text-slate-400">
                Resource leaks requiring developer investigation and cleanup.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('findings')}
              className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
            >
              View all findings
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/60 text-slate-400 font-medium">
                  <th className="pb-2 font-medium">Severity</th>
                  <th className="pb-2 font-medium">Finding</th>
                  <th className="pb-2 font-medium">Repository</th>
                  <th className="pb-2 font-medium">File</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Detected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {recentFindings.slice(0, 4).map((f) => (
                  <tr
                    key={f.id}
                    onClick={() => onSelectFinding(f.id)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5">
                      <span className={`inline-flex items-center gap-1 font-mono font-medium text-[11px] ${
                        f.severity === 'HIGH' || f.severity === 'CRITICAL' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          f.severity === 'HIGH' || f.severity === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-500'
                        }`} />
                        {f.severity}
                      </span>
                    </td>
                    <td className="py-2.5 font-medium text-slate-900 dark:text-slate-200">
                      {f.reason || 'Resource handle is not closed'}
                    </td>
                    <td className="py-2.5 font-mono text-slate-500">
                      sample-repo
                    </td>
                    <td className="py-2.5 font-mono text-slate-500">
                      {f.file}:{f.line}
                    </td>
                    <td className="py-2.5">
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {f.status || 'Open'}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-slate-400">
                      2 min ago
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Small: Recent Scans */}
        <div className="lg:col-span-4 p-4 sm:p-5 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recent scans
            </h3>
            <button
              onClick={() => onNavigateTab('scans')}
              className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
            >
              History
            </button>
          </div>

          <div className="space-y-3">
            {scans.slice(0, 3).map((s, idx) => (
              <div 
                key={s.id || idx}
                className="p-2.5 rounded bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 text-xs"
              >
                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-900 dark:text-white font-mono">{s.repository_name || 'sample-repo-python'}</span>
                  <span className={`text-[11px] ${
                    (s.summary?.definite_leaks || 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {(s.summary?.definite_leaks || 0) > 0 ? 'Needs attention' : 'Passed'}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>branch: main · {s.summary?.files_scanned || 6} files</span>
                  <span>{idx === 0 ? 'Just now' : `${idx * 2}h ago`}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 4: Integrations Quick Overview */}
      <div className="p-4 sm:p-5 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Integrations & CI/CD
            </h3>
            <p className="text-xs text-slate-400">
              Enforce resource leak prevention in your developer workflow.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div 
            onClick={() => onNavigateTab('actions')}
            className="p-3 rounded border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 hover:border-slate-200 dark:hover:border-slate-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">GitHub Actions</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Connected</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Automatic AST checks on pull requests and commits.
            </p>
          </div>

          <div 
            onClick={() => onNavigateTab('precommit')}
            className="p-3 rounded border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 hover:border-slate-200 dark:hover:border-slate-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">Pre-commit checks</span>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">Configured</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Prevent committing unclosed file and socket handles locally.
            </p>
          </div>

          <div 
            onClick={() => onNavigateTab('cli')}
            className="p-3 rounded border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 hover:border-slate-200 dark:hover:border-slate-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">CLI Tool</span>
              <span className="text-[10px] text-slate-400 font-mono">v0.1.0</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Direct terminal execution: python -m leakguard.cli scan
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
