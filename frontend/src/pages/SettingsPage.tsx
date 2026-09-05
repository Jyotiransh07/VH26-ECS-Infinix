import React, { useState } from 'react';
import { 
  Settings, 
  Cpu, 
  ShieldCheck, 
  Sliders, 
  Database, 
  Activity,
  CheckCircle2
} from '@/components/icons';
import { Button } from '../components/common/Button';
import { HealthStatus } from '../types';

interface SettingsPageProps {
  health: HealthStatus;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ health }) => {
  const [failOnDefinite, setFailOnDefinite] = useState(true);
  const [failOnLikely, setFailOnLikely] = useState(false);
  const [autoSarif, setAutoSarif] = useState(true);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">System Settings & Engine Health</h2>
        <p className="text-sm text-zinc-400">Configure enforcement policies, engine thresholds, and inspect runtime health</p>
      </div>

      {/* System Health Diagnostics */}
      <div className="card-elevated p-6 space-y-5">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <Activity className="w-5 h-5 text-primary-light" />
          <h3 className="text-base font-bold text-white">LeakGuard Runtime Telemetry</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0f121a] border border-white/5 space-y-1">
            <span className="text-zinc-500 uppercase font-semibold text-[10px]">Static Engine</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="font-bold text-white text-sm">Online (Active)</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0f121a] border border-white/5 space-y-1">
            <span className="text-zinc-500 uppercase font-semibold text-[10px]">FastAPI Bridge</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <p className="font-bold text-white text-sm">Connected (Port 8000)</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0f121a] border border-white/5 space-y-1">
            <span className="text-zinc-500 uppercase font-semibold text-[10px]">Active Resource Rules</span>
            <p className="font-bold text-white text-sm font-mono">{health.rules_loaded} Configured</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0f121a] border border-white/5 space-y-1">
            <span className="text-zinc-500 uppercase font-semibold text-[10px]">Engine Version</span>
            <p className="font-bold text-primary-light text-sm font-mono">v{health.version}</p>
          </div>
        </div>
      </div>

      {/* Policy Enforcement Rules */}
      <div className="card-elevated p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <Sliders className="w-5 h-5 text-primary-light" />
          <h3 className="text-base font-bold text-white">CI/CD & Pre-commit Enforcement Policy</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#0e111a] border border-white/5">
            <div>
              <p className="text-sm font-semibold text-white">Block CI on Definite Leaks (High Confidence)</p>
              <p className="text-xs text-zinc-400">Exit code 1 will be returned if any unclosed execution path is proven.</p>
            </div>
            <input
              type="checkbox"
              checked={failOnDefinite}
              onChange={(e) => setFailOnDefinite(e.target.checked)}
              className="w-5 h-5 accent-primary rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-[#0e111a] border border-white/5">
            <div>
              <p className="text-sm font-semibold text-white">Block CI on Likely Leaks (Medium Confidence)</p>
              <p className="text-xs text-zinc-400">Exit code 1 on exception branches that bypass cleanup.</p>
            </div>
            <input
              type="checkbox"
              checked={failOnLikely}
              onChange={(e) => setFailOnLikely(e.target.checked)}
              className="w-5 h-5 accent-primary rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-[#0e111a] border border-white/5">
            <div>
              <p className="text-sm font-semibold text-white">Auto-generate SARIF v2.1.0 Artifact</p>
              <p className="text-xs text-zinc-400">Produce SARIF logs after every static analysis pass.</p>
            </div>
            <input
              type="checkbox"
              checked={autoSarif}
              onChange={(e) => setAutoSarif(e.target.checked)}
              className="w-5 h-5 accent-primary rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
