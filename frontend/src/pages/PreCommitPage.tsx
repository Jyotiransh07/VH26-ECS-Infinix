import React, { useState, useEffect } from 'react';
import { 
  GitCommit, 
  Copy, 
  Check, 
  Play, 
  FileCode, 
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Terminal
} from '@/components/icons';
import { ScanResult, IssueFinding } from '../types';
import { api } from '../services/api';

interface PreCommitPageProps {
  onTriggerScan?: () => void;
  onViewFinding?: (findingId: string) => void;
}

export const PreCommitPage: React.FC<PreCommitPageProps> = ({
  onTriggerScan,
  onViewFinding
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [latestCheck, setLatestCheck] = useState<ScanResult | null>(null);
  const [isRunningCheck, setIsRunningCheck] = useState(false);

  useEffect(() => {
    api.getScans().then(scans => {
      if (scans && scans.length > 0) {
        setLatestCheck(scans[0]);
      }
    }).catch(() => {});
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const precommitConfig = `repos:
  - repo: https://github.com/Jyotiransh07/VH26-ECS-Infinix
    rev: v0.1.0
    hooks:
      - id: leakguard
        name: LeakGuard Resource Leak Detector
        entry: leakguard scan
        language: python
        types: [python]`;

  const handleRunCheck = async () => {
    if (onTriggerScan) {
      onTriggerScan();
    } else {
      setIsRunningCheck(true);
      try {
        const result = await api.triggerScan('sample-repo-python');
        setLatestCheck(result);
      } finally {
        setIsRunningCheck(false);
      }
    }
  };

  // Pre-commit is not configured by default in the workspace until user adds .pre-commit-config.yaml
  const isConfigured = false;
  const definiteLeaks = latestCheck?.summary?.definite_leaks || 0;
  const isPassed = latestCheck ? definiteLeaks === 0 : false;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-3 border-b border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Pre-commit
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Check your Python files before they are committed.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowSetup(prev => !prev)}
            className="px-3 py-1.5 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{showSetup ? 'Hide Setup' : 'Show Setup'}</span>
          </button>
          <button
            onClick={handleRunCheck}
            disabled={isRunningCheck}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isRunningCheck ? 'Checking...' : 'Run Check'}</span>
          </button>
        </div>
      </div>

      {/* Status & Overview Card */}
      <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] mb-1">Status</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Not configured
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] mb-1">Configuration file</span>
            <span className="font-mono text-slate-900 dark:text-white font-medium truncate block">
              .pre-commit-config.yaml
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] mb-1">Files checked</span>
            <span className="font-mono text-slate-900 dark:text-white font-medium">
              {latestCheck?.summary?.files_scanned || 6} Python files
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] mb-1">Last check</span>
            <span className="font-mono text-slate-900 dark:text-white font-medium">
              {latestCheck ? 'Just now' : 'Not run yet'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] mb-1">Last result</span>
            <span className={`inline-flex items-center gap-1.5 font-medium ${
              !latestCheck 
                ? 'text-slate-400' 
                : isPassed 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-rose-600 dark:text-rose-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${!latestCheck ? 'bg-slate-400' : isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {!latestCheck ? 'Not run yet' : isPassed ? 'Passed' : 'Failed'}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <strong>Hook command: </strong>
            <code className="font-mono text-teal-600 dark:text-teal-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded ml-1">
              leakguard scan .
            </code>
          </div>
          <div className="text-[11px]">
            Checks staged Python files before git commit.
          </div>
        </div>
      </div>

      {/* Setup Section (if not configured or toggled) */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-900 overflow-hidden">
        <div className="px-4 py-2 bg-slate-850 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>.pre-commit-config.yaml Configuration</span>
          <button
            onClick={() => copyToClipboard(precommitConfig, 'pc-cfg')}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            {copied === 'pc-cfg' ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied === 'pc-cfg' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre className="p-4 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto">
          {precommitConfig}
        </pre>
      </div>

      {/* Quick Install Instructions */}
      <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-3 text-xs">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          How to enable Pre-commit for this repository:
        </h3>
        <div className="space-y-2 text-slate-600 dark:text-slate-400 font-mono">
          <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>$ pip install pre-commit</span>
            <button onClick={() => copyToClipboard('pip install pre-commit', 'pc-1')} className="hover:text-teal-500">
              {copied === 'pc-1' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>$ pre-commit install</span>
            <button onClick={() => copyToClipboard('pre-commit install', 'pc-2')} className="hover:text-teal-500">
              {copied === 'pc-2' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Latest Check Findings */}
      {latestCheck && latestCheck.findings && latestCheck.findings.length > 0 && (
        <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Findings from Latest Check ({latestCheck.findings.length})
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Unclosed descriptors blocking commit
            </span>
          </div>

          <div className="space-y-2">
            {latestCheck.findings.map((f) => (
              <div 
                key={f.id}
                onClick={() => onViewFinding && onViewFinding(f.id)}
                className="p-2.5 rounded border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {f.file}:{f.line}
                    </span>
                    <span className="text-slate-400">({f.resource_type})</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] line-clamp-1">
                    {f.reason}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-medium">
                  <span>Inspect</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
