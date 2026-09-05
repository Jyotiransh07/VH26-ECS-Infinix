import React, { useState } from 'react';
import { Cpu, ShieldCheck, Play, Activity, Layers, CheckCircle2 } from '@/components/icons';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export const AdminScalabilityPage: React.FC = () => {
  const [hoveredComponent, setHoveredComponent] = useState<{
    name: string;
    purpose: string;
    status: string;
    tech: string;
  } | null>(null);

  const components = [
    { id: 'gh', name: 'GitHub Webhook', purpose: 'Receives PR / commit events and enqueues scans', status: 'ACTIVE', tech: 'GitHub Apps / REST' },
    { id: 'api', name: 'Node.js API', purpose: 'Authentication, scan validation and job dispatching', status: 'ACTIVE', tech: 'Express / Port 3001' },
    { id: 'queue', name: 'Redis Queue', purpose: 'Guarantees FIFO job dispatch and load buffering', status: 'STANDBY', tech: 'Redis / BullMQ' },
    { id: 'worker', name: 'Python Worker Pool', purpose: 'Executes existing LeakGuard static scans', status: 'ACTIVE', tech: 'Python + LeakGuard CLI' },
    { id: 'db', name: 'Supabase DB', purpose: 'Stores finding records with row-level security', status: 'ACTIVE', tech: 'PostgreSQL + RLS' },
    { id: 'realtime', name: 'Supabase Realtime', purpose: 'Broadcasts instant findings to team members', status: 'ACTIVE', tech: 'WebSockets' },
    { id: 'dashboard', name: 'Live Dashboard', purpose: 'Renders Monaco code viewer and CFG paths', status: 'ACTIVE', tech: 'React / Vite' }
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Scalability Architecture"
        description="Horizontal worker scaling, job queue depth, and distributed scan throughput."
      />

      {/* Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 block">Current Workers</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">4</span>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">Autoscale enabled</span>
        </div>
        <div className="p-3.5 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 block">Queue Depth</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">0</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">No backlog</span>
        </div>
        <div className="p-3.5 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 block">Active Jobs</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">1</span>
          <span className="text-[10px] text-slate-400 font-mono">sample-repo</span>
        </div>
        <div className="p-3.5 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 block">Completed Jobs</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">142</span>
          <span className="text-[10px] text-slate-400 font-mono">100% success</span>
        </div>
        <div className="p-3.5 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 block">Failed Jobs</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">0</span>
          <span className="text-[10px] text-slate-400 font-mono">Zero drops</span>
        </div>
      </div>

      {/* Interactive Scalability Diagram */}
      <div className="p-5 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Horizontal Worker Scaling Model
            </h3>
            <p className="text-xs text-slate-400">
              Hover over any pipeline component to inspect its implementation technology and purpose.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold border border-purple-500/20">
            SIMULATION MODEL
          </span>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {components.map((comp) => (
            <div
              key={comp.id}
              onMouseEnter={() => setHoveredComponent(comp)}
              className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:border-purple-500 transition-all cursor-pointer text-center"
            >
              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 block font-semibold">
                ● {comp.status}
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                {comp.name}
              </h4>
              <span className="text-[10px] font-mono text-slate-400 block mt-1 truncate">
                {comp.tech}
              </span>
            </div>
          ))}
        </div>

        {/* Detail Inspection Card on Hover */}
        {hoveredComponent && (
          <div className="p-3.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-700 dark:text-purple-300">{hoveredComponent.name}</span>
              <span className="font-mono text-[10px] text-purple-600 dark:text-purple-400">{hoveredComponent.tech}</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-[11px]">{hoveredComponent.purpose}</p>
          </div>
        )}
      </div>

      {/* Explanation Section */}
      <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Why Static Analysis Scales Horizontally
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Because LeakGuard performs purely static AST construction and CFG traversal without running untrusted code in containers, each repository scan is completely stateless and independent. Scan jobs can be dispatched concurrently across N worker instances with zero side effects.
        </p>
      </div>
    </div>
  );
};
