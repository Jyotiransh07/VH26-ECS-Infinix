import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  FileCode, 
  AlertTriangle,
  CheckCircle2,
  ArrowRight
} from '@/components/icons';
import { ScanResult, IssueFinding } from '../types';
import { api } from '../services/api';

interface CliPageProps {
  onTriggerScan?: () => void;
  onViewFinding?: (findingId: string) => void;
}

export const CliPage: React.FC<CliPageProps> = ({
  onTriggerScan,
  onViewFinding
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [latestScan, setLatestScan] = useState<ScanResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    api.getScans().then(scans => {
      if (scans && scans.length > 0) {
        setLatestScan(scans[0]);
      }
    }).catch(() => {});
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRunScan = async () => {
    if (onTriggerScan) {
      onTriggerScan();
    } else {
      setIsRunning(true);
      try {
        const result = await api.triggerScan('sample-repo-python');
        setLatestScan(result);
      } finally {
        setIsRunning(false);
      }
    }
  };

  const commands = [
    {
      id: 'cmd-basic',
      title: 'Basic scan',
      command: 'leakguard scan .',
      desc: 'Scans all Python files in the current working directory.'
    },
    {
      id: 'cmd-dir',
      title: 'Scan a specific directory',
      command: 'leakguard scan ./src',
      desc: 'Scans Python source files inside the specified target path.'
    },
    {
      id: 'cmd-json',
      title: 'JSON report',
      command: 'leakguard scan . --format json',
      desc: 'Outputs machine-readable structured JSON findings.'
    },
    {
      id: 'cmd-sarif',
      title: 'SARIF report',
      command: 'leakguard scan . --format sarif',
      desc: 'Outputs OASIS standard SARIF for GitHub Code Scanning.'
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-3 border-b border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            CLI
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Run LeakGuard directly from your terminal.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRunScan}
            disabled={isRunning}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isRunning ? 'Scanning...' : 'Run Scan'}</span>
          </button>
        </div>
      </div>

      {/* Installation Reference */}
      <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-900 dark:text-white">
            Installation
          </span>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            ● Installed (v0.1.0)
          </span>
        </div>
        <div className="p-3 rounded bg-slate-900 text-slate-200 font-mono text-xs flex items-center justify-between overflow-x-auto">
          <code>$ pip install .</code>
          <button
            onClick={() => copyToClipboard('pip install .', 'inst')}
            className="text-slate-400 hover:text-white transition-colors ml-4"
          >
            {copied === 'inst' ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Clean Command Reference List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Command Reference
        </h3>

        <div className="space-y-3">
          {commands.map((c) => (
            <div 
              key={c.id}
              className="p-3.5 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {c.title}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {c.desc}
                </span>
              </div>

              <div className="p-2.5 rounded bg-slate-900 text-teal-300 font-mono text-xs flex items-center justify-between overflow-x-auto">
                <code>$ {c.command}</code>
                <button
                  onClick={() => copyToClipboard(c.command, c.id)}
                  className="text-slate-400 hover:text-white transition-colors ml-4 shrink-0"
                >
                  {copied === c.id ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Latest CLI Scan Result */}
      {latestScan && (
        <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Latest CLI Scan
            </h3>
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
              (latestScan.summary?.definite_leaks || 0) === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${(latestScan.summary?.definite_leaks || 0) === 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {(latestScan.summary?.definite_leaks || 0) === 0 ? 'Passed (0 leaks)' : `Failed (${latestScan.summary?.definite_leaks} leaks)`}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded">
              <span className="text-slate-400 block text-[10px]">Files Inspected</span>
              <span className="font-bold text-slate-900 dark:text-white">{latestScan.summary?.files_scanned || 6} files</span>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded">
              <span className="text-slate-400 block text-[10px]">Definite Leaks</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">{latestScan.summary?.definite_leaks || 0}</span>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded">
              <span className="text-slate-400 block text-[10px]">Duration</span>
              <span className="font-bold text-slate-900 dark:text-white">{latestScan.duration_ms || 920} ms</span>
            </div>
          </div>

          {latestScan.findings && latestScan.findings.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Findings:</span>
              {latestScan.findings.map(f => (
                <div
                  key={f.id}
                  onClick={() => onViewFinding && onViewFinding(f.id)}
                  className="p-2 rounded bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <span className="font-mono text-rose-600 dark:text-rose-400">{f.file}:{f.line} ({f.resource_type})</span>
                  <span className="text-teal-600 dark:text-teal-400 font-medium">Inspect →</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
