import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Users, 
  FolderGit2, 
  ScanSearch, 
  AlertTriangle, 
  Clock, 
  Play, 
  CheckCircle2, 
  ExternalLink 
} from '@/components/icons';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { api } from '@/services/api';

interface AdminOverviewPageProps {
  onNavigate: (path: string) => void;
  onTriggerScan: () => void;
}

export const AdminOverviewPage: React.FC<AdminOverviewPageProps> = ({ onNavigate, onTriggerScan }) => {
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => setLastUpdated(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setLastUpdated(0);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Admin Overview"
        description="Platform-wide security telemetry, distributed pipeline, and cluster metrics."
        onRefresh={handleRefresh}
        lastUpdatedSeconds={lastUpdated}
      />

      {/* Row 1: 4 High-Level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Throughput */}
        <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Throughput Capacity</span>
            <span className="text-[10px] font-mono font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 px-1.5 py-0.2 rounded border border-purple-500/20">
              SIMULATION
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            5,000 <span className="text-xs font-normal text-slate-400">scans/min</span>
          </div>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-mono block">
            Distributed Celery / ECS Pool
          </span>
        </div>

        {/* Card 2: Average Scan Latency */}
        <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Average Scan Latency</span>
            <span className="text-[10px] font-mono font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 px-1.5 py-0.2 rounded border border-teal-500/20">
              LIVE
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            142 <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono block">
            AST Parse + CFG Path Search
          </span>
        </div>

        {/* Card 3: Active Worker Pool */}
        <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Worker Pool</span>
            <span className="text-[10px] font-mono font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 px-1.5 py-0.2 rounded border border-purple-500/20">
              SIMULATION
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            4 / 8 <span className="text-xs font-normal text-slate-400">Nodes</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono block">
            ● Autoscale Ready (us-east-1)
          </span>
        </div>

        {/* Card 4: Monitored Repos */}
        <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Repositories</span>
            <span className="text-[10px] font-mono font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 px-1.5 py-0.2 rounded border border-teal-500/20">
              LIVE
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            5 <span className="text-xs font-normal text-slate-400">Connected</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono block">
            4 Definite Leaks Tracked
          </span>
        </div>
      </div>

      {/* Row 2: Distributed Architecture Pipeline */}
      <div className="p-5 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Distributed Architecture Pipeline
            </h3>
            <p className="text-xs text-slate-400">
              Multi-tier job dispatching model from GitHub webhook to AST discovery.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-semibold">
            ARCHITECTURAL MODEL
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs pt-2">
          <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-mono text-[10px] text-slate-400 block">Tier 1</span>
            <span className="font-bold text-slate-900 dark:text-white mt-1 block">GitHub Webhook</span>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">100% async</span>
          </div>
          <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-mono text-[10px] text-slate-400 block">Tier 2</span>
            <span className="font-bold text-slate-900 dark:text-white mt-1 block">Node API Gateway</span>
            <span className="text-[10px] text-slate-400 font-mono">Port 3001</span>
          </div>
          <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-mono text-[10px] text-slate-400 block">Tier 3</span>
            <span className="font-bold text-slate-900 dark:text-white mt-1 block">Redis Job Queue</span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">Job Dispatch</span>
          </div>
          <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-mono text-[10px] text-slate-400 block">Tier 4</span>
            <span className="font-bold text-slate-900 dark:text-white mt-1 block">Python Workers</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">4 instances</span>
          </div>
          <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-mono text-[10px] text-slate-400 block">Tier 5</span>
            <span className="font-bold text-slate-900 dark:text-white mt-1 block">LeakGuard CLI</span>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">AST/CFG Core</span>
          </div>
          <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-mono text-[10px] text-slate-400 block">Tier 6</span>
            <span className="font-bold text-slate-900 dark:text-white mt-1 block">Supabase DB</span>
            <span className="text-[10px] text-slate-400 font-mono">RLS Protected</span>
          </div>
          <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-mono text-[10px] text-slate-400 block">Tier 7</span>
            <span className="font-bold text-slate-900 dark:text-white mt-1 block">Live Dashboard</span>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">Vite / React</span>
          </div>
        </div>
      </div>

      {/* Row 3: Worker Node Telemetry Table */}
      <div className="p-5 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Worker Node Cluster Telemetry
          </h3>
          <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold bg-purple-500/10 px-1.5 py-0.2 rounded border border-purple-500/20">
            SIMULATION
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                <th className="pb-2 font-medium">Worker Node</th>
                <th className="pb-2 font-medium">Region</th>
                <th className="pb-2 font-medium">CPU Utilization</th>
                <th className="pb-2 font-medium">Memory (RSS)</th>
                <th className="pb-2 font-medium">Scans Handled</th>
                <th className="pb-2 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-slate-600 dark:text-slate-300 text-[11px]">
              <tr>
                <td className="py-2.5 font-bold text-slate-900 dark:text-white font-sans">worker-us-east-01</td>
                <td className="py-2.5">us-east-1</td>
                <td className="py-2.5">24%</td>
                <td className="py-2.5">142 MB</td>
                <td className="py-2.5">1,248</td>
                <td className="py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-semibold">● ACTIVE</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-900 dark:text-white font-sans">worker-us-east-02</td>
                <td className="py-2.5">us-east-1</td>
                <td className="py-2.5">38%</td>
                <td className="py-2.5">188 MB</td>
                <td className="py-2.5">2,190</td>
                <td className="py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-semibold">● ACTIVE</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-900 dark:text-white font-sans">worker-eu-west-01</td>
                <td className="py-2.5">eu-west-1</td>
                <td className="py-2.5">12%</td>
                <td className="py-2.5">110 MB</td>
                <td className="py-2.5">842</td>
                <td className="py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-semibold">● ACTIVE</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-900 dark:text-white font-sans">worker-ap-south-01</td>
                <td className="py-2.5">ap-south-1</td>
                <td className="py-2.5">8%</td>
                <td className="py-2.5">96 MB</td>
                <td className="py-2.5">410</td>
                <td className="py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-semibold">● STANDBY</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
