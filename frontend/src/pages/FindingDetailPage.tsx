import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, FileCode, CheckCircle2, Play, ExternalLink } from '@/components/icons';
import { IssueFinding } from '../types';

interface FindingDetailPageProps {
  finding: IssueFinding;
  onBack: () => void;
  onReScan?: () => void;
}

export const FindingDetailPage: React.FC<FindingDetailPageProps> = ({
  finding,
  onBack,
  onReScan
}) => {
  const [status, setStatus] = useState<string>(finding.status || 'OPEN');
  const [resolvedToast, setResolvedToast] = useState(false);

  const handleMarkResolved = () => {
    setStatus('RESOLVED');
    setResolvedToast(true);
    setTimeout(() => setResolvedToast(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button & Title */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 mb-3 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to findings</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                {finding.severity || 'HIGH'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {finding.file}:{finding.line}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
              Resource leak detected
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkResolved}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {status === 'RESOLVED' ? 'Resolved ✓' : 'Mark resolved'}
            </button>
            {onReScan && (
              <button
                onClick={onReScan}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-teal-600 hover:bg-teal-500 text-white transition-colors cursor-pointer"
              >
                Run scan again
              </button>
            )}
          </div>
        </div>
      </div>

      {resolvedToast && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs rounded-md">
          Finding marked as resolved. Run a scan to verify the fix with the AST engine.
        </div>
      )}

      {/* Why this was flagged */}
      <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Why this was flagged
        </h3>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          LeakGuard found a resource that can be opened without being closed on every execution path.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Resource</span>
            <span className="font-mono text-slate-900 dark:text-white font-medium">File handle</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Variable</span>
            <span className="font-mono text-slate-900 dark:text-white font-medium">{finding.variable_name || 'f'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Opened at</span>
            <span className="font-mono text-slate-900 dark:text-white font-medium">{finding.file}:{finding.line}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Cleanup</span>
            <span className="text-rose-600 dark:text-rose-400 font-medium">Not guaranteed</span>
          </div>
        </div>
      </div>

      {/* Relevant Code Viewer */}
      <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800/60 font-mono">
          <span>{finding.file}</span>
          <span>Python</span>
        </div>

        <div className="font-mono text-xs overflow-x-auto py-2 leading-relaxed">
          <div className="text-slate-400">1  def parse_data(file_path, is_valid):</div>
          <div className="bg-amber-500/10 text-amber-900 dark:text-amber-200 px-2 rounded">
            2      f = open(file_path, "r")  # Resource opened
          </div>
          <div className="text-slate-400">3      header = f.readline()</div>
          <div className="bg-rose-500/10 text-rose-900 dark:text-rose-200 px-2 rounded font-medium">
            4      if not is_valid:</div>
          <div className="bg-rose-500/10 text-rose-900 dark:text-rose-200 px-2 rounded font-medium">
            5          return None  # Early return exits without closing f
          </div>
          <div className="text-slate-400">6      content = f.read()</div>
          <div className="text-slate-400">7      f.close()</div>
          <div className="text-slate-400">8      return content</div>
        </div>
      </div>

      {/* Execution Path */}
      <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Execution path
        </h3>
        
        <div className="flex items-center gap-2 text-xs flex-wrap font-mono">
          <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
            Open resource (line 2)
          </span>
          <span className="text-slate-400">→</span>
          <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
            Condition (line 4)
          </span>
          <span className="text-slate-400">→</span>
          <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
            Early return (line 5)
          </span>
          <span className="text-slate-400">→</span>
          <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
            Function exits
          </span>
          <span className="text-slate-400">→</span>
          <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold">
            Cleanup skipped
          </span>
        </div>
      </div>

      {/* Suggested Fix */}
      <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Suggested fix
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Use a context manager so the resource is closed automatically even on early return or exception.
        </p>

        <div className="font-mono text-xs bg-slate-900 text-slate-100 p-3 rounded-md overflow-x-auto leading-relaxed">
          <div>def parse_data(file_path, is_valid):</div>
          <div className="text-teal-400 font-semibold">    with open(file_path, "r") as f:</div>
          <div>        header = f.readline()</div>
          <div>        if not is_valid:</div>
          <div>            return None</div>
          <div>        return f.read()</div>
        </div>
      </div>
    </div>
  );
};
