import React, { useState } from 'react';
import { 
  FolderGit2, 
  Files, 
  AlertTriangle, 
  ShieldAlert, 
  FileText, 
  Play, 
  ArrowRight
} from '@/components/icons';
import { ScanResult, IssueFinding, Project } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ScanTable } from '../components/scans/ScanTable';
import { ScanActivityChart } from '../components/dashboard/ScanActivityChart';

interface OverviewPageProps {
  scans: ScanResult[];
  projects: Project[];
  onTriggerScan: () => void;
  onNavigateTab: (tab: string) => void;
  onSelectFinding: (findingId: string) => void;
  onSelectScan: (scanId: string) => void;
}

const activityData24H = [
  { time: '00:00', scans: 2, leaks: 1 },
  { time: '04:00', scans: 1, leaks: 0 },
  { time: '08:00', scans: 5, leaks: 3 },
  { time: '12:00', scans: 8, leaks: 4 },
  { time: '16:00', scans: 14, leaks: 4 },
  { time: '20:00', scans: 9, leaks: 2 },
  { time: 'Now', scans: 12, leaks: 4 },
];

const activityData7D = [
  { time: 'Mon', scans: 18, leaks: 6 },
  { time: 'Tue', scans: 24, leaks: 8 },
  { time: 'Wed', scans: 31, leaks: 11 },
  { time: 'Thu', scans: 28, leaks: 7 },
  { time: 'Fri', scans: 42, leaks: 14 },
  { time: 'Sat', scans: 15, leaks: 3 },
  { time: 'Sun', scans: 12, leaks: 4 },
];

export const OverviewPage: React.FC<OverviewPageProps> = ({
  scans,
  projects,
  onTriggerScan,
  onNavigateTab,
  onSelectFinding,
  onSelectScan,
}) => {
  const [timeRange, setTimeRange] = useState<'24H' | '7D' | '30D' | '90D'>('24H');

  const latestScan = scans[0];
  const totalFiles = scans.reduce((acc, s) => acc + s.summary.files_scanned, 0) || 6;
  const totalLeaks = scans.reduce((acc, s) => acc + s.summary.definite_leaks + s.summary.likely_leaks, 0) || 4;
  const definiteLeaks = scans.reduce((acc, s) => acc + s.summary.definite_leaks, 0) || 4;
  const safePatterns = scans.reduce((acc, s) => acc + s.summary.safe_patterns, 0) || 3;

  const resourceTypesData = [
    { name: 'File Stream', count: 2, color: '#8b5cf6' },
    { name: 'SQLite Connection', count: 1, color: '#ec4899' },
    { name: 'Network Socket', count: 1, color: '#3b82f6' },
  ];

  const chartData = timeRange === '24H' ? activityData24H : activityData7D;

  const recentFindings: IssueFinding[] = scans.flatMap(s => s.findings).slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Security Overview
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Monitor resource leaks and static-analysis results across your Python projects.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            onClick={() => onNavigateTab('reports')} 
            icon={<FileText className="w-4 h-4" />}
          >
            View Reports
          </Button>
          <Button 
            onClick={onTriggerScan} 
            icon={<Play className="w-4 h-4 fill-current" />}
          >
            Run Scan
          </Button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: Projects */}
        <div className="card-elevated p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Projects</span>
            <div className="p-2 rounded-xl bg-white/5 text-zinc-300">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white tracking-tight font-mono">
              {projects.length || 3}
            </div>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-medium">100% active</span> across workspace
            </p>
          </div>
        </div>

        {/* CARD 2: Files Scanned */}
        <div className="card-elevated p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Files Scanned</span>
            <div className="p-2 rounded-xl bg-white/5 text-zinc-300">
              <Files className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white tracking-tight font-mono">
              {totalFiles}
            </div>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
              <span className="text-primary-light font-medium">AST parsed</span> in {latestScan?.duration_ms || 184}ms
            </p>
          </div>
        </div>

        {/* CARD 3: Leaks Detected */}
        <div className="card-elevated p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Leaks Detected</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-amber-400 tracking-tight font-mono">
              {totalLeaks}
            </div>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
              <span className="text-amber-400 font-medium">{safePatterns} safe patterns</span> verified
            </p>
          </div>
        </div>

        {/* CARD 4: High Confidence (Strong visual emphasis) */}
        <div className="card-elevated p-5 flex flex-col justify-between border border-rose-500/30 bg-gradient-to-br from-[#1b1218] to-card shadow-glow-red">
          <div className="flex items-center justify-between text-rose-300">
            <span className="text-xs font-semibold uppercase tracking-wider">High / Definite</span>
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-rose-400 tracking-tight font-mono">
              {definiteLeaks}
            </div>
            <p className="text-xs text-rose-300/80 mt-1 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              Blocks CI Enforcement Policy
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Scan Activity Chart (2 cols) */}
        <div className="lg:col-span-2 card-elevated p-6">
          <ScanActivityChart
            data={chartData}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </div>

        {/* Leak Distribution & Confidence (1 col) */}
        <div className="card-elevated p-6 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Resource Types</h3>
            <p className="text-xs text-zinc-400">Distribution by tracked descriptor type</p>
          </div>

          <div className="space-y-4">
            {resourceTypesData.map((res) => (
              <div key={res.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-zinc-300">{res.name}</span>
                  <span className="font-mono text-zinc-400">{res.count} finding(s)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${(res.count / 4) * 100}%`, backgroundColor: res.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Confidence Breakdown Card */}
          <div className="pt-4 border-t border-white/5 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Confidence Classification
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                <span className="block font-bold">Definite: {definiteLeaks}</span>
                <span className="text-[10px] text-zinc-400">Exits without cleanup</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <span className="block font-bold">Safe: {safePatterns}</span>
                <span className="text-[10px] text-zinc-400">Context manager</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Scans Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Recent Scans</h3>
            <p className="text-xs text-zinc-400">Latest static analysis runs across repository branches</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onNavigateTab('scans')} icon={<ArrowRight className="w-4 h-4" />}>
            View All Scans
          </Button>
        </div>

        <ScanTable 
          scans={scans} 
          onSelectScan={onSelectScan}
        />
      </div>

      {/* Recent Issues Highlights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Recent High-Confidence Findings</h3>
            <p className="text-xs text-zinc-400">Click any finding to inspect its CFG, source code, and remediation</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onNavigateTab('issues')} icon={<ArrowRight className="w-4 h-4" />}>
            Explore All Issues
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentFindings.map((finding) => (
            <div
              key={finding.id}
              onClick={() => onSelectFinding(finding.id)}
              className="card-elevated p-5 space-y-3 cursor-pointer hover:border-primary/40 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="severity" value={finding.severity} />
                  <Badge variant="confidence" value={finding.confidence} />
                </div>
                <span className="text-xs font-mono text-zinc-400 group-hover:text-primary-light transition-colors flex items-center gap-1">
                  Inspect <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div>
                <div className="font-mono text-xs font-semibold text-white">
                  {finding.file}:{finding.line}
                </div>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                  {finding.reason}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-zinc-500 font-mono">
                <span>Resource: {finding.resource_type} ('{finding.variable_name}')</span>
                <span>Path: {finding.path.length} node(s)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
