import React from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, User } from '@/components/icons';

interface UserInteractionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  interaction: any | null;
}

export const UserInteractionDrawer: React.FC<UserInteractionDrawerProps> = ({
  isOpen,
  onClose,
  interaction
}) => {
  if (!isOpen || !interaction) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#0d1117] border-l border-slate-200 dark:border-slate-800 h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 uppercase">
              Interaction Details
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {interaction.label || interaction.action}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* User Info */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <span className="text-slate-400 font-medium block text-[10px] uppercase">Initiated By</span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center text-xs">
                {interaction.user.charAt(0)}
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">{interaction.user}</span>
                <span className="text-[11px] text-slate-400">{interaction.role} · {interaction.email}</span>
              </div>
            </div>
          </div>

          {/* Action Details */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 text-[10px] block">Action Type</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{interaction.action}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 text-[10px] block">Timestamp</span>
                <span className="font-mono text-slate-900 dark:text-white">{interaction.timestamp}</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 text-[10px] block">Target Resource</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">{interaction.target}</span>
            </div>

            <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 text-[10px] block">Activity Description</span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">{interaction.detail}</p>
            </div>
          </div>

          {/* Metadata JSON */}
          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-mono block">Audit Payload (JSON)</span>
            <div className="p-3 rounded bg-slate-900 text-slate-200 font-mono text-[10px] overflow-x-auto leading-relaxed">
              {JSON.stringify({
                id: interaction.id,
                action: interaction.action,
                user_email: interaction.email,
                target: interaction.target,
                status: interaction.status,
                recorded_at: new Date().toISOString()
              }, null, 2)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
