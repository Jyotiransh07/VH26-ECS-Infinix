import React, { useState } from 'react';
import { 
  GitCommit, 
  CheckCircle2, 
  Terminal, 
  FileCode, 
  Copy, 
  Check, 
  ShieldCheck,
  ArrowRight
} from '@/components/icons';
import { Button } from '../components/common/Button';

export const PreCommitPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const precommitConfig = `repos:
  - repo: https://github.com/Jyotiransh07/VH26-ECS-Infinix
    rev: v0.1.0
    hooks:
      - id: leakguard
        name: LeakGuard Resource Leak Detector
        entry: leakguard scan .
        language: python
        types: [python]
        pass_filenames: false`;

  const installCmd = `pip install pre-commit
pre-commit install
pre-commit run leakguard --all-files`;

  const handleCopy = () => {
    navigator.clipboard.writeText(precommitConfig);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(installCmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary-light border border-primary/20">
            <GitCommit className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Pre-commit Git Hook</h2>
            <p className="text-sm text-zinc-400">Catch unclosed file handles, sockets, and database connections before commit</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-4 h-4" /> Ready for Installation
        </span>
      </div>

      {/* Setup Instructions Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* .pre-commit-config.yaml */}
        <div className="card-elevated p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-white">
              <FileCode className="w-4 h-4 text-primary-light" />
              <span>.pre-commit-config.yaml</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? "Copied" : "Copy YAML"}
            </Button>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0d1017] p-4 font-mono text-xs text-zinc-300 overflow-x-auto custom-scrollbar">
            <pre>{precommitConfig}</pre>
          </div>
        </div>

        {/* Shell Installation */}
        <div className="card-elevated p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-white">
                <Terminal className="w-4 h-4 text-primary-light" />
                <span>Installation Commands</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyCmd}
                icon={copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copiedCmd ? "Copied" : "Copy"}
              </Button>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0d1017] p-4 font-mono text-xs text-primary-light overflow-x-auto">
              <pre>{installCmd}</pre>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs text-zinc-300 space-y-1">
            <p className="font-semibold text-white">Why use Pre-commit?</p>
            <p className="text-zinc-400">
              Pre-commit catches resource descriptor leaks locally in &lt;100ms before they ever push to remote repositories or trigger CI failures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
