import React from 'react';
import { Settings, ShieldCheck, Check } from '@/components/icons';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export const AdminSettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <AdminPageHeader
        title="Admin Settings"
        description="Manage platform security policies, scanner thresholds, and integrations."
      />

      <div className="space-y-4">
        {/* Authentication & RBAC */}
        <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Authentication & RBAC</h3>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
          </div>
          <p className="text-xs text-slate-500">
            Enforce role-based access control. Non-admin users are restricted from viewing platform administration routes.
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 block text-[10px]">Session Expiration</span>
              <span className="text-slate-900 dark:text-white font-bold">24 Hours (JWT)</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 block text-[10px]">Admin Role Verification</span>
              <span className="text-purple-600 dark:text-purple-400 font-bold">Server-Side RLS</span>
            </div>
          </div>
        </div>

        {/* Scanner Engine Configuration */}
        <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Scanner Engine Configuration</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 block text-[10px]">Scan Timeout</span>
              <span className="text-slate-900 dark:text-white font-bold">120 Seconds</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 block text-[10px]">Max File Size</span>
              <span className="text-slate-900 dark:text-white font-bold">10 MB</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 block text-[10px]">Engine Mode</span>
              <span className="text-teal-600 dark:text-teal-400 font-bold">AST / CFG Pure</span>
            </div>
          </div>
        </div>

        {/* Security / Zero Exposed Secrets Guarantee */}
        <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero Exposed Secrets Policy</span>
          </div>
          <p className="text-xs text-slate-500">
            Service role keys, GitHub client secrets, and database credentials remain strictly on the backend and are never sent to the client.
          </p>
        </div>
      </div>
    </div>
  );
};
