import React from 'react';
import { Activity, Download } from '@/components/icons';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export const AdminCostEconomicsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Cost Economics"
        description="Compute resource utilization and estimated cloud infrastructure cost."
      />

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Estimated Monthly Cost</span>
            <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1 rounded">
              ESTIMATED
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">$142.50</div>
          <span className="text-[11px] text-teal-600 dark:text-teal-400">Budget: $500.00 (28.5% used)</span>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Cost per 1,000 Scans</span>
            <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1 rounded">
              ESTIMATED
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">$0.042</div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">78% savings vs dynamic VM execution</span>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">AST Pruning Efficiency</span>
            <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-1 rounded">
              LIVE
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">84%</div>
          <span className="text-[11px] text-slate-400">Clean functions bypassed before CFG</span>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Scan Jobs</span>
            <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-1 rounded">
              LIVE
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">142</div>
          <span className="text-[11px] text-slate-400">Across 5 repositories</span>
        </div>
      </div>

      {/* Itemized Infrastructure Cost Table */}
      <div className="p-5 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Itemized Monthly Cloud Infrastructure
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
            <span className="text-slate-400 font-medium block">API Gateway Nodes</span>
            <span className="text-base font-bold text-slate-900 dark:text-white mt-1 block">$40.00 / mo</span>
            <span className="text-[11px] text-slate-400">2x t4g.small instances</span>
          </div>
          <div className="p-3.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
            <span className="text-slate-400 font-medium block">Python Worker Pool</span>
            <span className="text-base font-bold text-slate-900 dark:text-white mt-1 block">$65.00 / mo</span>
            <span className="text-[11px] text-slate-400">Autoscaling Celery ECS</span>
          </div>
          <div className="p-3.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
            <span className="text-slate-400 font-medium block">Database & Auth</span>
            <span className="text-base font-bold text-slate-900 dark:text-white mt-1 block">$25.00 / mo</span>
            <span className="text-[11px] text-slate-400">Supabase Pro tier</span>
          </div>
          <div className="p-3.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
            <span className="text-slate-400 font-medium block">SARIF Report Storage</span>
            <span className="text-base font-bold text-slate-900 dark:text-white mt-1 block">$12.50 / mo</span>
            <span className="text-[11px] text-slate-400">S3 / Cloudflare R2</span>
          </div>
        </div>
      </div>
    </div>
  );
};
