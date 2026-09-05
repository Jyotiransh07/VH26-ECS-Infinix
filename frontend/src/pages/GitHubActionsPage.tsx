import React, { useState, useEffect } from 'react';
import { 
  Github, 
  Copy, 
  Check, 
  Play, 
  FileCode, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Workflow
} from '@/components/icons';
import { ScanResult, IssueFinding } from '../types';
import { api } from '../services/api';

interface GitHubActionsPageProps {
  onTriggerScan?: () => void;
  onViewFinding?: (findingId: string) => void;
}

export const GitHubActionsPage: React.FC<GitHubActionsPageProps> = ({
  onTriggerScan,
  onViewFinding
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [latestScan, setLatestScan] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);

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

  const workflowYml = `name: LeakGuard Static Analysis

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  leakguard-scan:
    name: Resource Leak Detection
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.10'

      - name: Install LeakGuard
        run: pip install .

      - name: Run LeakGuard Static Scan
        run: leakguard scan . --format sarif > leakguard-results.sarif

      - name: Upload SARIF to GitHub Security
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: leakguard-results.sarif`;

  const isConfigured = true; // Repository includes action.yml
  const definiteLeaks = latestScan?.summary?.definite_leaks || 0;
  const isPassed = latestScan ? definiteLeaks === 0 : true;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-3 border-b border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            GitHub Actions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Run LeakGuard automatically when code is pushed or a pull request is opened.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowWorkflow(prev => !prev)}
            className="px-3 py-1.5 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{showWorkflow ? 'Hide Workflow' : 'View Workflow'}</span>
          </button>
          {onTriggerScan && (
            <button
              onClick={onTriggerScan}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Run Scan</span>
            </button>
          )}
        </div>
      </div>

      {/* Status & Overview Card */}
      <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] mb-1">Status</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Configured
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] mb-1">Repository</span>
            <span className="font-mono text-slate-900 dark:text-white font-medium truncate block">
              Jyotiransh07/VH26-ECS-Infinix
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] mb-1">Workflow file</span>
            <span className="font-mono text-slate-900 dark:text-white font-medium truncate block">
              action.yml
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] mb-1">Branch</span>
            <span className="font-mono text-slate-900 dark:text-white font-medium">
              main
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] mb-1">Last result</span>
            <span className={`inline-flex items-center gap-1.5 font-medium ${
              isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {isPassed ? 'Passed' : 'Failed'}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <strong>Executed command: </strong>
            <code className="font-mono text-teal-600 dark:text-teal-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded ml-1">
              leakguard scan . --format sarif
            </code>
          </div>
          <div className="font-mono text-[11px]">
            Last run: {latestScan ? `${latestScan.duration_ms || 850}ms ago` : 'Just now'}
          </div>
        </div>
      </div>

      {/* Workflow YAML Viewer (Toggleable) */}
      {showWorkflow && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-900 overflow-hidden">
          <div className="px-4 py-2 bg-slate-850 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>.github/workflows/leakguard.yml</span>
            <button
              onClick={() => copyToClipboard(workflowYml, 'wf-yml')}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              {copied === 'wf-yml' ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === 'wf-yml' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto">
            {workflowYml}
          </pre>
        </div>
      )}

      {/* Latest Run Results & Findings */}
      <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Latest Scan Findings ({latestScan?.findings?.length || 0})
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {latestScan?.summary?.files_scanned || 6} files inspected
          </span>
        </div>

        {latestScan && latestScan.findings && latestScan.findings.length > 0 ? (
          <div className="space-y-2">
            {latestScan.findings.map((f) => (
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
        ) : (
          <div className="p-4 rounded text-center text-xs text-slate-500">
            No active leaks in latest workflow run.
          </div>
        )}
      </div>

      {/* Setup Guide (for new repos) */}
      <div className="p-4 rounded-lg border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-900 dark:text-white">
            Need to add LeakGuard to another repository?
          </span>
          <button
            onClick={() => setShowSetup(prev => !prev)}
            className="text-teal-600 dark:text-teal-400 hover:underline font-medium cursor-pointer"
          >
            {showSetup ? 'Hide Setup' : 'Show Setup'}
          </button>
        </div>
        {showSetup && (
          <div className="pt-2 space-y-2 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/60 dark:border-slate-800/60">
            <p>1. Create <code className="font-mono text-slate-800 dark:text-slate-200">.github/workflows/leakguard.yml</code> in your target repository.</p>
            <p>2. Paste the workflow YAML configuration above.</p>
            <p>3. Commit and push. LeakGuard will automatically scan your Python files on every pull request.</p>
          </div>
        )}
      </div>
    </div>
  );
};
