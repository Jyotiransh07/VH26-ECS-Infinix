import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, ShieldAlert, ArrowRight, CheckCircle2 } from '@/components/icons';
import { supabase } from '../../services/supabase';

export interface AlertNotification {
  id: string;
  repository: string;
  file: string;
  line: number;
  severity: string;
  resource_type: string;
  timestamp: string;
}

interface RealtimeAlertBannerProps {
  onInvestigate?: (file: string) => void;
}

export const RealtimeAlertBanner: React.FC<RealtimeAlertBannerProps> = ({ onInvestigate }) => {
  const [notification, setNotification] = useState<AlertNotification | null>(null);

  useEffect(() => {
    // Listen to Supabase Realtime channel events
    const unsubscribe = supabase.subscribeToFindings('repo-sample-python', (payload) => {
      setNotification({
        id: `alert-${Date.now()}`,
        repository: payload.repository || 'sample-repo-python',
        file: payload.file || 'early_return.py',
        line: payload.line || 2,
        severity: payload.severity || 'HIGH',
        resource_type: payload.resource_type || 'file',
        timestamp: new Date().toLocaleTimeString()
      });
    });

    return () => unsubscribe();
  }, []);

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full p-4 rounded-2xl bg-slate-900 border border-rose-500/40 text-white shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300">
                REALTIME ALERT
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{notification.timestamp}</span>
            </div>
            <h4 className="text-xs font-bold text-white mt-1">
              NEW RESOURCE LEAK DETECTED
            </h4>
            <p className="text-[11px] text-slate-300 font-mono mt-0.5">
              {notification.repository} &gt; {notification.file}:{notification.line}
            </p>
            <p className="text-[10px] text-rose-300 mt-1">
              [{notification.severity}] Unclosed {notification.resource_type} descriptor requires remediation.
            </p>
          </div>
        </div>

        <button
          onClick={() => setNotification(null)}
          className="p-1 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
        <button
          onClick={() => setNotification(null)}
          className="px-2.5 py-1 rounded-lg text-[11px] text-slate-400 hover:text-white"
        >
          Dismiss
        </button>
        <button
          onClick={() => {
            if (onInvestigate) onInvestigate(notification.file);
            setNotification(null);
          }}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold bg-teal-500 text-slate-900 hover:bg-teal-400 transition-colors shadow-xs"
        >
          <span>Investigate Finding</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
