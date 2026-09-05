import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  FileCode, 
  HelpCircle,
  Cpu,
  Layers
} from '@/components/icons';
import { Button } from '../components/common/Button';

export const CliPage: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const cliCommands = [
    {
      title: 'Scan Directory (Text / Console Output)',
      cmd: 'leakguard scan .',
      altCmd: 'python -m leakguard.cli scan .',
      desc: 'Standard scan printing high-confidence findings and summary table to stdout.'
    },
    {
      title: 'Generate Machine-Readable JSON Report',
      cmd: 'leakguard scan sample-repo-python --format json > report.json',
      altCmd: 'python -m leakguard.cli scan sample-repo-python --format json',
      desc: 'Generates structured JSON object containing files scanned, definite leaks, and path line numbers.'
    },
    {
      title: 'Generate SARIF v2.1.0 for GitHub Security Upload',
      cmd: 'leakguard scan . --format sarif > results.sarif',
      altCmd: 'python -m leakguard.cli scan . --format sarif',
      desc: 'Generates official SARIF report for integration with github/codeql-action/upload-sarif.'
    },
    {
      title: 'Custom Resource Rules YAML',
      cmd: 'leakguard scan . --config custom_resources.yaml',
      altCmd: 'python -m leakguard.cli scan . --config custom_resources.yaml',
      desc: 'Specify a custom YAML rule file defining proprietary acquisition and release functions.'
    }
  ];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary-light border border-primary/20">
            <Terminal className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">LeakGuard CLI Terminal Hub</h2>
            <p className="text-sm text-zinc-400">Direct command-line interface usage, flags, exit codes, and examples</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-primary-light bg-primary/15 px-3 py-1.5 rounded-xl border border-primary/30">
          leakguard v0.1.0
        </span>
      </div>

      {/* Commands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cliCommands.map((item, idx) => (
          <div key={idx} className="card-elevated p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white">{item.title}</h3>
              <p className="text-xs text-zinc-400">{item.desc}</p>
            </div>

            <div className="space-y-2">
              <div className="rounded-xl border border-white/10 bg-[#0d1017] p-3 flex items-center justify-between group">
                <code className="font-mono text-xs text-primary-light truncate mr-2">{item.cmd}</code>
                <button
                  onClick={() => handleCopy(item.cmd, idx * 2)}
                  className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
                >
                  {copiedIndex === idx * 2 ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="rounded-xl border border-white/5 bg-[#0a0c12] p-2.5 flex items-center justify-between">
                <code className="font-mono text-[11px] text-zinc-400 truncate mr-2">{item.altCmd}</code>
                <button
                  onClick={() => handleCopy(item.altCmd, idx * 2 + 1)}
                  className="p-1 rounded text-zinc-500 hover:text-white transition-colors"
                >
                  {copiedIndex === idx * 2 + 1 ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Exit Codes & CI Policy Box */}
      <div className="card-elevated p-6 space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">CLI Exit Codes & Enforcement Standard</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
            <p className="font-bold text-emerald-400 font-mono text-sm">Exit Code 0 (PASS)</p>
            <p className="text-zinc-400 mt-1">No definite resource leaks detected in any execution path.</p>
          </div>
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30">
            <p className="font-bold text-rose-400 font-mono text-sm">Exit Code 1 (BLOCKED)</p>
            <p className="text-zinc-400 mt-1">One or more HIGH confidence definite resource leaks found.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30">
            <p className="font-bold text-amber-400 font-mono text-sm">Exit Code 2 (ERROR)</p>
            <p className="text-zinc-400 mt-1">Target path does not exist or arguments are invalid.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
