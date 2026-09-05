import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Users, 
  FolderGit2, 
  ScanSearch, 
  AlertTriangle, 
  FileText, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Play, 
  ExternalLink,
  Download,
  Filter,
  Search
} from '@/components/icons';
import { api } from '../services/api';

interface AdminDashboardPageProps {
  backendOnline: boolean;
  onNavigateToUserApp: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ 
  backendOnline,
  onNavigateToUserApp 
}) => {
  const [activeTab, setActiveTab] = useState<'scalability' | 'cost' | 'interactions' | 'health'>('scalability');
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live User Interactions / Audit Stream
  const userInteractions = [
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

  const filteredInteractions = userInteractions.filter(item => {
    if (filterAction !== 'ALL' && item.action !== filterAction) return false;
    if (searchQuery && !item.user.toLowerCase().includes(searchQuery.toLowerCase()) && !item.target.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
              ADMIN CONSOLE
            </span>
            <span className="text-xs text-slate-400">Platform Management & Telemetry</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            Admin Infrastructure & User Activity
          </h2>
        </div>

        {/* Sub-Tabs Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs font-medium">
          <button
            onClick={() => setActiveTab('scalability')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'scalability'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 font-semibold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Scalability
          </button>
          <button
            onClick={() => setActiveTab('cost')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'cost'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 font-semibold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Cost Economics
          </button>
          <button
            onClick={() => setActiveTab('interactions')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'interactions'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 font-semibold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            User Interactions
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'health'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 font-semibold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            System Health
          </button>
        </div>
      </div>

      {/* TAB 1: SCALABILITY ARCHITECTURE */}
      {activeTab === 'scalability' && (
        <div className="space-y-6">
          {/* Top 3 Scalability KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Throughput Capacity</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">5,000 scans/min</span>
              <span className="text-[11px] text-teal-600 dark:text-teal-400 mt-1 block font-mono">Distributed Celery Cluster</span>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Average Scan Latency</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">142 ms</span>
              <span className="text-[11px] text-slate-400 mt-1 block font-mono">AST parse + CFG traverse</span>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Active Worker Pool</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">4 / 8 Nodes</span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block font-mono">Autoscaling Active</span>
            </div>
          </div>

          {/* Scalability Pipeline Diagram */}
          <div className="p-5 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Distributed Architecture Pipeline
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  How scan requests scale from incoming webhooks to distributed AST worker nodes.
                </p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                Tier-7 Engine
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
              <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-mono text-[10px] text-slate-400 block">Tier 1</span>
                <span className="font-bold text-slate-900 dark:text-white mt-1 block">GitHub Webhook</span>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">100% async</span>
              </div>
              <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-mono text-[10px] text-slate-400 block">Tier 2</span>
                <span className="font-bold text-slate-900 dark:text-white mt-1 block">Node API Gateway</span>
                <span className="text-[10px] text-slate-400 font-mono">Express / JWT</span>
              </div>
              <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-mono text-[10px] text-slate-400 block">Tier 3</span>
                <span className="font-bold text-slate-900 dark:text-white mt-1 block">Redis Job Queue</span>
                <span className="text-[10px] text-slate-400 font-mono">0 lag queue</span>
              </div>
              <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-mono text-[10px] text-slate-400 block">Tier 4</span>
                <span className="font-bold text-slate-900 dark:text-white mt-1 block">Python Workers</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">4 instances</span>
              </div>
              <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-mono text-[10px] text-slate-400 block">Tier 5</span>
                <span className="font-bold text-slate-900 dark:text-white mt-1 block">LeakGuard CLI</span>
                <span className="text-[10px] text-slate-400 font-mono">AST/CFG Core</span>
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

          {/* Worker Node Telemetry Table */}
          <div className="p-5 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Worker Node Cluster Telemetry
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                    <th className="pb-2">Worker Node</th>
                    <th className="pb-2">Region</th>
                    <th className="pb-2">CPU Utilization</th>
                    <th className="pb-2">Memory (RSS)</th>
                    <th className="pb-2">Scans Processed</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-slate-600 dark:text-slate-300">
                  <tr>
                    <td className="py-2.5 text-slate-900 dark:text-white font-bold">worker-us-east-01</td>
                    <td className="py-2.5">us-east-1</td>
                    <td className="py-2.5">24%</td>
                    <td className="py-2.5">142 MB</td>
                    <td className="py-2.5">1,248</td>
                    <td className="py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-semibold">● ACTIVE</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-slate-900 dark:text-white font-bold">worker-us-east-02</td>
                    <td className="py-2.5">us-east-1</td>
                    <td className="py-2.5">38%</td>
                    <td className="py-2.5">188 MB</td>
                    <td className="py-2.5">2,190</td>
                    <td className="py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-semibold">● ACTIVE</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-slate-900 dark:text-white font-bold">worker-eu-west-01</td>
                    <td className="py-2.5">eu-west-1</td>
                    <td className="py-2.5">12%</td>
                    <td className="py-2.5">110 MB</td>
                    <td className="py-2.5">842</td>
                    <td className="py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-semibold">● ACTIVE</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-slate-900 dark:text-white font-bold">worker-ap-south-01</td>
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
      )}

      {/* TAB 2: COST & RESOURCE ECONOMICS */}
      {activeTab === 'cost' && (
        <div className="space-y-6">
          {/* Top 3 Cost Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Monthly Infrastructure Cost</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">$142.50 / mo</span>
              <span className="text-[11px] text-teal-600 dark:text-teal-400 mt-1 block">Budget: $500.00 (28.5% used)</span>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Cost per 1,000 Scans</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">$0.042</span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">78% savings vs dynamic VM execution</span>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Pruning Efficiency</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">84%</span>
              <span className="text-[11px] text-slate-400 mt-1 block">Clean functions bypassed before CFG traversal</span>
            </div>
          </div>

          {/* Infrastructure Breakdown Grid */}
          <div className="p-5 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Infrastructure Cost Breakdown (Monthly)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
                <span className="text-slate-400 font-medium block">API Gateway Nodes</span>
                <span className="text-base font-bold text-slate-900 dark:text-white mt-1 block">$40.00</span>
                <span className="text-[11px] text-slate-400">2x t4g.small instances</span>
              </div>
              <div className="p-3 rounded border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
                <span className="text-slate-400 font-medium block">Python Worker Pool</span>
                <span className="text-base font-bold text-slate-900 dark:text-white mt-1 block">$65.00</span>
                <span className="text-[11px] text-slate-400">Autoscaling Celery / ECS</span>
              </div>
              <div className="p-3 rounded border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
                <span className="text-slate-400 font-medium block">Database & Auth</span>
                <span className="text-base font-bold text-slate-900 dark:text-white mt-1 block">$25.00</span>
                <span className="text-[11px] text-slate-400">Supabase Pro plan</span>
              </div>
              <div className="p-3 rounded border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
                <span className="text-slate-400 font-medium block">Report Storage & SARIF</span>
                <span className="text-base font-bold text-slate-900 dark:text-white mt-1 block">$12.50</span>
                <span className="text-[11px] text-slate-400">S3 / R2 Object Storage</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USER INTERACTIONS & LIVE AUDIT TRAIL */}
      {activeTab === 'interactions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user actions by developer or target..."
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
                {filteredInteractions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
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
        </div>
      )}

      {/* TAB 4: SYSTEM HEALTH */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Node.js API Server</span>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">● ONLINE (Port 3001)</span>
            </div>
            <p className="text-xs text-slate-500">Handles dashboard telemetry, scan dispatcher, and RBAC authorization.</p>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">LeakGuard Python Engine</span>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">● READY (v0.1.0)</span>
            </div>
            <p className="text-xs text-slate-500">AST parsing and control flow graph path discovery verified.</p>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Supabase / Postgres RLS</span>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">● SECURE</span>
            </div>
            <p className="text-xs text-slate-500">Row-level security policies active for multi-tenant repositories.</p>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">GitHub Integration Hook</span>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">● CONNECTED</span>
            </div>
            <p className="text-xs text-slate-500">Receives webhook push payloads and triggers automated static checks.</p>
          </div>
        </div>
      )}
    </div>
  );
};
