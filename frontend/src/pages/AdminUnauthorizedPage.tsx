import React from 'react';
import { ShieldAlert, ArrowLeft } from '@/components/icons';

interface AdminUnauthorizedPageProps {
  onBackToApp: () => void;
  onElevateAdmin: () => void;
}

export const AdminUnauthorizedPage: React.FC<AdminUnauthorizedPageProps> = ({
  onBackToApp,
  onElevateAdmin
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md p-8 rounded-3xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#0f172a] shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 mb-2">
            HTTP 403 FORBIDDEN
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Admin Access Required
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            You are logged in as a standard <strong className="text-slate-800 dark:text-slate-200">USER</strong>. 
            The requested administration endpoints (/admin/*) are protected by Node.js authorization and Supabase RLS.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onBackToApp}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to User App</span>
          </button>
          <button
            onClick={onElevateAdmin}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 transition-all shadow-sm"
          >
            <span>Switch to ADMIN Role</span>
          </button>
        </div>
      </div>
    </div>
  );
};
