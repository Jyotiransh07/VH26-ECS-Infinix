import React, { useState, useEffect } from 'react';
import { 
  Webhook, 
  Github, 
  GitCommit, 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink,
  Code
} from '@/components/icons';
import { Integration } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { api } from '../services/api';

interface IntegrationsPageProps {
  onNavigateTab: (tab: string) => void;
}

export const IntegrationsPage: React.FC<IntegrationsPageProps> = ({ onNavigateTab }) => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);

  useEffect(() => {
    api.getIntegrations().then(setIntegrations);
  }, []);

  const getIcon = (id: string) => {
    switch (id) {
      case 'cli': return Terminal;
      case 'github': return Github;
      case 'precommit': return GitCommit;
      case 'sarif': return ShieldCheck;
      case 'fastapi': return Cpu;
      default: return Webhook;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Integrations Hub</h2>
        <p className="text-sm text-zinc-400">
          Connect LeakGuard to your local terminal, Git pre-commit hooks, CI/CD pipelines, and GitHub code scanning
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => {
          const Icon = getIcon(item.id);
          const isConnected = item.status === 'Connected' || item.status === 'Available' || item.status === 'Configured';
          return (
            <div
              key={item.id}
              className="card-elevated p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary-light border border-primary/20">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    item.status === 'Connected' 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-primary/15 text-primary-light border border-primary/30'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {item.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{item.name}</h3>
                  <span className="text-[11px] text-zinc-500 font-semibold uppercase">{item.type}</span>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-mono">
                  {item.last_active || 'Ready'}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (['github', 'precommit', 'cli'].includes(item.id)) {
                      onNavigateTab(item.id);
                    } else if (item.id === 'sarif') {
                      onNavigateTab('reports');
                    }
                  }}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Configure
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
