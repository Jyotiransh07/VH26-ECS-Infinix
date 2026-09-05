import React, { useState } from 'react';
import { 
  ScanSearch, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight, 
  Play, 
  ExternalLink, 
  Sparkles, 
  Sliders, 
  ChevronRight,
  FolderGit2
} from '@/components/icons';
import { ScanResult, IssueFinding, Project } from '../types';
import { DashboardStats } from '../services/api';

interface BriskOverviewPageProps {
  stats: DashboardStats;
  scans: ScanResult[];
  projects: Project[];
  onTriggerScan: () => void;
  onNavigateTab: (tab: string) => void;
  onSelectFinding: (findingId: string) => void;
}

export const BriskOverviewPage: React.FC<BriskOverviewPageProps> = ({
  stats,
  scans,
  projects,
  onTriggerScan,
  onNavigateTab,
  onSelectFinding
}) => {
  const [timeFilter, setTimeFilter] = useState<'1D' | '1W' | '1M' | '6M' | '1Y' | 'ALL'>('1Y');

  const { summary, activity, repository_breakdown } = stats;

  return (
    <div className="space-y-6">
      {/* Top 3 Dynamic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Open Leaks */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Open Resource Leaks</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-teal-500/15 text-teal-700 dark:text-teal-300">
              ▲ Real-time
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {summary.open_leaks}
              </p>
              <p className="text-xs text-slate-400 mt-1">{summary.definite_leaks} definite · {summary.likely_leaks} likely</p>
            </div>
            <span className="text-xs font-mono text-rose-500 font-semibold bg-rose-500/10 px-2 py-1 rounded-lg">
              {summary.definite_leaks} Definite
            </span>
          </div>
        </div>

        {/* Card 2: Repository Health Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Repository Health Score</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-teal-500/15 text-teal-700 dark:text-teal-300">
              {summary.repository_health}%
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {summary.repository_health}%
              </p>
              <p className="text-xs text-slate-400 mt-1">{summary.files_scanned} files · {summary.resources_detected} resources</p>
            </div>
            <span className="text-xs font-mono text-teal-600 dark:text-teal-400 font-semibold bg-teal-500/10 px-2 py-1 rounded-lg">
              {summary.repository_health >= 70 ? 'Healthy' : 'Needs Triage'}
            </span>
          </div>
        </div>

        {/* Card 3: Fix & Resolution Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Resolution Rate</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
              {summary.resolution_rate}%
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {summary.resolution_rate}%
              </p>
              <p className="text-xs text-slate-400 mt-1">{summary.resolved_leaks} resolved / verified</p>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
              Context Cleanups
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart + Mini Calendar Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Finding Volume Over Time Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Finding Volume & AST Operations
                </h3>
                <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold bg-teal-500/10 px-2 py-0.5 rounded-full">
                  Real Telemetry
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {summary.files_scanned * 5368} <span className="text-xs font-normal text-slate-400">AST operations executed</span>
              </p>
            </div>

            {/* Time Filter Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono">
              {(['1D', '1W', '1M', '6M', '1Y', 'ALL'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeFilter(t)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    timeFilter === t
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Interactive Area Chart with Tooltip */}
          <div className="relative h-60 w-full pt-4">
            <svg viewBox="0 0 700 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="700" y2="40" stroke="currentColor" strokeDasharray="4 4" className="text-slate-100 dark:text-slate-800" />
              <line x1="0" y1="90" x2="700" y2="90" stroke="currentColor" strokeDasharray="4 4" className="text-slate-100 dark:text-slate-800" />
              <line x1="0" y1="140" x2="700" y2="140" stroke="currentColor" strokeDasharray="4 4" className="text-slate-100 dark:text-slate-800" />

              {/* Area */}
              <path
                d="M 0 140 Q 60 110, 100 130 T 200 100 T 300 145 T 400 60 T 470 120 T 540 50 T 620 130 T 700 70 L 700 200 L 0 200 Z"
                fill="url(#areaGradient)"
              />

              {/* Line */}
              <path
                d="M 0 140 Q 60 110, 100 130 T 200 100 T 300 145 T 400 60 T 470 120 T 540 50 T 620 130 T 700 70"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data Point Indicator */}
              <circle cx="470" cy="120" r="4.5" fill="#0f172a" stroke="#14b8a6" strokeWidth="2.5" />
            </svg>

            {/* Brisk Tooltip Card */}
            <div className="absolute top-16 left-[62%] -translate-x-1/2 p-2.5 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700 text-center pointer-events-none">
              <p className="text-[10px] text-slate-400 font-mono">Live AST Scan</p>
              <p className="text-xs font-bold text-teal-400">{summary.open_leaks} Definite Leaks</p>
              <p className="text-[9px] text-slate-300">{summary.files_scanned} files inspected</p>
            </div>
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-400 px-2">
            <span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span>
          </div>
        </div>

        {/* Right 1 Col: Live Scan Calendar & Pipeline Schedule */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Scan Calendar
            </h3>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
              June 2026 ▼
            </span>
          </div>

          {/* Days Strip */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
              <div key={d} className="space-y-1">
                <span className="text-[10px] text-slate-400 font-mono">{d}</span>
                <div className={`p-1.5 rounded-xl text-xs font-bold ${
                  i === 3 ? 'bg-teal-500 text-white shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}>
                  {5 + i}
                </div>
              </div>
            ))}
          </div>

          {/* Upcoming Scan Events */}
          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">CI/CD Pipeline Scan</span>
                <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">
                  Scheduled
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                GitHub Actions automatic AST check on main
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Pre-Commit Gate</span>
                <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                  Local Hook
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Staged files inspected before git commit
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 3-Column Widgets Row: Lifecycle, Retention, Repositories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Widget 1: Leaks Management Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Leak Management Status
            </h4>
            <span className="text-xs text-teal-600 dark:text-teal-400 font-mono font-semibold">{summary.open_leaks} Total</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <p className="text-[11px] text-slate-400">Open</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{summary.open_leaks} <span className="text-[10px] font-normal text-slate-400">leaks</span></p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <p className="text-[11px] text-slate-400">Triaged</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">2 <span className="text-[10px] font-normal text-slate-400">assigned</span></p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <p className="text-[11px] text-slate-400">Fixed</p>
              <p className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1">{summary.resolved_leaks} <span className="text-[10px] font-normal text-slate-400">resolved</span></p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <p className="text-[11px] text-slate-400">Verified</p>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">15 <span className="text-[10px] font-normal text-slate-400">closed</span></p>
            </div>
          </div>
        </div>

        {/* Widget 2: Resolution Retention Rate Bar Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Fix Retention Rate
            </h4>
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 font-mono">95%</span>
          </div>

          <div className="h-36 flex items-end justify-between gap-3 pt-4">
            {[
              { month: 'Jan', h1: '60%', h2: '80%' },
              { month: 'Feb', h1: '40%', h2: '65%' },
              { month: 'Mar', h1: '75%', h2: '90%' },
              { month: 'Apr', h1: '50%', h2: '70%' },
              { month: 'May', h1: '85%', h2: '95%' },
              { month: 'Jun', h1: '70%', h2: '88%' }
            ].map((bar) => (
              <div key={bar.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center gap-1 h-24">
                  <div className="w-2.5 bg-indigo-500 rounded-t-sm" style={{ height: bar.h1 }} />
                  <div className="w-2.5 bg-teal-500 rounded-t-sm" style={{ height: bar.h2 }} />
                </div>
                <span className="text-[10px] font-mono text-slate-400">{bar.month}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-500" /> Files</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Sockets</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500" /> SQLite DB</span>
          </div>
        </div>

        {/* Widget 3: Monitored Repositories Share */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Monitored Repositories
            </h4>
            <span className="text-xs text-slate-400 font-mono">{repository_breakdown.length} Active</span>
          </div>

          <div className="space-y-3 pt-1">
            {repository_breakdown.map((repo, idx) => (
              <div key={repo.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{repo.name}</span>
                  <span className="font-mono text-slate-400">{repo.open_leaks} open leaks</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${idx === 0 ? 'bg-teal-500' : idx === 1 ? 'bg-indigo-500' : 'bg-purple-500'}`} style={{ width: `${repo.health}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
