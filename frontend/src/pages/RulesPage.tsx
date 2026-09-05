import React, { useState, useEffect } from 'react';
import { 
  BookOpenCheck, 
  Code, 
  CheckCircle2, 
  Plus, 
  FileCode, 
  Sliders, 
  Copy, 
  Check, 
  Layers
} from '@/components/icons';
import { ResourceRule } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { api } from '../services/api';

export const RulesPage: React.FC = () => {
  const [rules, setRules] = useState<ResourceRule[]>([]);
  const [configPath, setConfigPath] = useState('leakguard/rules/resources.yaml');
  const [copiedYaml, setCopiedYaml] = useState(false);

  useEffect(() => {
    api.getRules().then(res => {
      setRules(res.resources);
      setConfigPath(res.config_path);
    });
  }, []);

  const customYamlExample = `resources:
  - name: file
    acquire:
      - open
    release:
      - close

  - name: socket
    acquire:
      - socket.socket
    release:
      - close

  - name: sqlite_connection
    acquire:
      - sqlite3.connect
    release:
      - close

  # Custom Custom Resource Example:
  - name: custom_client
    acquire:
      - ClientSession
      - acquire_lock
    release:
      - close
      - release_lock`;

  const handleCopyYaml = () => {
    navigator.clipboard.writeText(customYamlExample);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Resource Rules & Registry</h2>
          <p className="text-sm text-zinc-400">
            Declarative configuration for Python acquisition and release lifecycle tracking
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-400 bg-card-elevated px-3 py-1.5 rounded-xl border border-white/5">
          <span>Config:</span>
          <span className="text-primary-light font-semibold">{configPath}</span>
        </div>
      </div>

      {/* Rules Table Card */}
      <div className="card-elevated overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpenCheck className="w-5 h-5 text-primary-light" />
            <h3 className="text-base font-bold text-white">Active Resource Rules ({rules.length})</h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            All Rules Operational
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#141722] text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <th className="py-3.5 px-5">Resource Type</th>
                <th className="py-3.5 px-5">Acquisition Pattern(s)</th>
                <th className="py-3.5 px-5">Expected Cleanup Method(s)</th>
                <th className="py-3.5 px-5">Engine Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {rules.map((rule) => (
                <tr key={rule.name} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-bold text-white capitalize font-mono text-sm">
                      {rule.name}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{rule.description}</p>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex flex-wrap gap-1.5">
                      {rule.acquire.map((acq) => (
                        <span key={acq} className="font-mono text-primary-light bg-primary/10 border border-primary/25 px-2.5 py-1 rounded-lg text-xs font-medium">
                          {acq}()
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex flex-wrap gap-1.5">
                      {rule.release.map((rel) => (
                        <span key={rel} className="font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-lg text-xs font-medium">
                          .{rel}()
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {rule.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Rules YAML Guide */}
      <div className="card-elevated p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary-light border border-primary/20">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">YAML Rule Configuration Format</h3>
              <p className="text-xs text-zinc-400">Add custom internal handles, client sessions, locks, and resources</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyYaml}
            icon={copiedYaml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copiedYaml ? "Copied" : "Copy YAML"}
          </Button>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0d1017] p-4 font-mono text-xs text-zinc-300 overflow-x-auto custom-scrollbar">
          <pre>{customYamlExample}</pre>
        </div>
      </div>
    </div>
  );
};
