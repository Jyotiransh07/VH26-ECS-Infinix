import React, { useState } from 'react';
import { 
  Github, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight, 
  GitPullRequest, 
  FileCode, 
  Copy, 
  Check,
  GitCommit,
  Workflow
} from '@/components/icons';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const GitHubActionsPage: React.FC = () => {
  const [copiedAction, setCopiedAction] = useState(false);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);

  const actionYml = `name: 'LeakGuard Static Analyzer'
description: 'Finds resource leaks in your Python code before they hit production.'
branding:
  icon: 'shield'
  color: 'blue'

inputs:
  target_dir:
    description: 'Directory to scan for leaks'
    required: true
    default: '.'
  fail_on_leak:
    description: 'Whether to fail the build if a leak is found'
    required: false
    default: 'true'

runs:
  using: 'composite'
  steps:
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'

    - name: Install LeakGuard
      shell: bash
      run: |
        pip install .
        
    - name: Run LeakGuard Analysis
      shell: bash
      run: |
        echo "Running LeakGuard on \${{ inputs.target_dir }}..."
        if [ "\${{ inputs.fail_on_leak }}" = "true" ]; then
          leakguard scan \${{ inputs.target_dir }}
        else
          leakguard scan \${{ inputs.target_dir }} || true
        fi`;

  const workflowYml = `name: LeakGuard CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  leak-detection:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run LeakGuard
        uses: ./
        with:
          target_dir: '.'
          fail_on_leak: 'true'`;

  const handleCopyAction = () => {
    navigator.clipboard.writeText(actionYml);
    setCopiedAction(true);
    setTimeout(() => setCopiedAction(false), 2000);
  };

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(workflowYml);
    setCopiedWorkflow(true);
    setTimeout(() => setCopiedWorkflow(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/5 text-white border border-white/10">
            <Github className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">GitHub Actions CI/CD Integration</h2>
            <p className="text-sm text-zinc-400">Automated pull request gating and PR blocker for Python resource leaks</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="status" value="BLOCKED" />
          <span className="text-xs font-mono text-zinc-400">Enforcement Active</span>
        </div>
      </div>

      {/* CI/CD Visual Pipeline Flowchart */}
      <div className="card-elevated p-6 space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">Continuous Integration Gating Workflow</h3>
        
        <div className="p-6 rounded-2xl bg-[#090b10] border border-white/5 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[650px] gap-2">
            <div className="p-4 rounded-xl bg-card-elevated border border-white/10 text-center flex-1">
              <GitPullRequest className="w-5 h-5 text-primary-light mx-auto mb-1" />
              <p className="text-xs font-bold text-white">Push / Pull Request</p>
              <p className="text-[10px] text-zinc-500">Developer commits code</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 shrink-0" />

            <div className="p-4 rounded-xl bg-card-elevated border border-white/10 text-center flex-1">
              <Workflow className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-xs font-bold text-white">GitHub Runner</p>
              <p className="text-[10px] text-zinc-500">Loads action.yml</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 shrink-0" />

            <div className="p-4 rounded-xl bg-primary/15 border border-primary/40 text-center flex-1 shadow-glow">
              <ShieldAlert className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs font-bold text-white">LeakGuard AST Scan</p>
              <p className="text-[10px] text-primary-light">CFG & Path Analysis</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 shrink-0" />

            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-center flex-1">
              <ShieldAlert className="w-5 h-5 text-rose-400 mx-auto mb-1" />
              <p className="text-xs font-bold text-rose-300">Policy Check</p>
              <p className="text-[10px] text-zinc-400">Exit code 1 if Definite</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 shrink-0" />

            <div className="p-4 rounded-xl bg-rose-600 text-white font-bold text-center flex-1 shadow-glow-red">
              <p className="text-xs uppercase">PR BLOCKED</p>
              <p className="text-[10px] text-rose-100 font-normal">Prevents Unsafe Merges</p>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Viewers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* action.yml */}
        <div className="card-elevated p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-white">
              <FileCode className="w-4 h-4 text-primary-light" />
              <span>action.yml (Action Definition)</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyAction}
              icon={copiedAction ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copiedAction ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0d1017] p-4 font-mono text-xs text-zinc-300 overflow-x-auto max-h-72 custom-scrollbar">
            <pre>{actionYml}</pre>
          </div>
        </div>

        {/* Workflow YML */}
        <div className="card-elevated p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-white">
              <Workflow className="w-4 h-4 text-primary-light" />
              <span>.github/workflows/leakguard.yml</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyWorkflow}
              icon={copiedWorkflow ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copiedWorkflow ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0d1017] p-4 font-mono text-xs text-zinc-300 overflow-x-auto max-h-72 custom-scrollbar">
            <pre>{workflowYml}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
