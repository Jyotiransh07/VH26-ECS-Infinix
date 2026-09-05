import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Cpu, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users, 
  FolderGit2, 
  Calendar, 
  RefreshCw,
  Download,
  Filter,
  Layers,
  Sparkles
} from '@/components/icons';
import { api } from '../services/api';

interface AnalyticsPageProps {
  viewMode?: 'health' | 'trends' | 'activity';
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ viewMode = 'health' }) => {
  const [activeTab, setActiveTab] = useState<'health' | 'trends' | 'activity'>(viewMode);
  const [loading, setLoading] = useState<boolean>(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(null);

  useEffect(() => {
    setActiveTab(viewMode);
  }, [viewMode]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics();
      setAnalyticsData(res);
    } catch (e) {
      console.error('Failed to load analytics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const severityData = analyticsData?.severity_chart || [
    { name: 'Critical', value: 4, color: '#e11d48' },
    { name: 'High', value: 2, color: '#f43f5e' },
    { name: 'Medium', value: 1, color: '#f59e0b' },
    { name: 'Low', value: 0, color: '#10b981' }
  ];

  const resourceData = analyticsData?.resource_chart || [
    { resource: 'File Handles', open: 2, resolved: 5, total: 7, fill: '#0ea5e9' },
    { resource: 'DB Connections', open: 1, resolved: 3, total: 4, fill: '#8b5cf6' },
    { resource: 'Network Sockets', open: 1, resolved: 2, total: 3, fill: '#ec4899' },
    { resource: 'Custom Descriptors', open: 0, resolved: 2, total: 2, fill: '#14b8a6' }
  ];

  const findingTrendData = analyticsData?.finding_trend || [
    { date: 'Aug 22', definite: 12, likely: 4, resolved: 2 },
    { date: 'Aug 24', definite: 10, likely: 3, resolved: 5 },
    { date: 'Aug 26', definite: 9, likely: 3, resolved: 7 },
    { date: 'Aug 28', definite: 7, likely: 2, resolved: 9 },
    { date: 'Aug 30', definite: 6, likely: 1, resolved: 11 },
    { date: 'Sep 01', definite: 5, likely: 1, resolved: 13 },
    { date: 'Sep 03', definite: 4, likely: 0, resolved: 15 },
    { date: 'Sep 05', definite: 4, likely: 0, resolved: 16 }
  ];

  const resolutionTrendData = analyticsData?.resolution_trend || [
    { date: 'Aug 22', mttr_hours: 6.8, resolution_rate: 65 },
    { date: 'Aug 24', mttr_hours: 5.9, resolution_rate: 70 },
    { date: 'Aug 26', mttr_hours: 5.1, resolution_rate: 75 },
    { date: 'Aug 28', mttr_hours: 4.4, resolution_rate: 82 },
    { date: 'Aug 30', mttr_hours: 3.8, resolution_rate: 88 },
    { date: 'Sep 01', mttr_hours: 3.5, resolution_rate: 91 },
    { date: 'Sep 03', mttr_hours: 3.4, resolution_rate: 94 },
    { date: 'Sep 05', mttr_hours: 3.2, resolution_rate: 96 }
  ];

  const scanTrendData = analyticsData?.scan_trend || [
    { week: 'Wk 31', scans: 18, files: 120, avg_ms: 32 },
    { week: 'Wk 32', scans: 24, files: 160, avg_ms: 29 },
    { week: 'Wk 33', scans: 31, files: 210, avg_ms: 28 },
    { week: 'Wk 34', scans: 28, files: 195, avg_ms: 27 },
    { week: 'Wk 35', scans: 38, files: 240, avg_ms: 25 },
    { week: 'Wk 36', scans: 42, files: 280, avg_ms: 24 }
  ];

  const repoHealthData = analyticsData?.repository_health || [
    { name: 'payment-service', health: 98, open_leaks: 0, total_files: 14 },
    { name: 'demo-project', health: 95, open_leaks: 1, total_files: 1 },
    { name: 'auth-service', health: 88, open_leaks: 2, total_files: 8 },
    { name: 'legacy-vault', health: 70, open_leaks: 3, total_files: 5 },
    { name: 'sample-repo-python', health: 40, open_leaks: 4, total_files: 6 }
  ];

  const developerActivityData = analyticsData?.developer_activity || [
    { name: 'Janson Williams', role: 'Security Lead', triaged: 28, fixed: 14, pr_scans: 45, score: 98, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    { name: 'Elena Rostova', role: 'Staff Engineer', triaged: 19, fixed: 12, pr_scans: 24, score: 94, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
    { name: 'Marcus Chen', role: 'Backend Lead', triaged: 15, fixed: 8, pr_scans: 30, score: 89, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
    { name: 'Sarah Miller', role: 'DevOps Engineer', triaged: 11, fixed: 6, pr_scans: 18, score: 85, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80' }
  ];

  // Helper to calculate SVG Pie Segments
  const totalSeverity = severityData.reduce((acc: number, curr: any) => acc + curr.value, 0) || 1;
  let accumulatedAngle = 0;
  const pieSegments = severityData.map((d: any) => {
    const fraction = d.value / totalSeverity;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + fraction * 2 * Math.PI;
    accumulatedAngle = endAngle;

    const r1 = 55, r2 = 80;
    const x1 = 100 + r1 * Math.cos(startAngle);
    const y1 = 100 + r1 * Math.sin(startAngle);
    const x2 = 100 + r2 * Math.cos(startAngle);
    const y2 = 100 + r2 * Math.sin(startAngle);
    const x3 = 100 + r2 * Math.cos(endAngle);
    const y3 = 100 + r2 * Math.sin(endAngle);
    const x4 = 100 + r1 * Math.cos(endAngle);
    const y4 = 100 + r1 * Math.sin(endAngle);
    const largeArc = fraction > 0.5 ? 1 : 0;

    const path = `M ${x1} ${y1} L ${x2} ${y2} A ${r2} ${r2} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${r1} ${r1} 0 ${largeArc} 0 ${x1} ${y1} Z`;
    return { ...d, path, fraction };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Security Analytics & AST Telemetry</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40">
              Live AST Insights
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deep AST code health metrics, longitudinal leak trends, and developer remediation activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 shadow-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <button
            onClick={loadAnalytics}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'health'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          Code Health
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'trends'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Leak Trends
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'activity'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Developer Activity
        </button>
      </div>

      {/* 1. CODE HEALTH VIEW */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Clean Code Ratio</span>
              <div className="mt-2 text-2xl font-bold text-teal-600 dark:text-teal-400">88.4%</div>
              <p className="text-xs text-slate-500 mt-1">Safe control-flow paths</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Avg MTTR</span>
              <div className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">3.2 hrs</div>
              <p className="text-xs text-slate-500 mt-1">Mean time to remediate</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Open Definite Leaks</span>
              <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">4 Leaks</div>
              <p className="text-xs text-slate-500 mt-1">Direct context manager fixes</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">AST Verification</span>
              <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">100% Pass</div>
              <p className="text-xs text-teal-500 mt-1">Zero False Positives</p>
            </div>
          </div>

          {/* Charts Row: Severity Distribution & Resource Types */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Severity Chart (Donut SVG) */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Finding Severity Breakdown</h3>
                  <p className="text-xs text-slate-400">Distribution by security risk categorization</p>
                </div>
                <span className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500">
                  <AlertTriangle className="w-4 h-4" />
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-2">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                    {pieSegments.map((seg: any, idx: number) => (
                      <path
                        key={idx}
                        d={seg.path}
                        fill={seg.color}
                        className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      />
                    ))}
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalSeverity}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Leaks</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {severityData.map((d: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{d.name}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Resource Chart (Grouped Bars SVG) */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Resource Types Breakdown</h3>
                  <p className="text-xs text-slate-400">Open vs Resolved by acquired resource descriptor</p>
                </div>
                <span className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-500">
                  <Cpu className="w-4 h-4" />
                </span>
              </div>

              <div className="space-y-4 pt-2">
                {resourceData.map((res: any, idx: number) => {
                  const maxVal = 8;
                  const openPct = (res.open / maxVal) * 100;
                  const resolvedPct = (res.resolved / maxVal) * 100;
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>{res.resource}</span>
                        <div className="flex gap-3 text-[11px] font-mono">
                          <span className="text-rose-500">{res.open} open</span>
                          <span className="text-emerald-500">+{res.resolved} resolved</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full flex overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-l-full" style={{ width: `${openPct}%` }} />
                        <div className="bg-emerald-500 h-full" style={{ width: `${resolvedPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Repository Health Comparison Chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Repository Health Score Comparison</h3>
                <p className="text-xs text-slate-400">Cross-repository AST health index (0 to 100)</p>
              </div>
              <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-500">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {repoHealthData.map((repo: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FolderGit2 className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="font-mono font-bold text-xs text-slate-900 dark:text-white">{repo.name}</div>
                      <div className="text-[10px] text-slate-400">{repo.total_files} files • {repo.open_leaks} open leaks</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden hidden sm:block">
                      <div 
                        className={`h-2 rounded-full ${repo.health >= 80 ? 'bg-teal-500' : 'bg-rose-500'}`} 
                        style={{ width: `${repo.health}%` }} 
                      />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                      repo.health >= 80 
                        ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-900/50' 
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                    }`}>
                      {repo.health}/100
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. LEAK TRENDS VIEW */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* 1. Finding Trend Smooth Curve Chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Longitudinal Finding Trend</h3>
                <p className="text-xs text-slate-400">Definite vs Likely vs Resolved leaks over time</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1 text-rose-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Definite Leaks
                </span>
                <span className="flex items-center gap-1 text-emerald-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Resolved Leaks
                </span>
              </div>
            </div>

            <div className="pt-4">
              <svg viewBox="0 0 600 200" className="w-full h-52 overflow-visible">
                <defs>
                  <linearGradient id="trendDefiniteGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0"/>
                  </linearGradient>
                  <linearGradient id="trendResolvedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1="40" y1="20" x2="580" y2="20" stroke="#334155" strokeDasharray="3 3" opacity="0.2" />
                <line x1="40" y1="70" x2="580" y2="70" stroke="#334155" strokeDasharray="3 3" opacity="0.2" />
                <line x1="40" y1="120" x2="580" y2="120" stroke="#334155" strokeDasharray="3 3" opacity="0.2" />
                <line x1="40" y1="170" x2="580" y2="170" stroke="#334155" strokeDasharray="3 3" opacity="0.2" />

                {/* Smooth Area Paths */}
                <path
                  d="M 50 40 Q 120 70 200 90 T 350 130 T 500 140 T 570 140 L 570 170 L 50 170 Z"
                  fill="url(#trendDefiniteGrad)"
                />
                <path
                  d="M 50 40 Q 120 70 200 90 T 350 130 T 500 140 T 570 140"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="3"
                />

                <path
                  d="M 50 150 Q 120 130 200 110 T 350 70 T 500 40 T 570 30 L 570 170 L 50 170 Z"
                  fill="url(#trendResolvedGrad)"
                />
                <path
                  d="M 50 150 Q 120 130 200 110 T 350 70 T 500 40 T 570 30"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                />

                {/* Data Points */}
                {findingTrendData.map((d: any, idx: number) => {
                  const x = 50 + idx * 74;
                  return (
                    <g key={idx} className="cursor-pointer">
                      <text x={x} y="190" textAnchor="middle" fontSize="10" fill="#94a3b8">{d.date}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 2. MTTR Resolution Velocity */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mean Time to Remediation (MTTR)</h3>
                  <p className="text-xs text-slate-400">Average resolution latency in hours</p>
                </div>
                <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-500">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="space-y-3 pt-2">
                {resolutionTrendData.slice(0, 5).map((r: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{r.date}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{r.mttr_hours} hrs</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                        {r.resolution_rate}% resolved
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Scan Trend Velocity */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Weekly Scan Execution Trend</h3>
                  <p className="text-xs text-slate-400">AST scan runs & files inspected across pipeline</p>
                </div>
                <span className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-500">
                  <Activity className="w-4 h-4" />
                </span>
              </div>
              <div className="grid grid-cols-6 gap-2 pt-4 items-end h-44">
                {scanTrendData.map((s: any, idx: number) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full bg-sky-500/20 hover:bg-sky-500/40 rounded-t-lg transition-all flex items-end justify-center pb-1" style={{ height: `${(s.scans / 45) * 100}%` }}>
                      <span className="text-[10px] font-bold font-mono text-sky-600 dark:text-sky-400">{s.scans}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">{s.week}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. DEVELOPER ACTIVITY VIEW */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Developer Security Leaderboard</h3>
                <p className="text-xs text-slate-400">Remediation actions, PR scan verifications, and quality score</p>
              </div>
              <span className="text-xs font-mono text-indigo-500 font-bold">Top Contributors</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Engineer</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Leaks Triaged</th>
                  <th className="py-3.5 px-4">Leaks Fixed</th>
                  <th className="py-3.5 px-4">CI PR Scans</th>
                  <th className="py-3.5 px-4 text-center">Quality Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {developerActivityData.map((dev: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img src={dev.avatar} alt={dev.name} className="w-7 h-7 rounded-full object-cover" />
                        <span className="font-semibold text-slate-900 dark:text-white">{dev.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{dev.role}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">{dev.triaged}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">+{dev.fixed}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">{dev.pr_scans}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-900/50">
                        {dev.score}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
