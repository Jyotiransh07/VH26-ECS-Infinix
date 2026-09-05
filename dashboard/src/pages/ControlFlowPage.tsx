import React, { useState } from 'react';
import { 
  GitFork, 
  FileCode, 
  ArrowRight, 
  ShieldAlert, 
  Layers, 
  Sparkles 
} from '@/components/icons';
import { IssueFinding } from '../types';
import { CFGGraph } from '../components/issues/CFGGraph';
import { Badge } from '../components/common/Badge';

interface ControlFlowPageProps {
  issues: IssueFinding[];
}

export const ControlFlowPage: React.FC<ControlFlowPageProps> = ({ issues }) => {
  const [selectedIssueId, setSelectedIssueId] = useState<string>(issues[0]?.id || '');
  const currentFinding = issues.find(i => i.id === selectedIssueId) || issues[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Control Flow Graph Explorer</h2>
          <p className="text-sm text-zinc-400">
            Visual topology of abstract syntax branches, exception edges, and resource leak trajectories
          </p>
        </div>

        {issues.length > 0 && (
          <select
            value={selectedIssueId}
            onChange={(e) => setSelectedIssueId(e.target.value)}
            className="bg-card-elevated border border-white/10 rounded-xl px-4 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-primary/50"
          >
            {issues.map((iss) => (
              <option key={iss.id} value={iss.id}>
                {iss.file}:{iss.line} ({iss.resource_type})
              </option>
            ))}
          </select>
        )}
      </div>

      {currentFinding ? (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-card-elevated border border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 font-mono">
              <span className="font-bold text-white">{currentFinding.file}:{currentFinding.line}</span>
              <span className="text-zinc-500">•</span>
              <span className="text-primary-light capitalize">Resource: {currentFinding.resource_type} ('{currentFinding.variable_name}')</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="severity" value={currentFinding.severity} />
              <Badge variant="confidence" value={currentFinding.confidence} />
            </div>
          </div>

          <CFGGraph
            nodes={currentFinding.cfg_nodes}
            finding={currentFinding}
          />
        </div>
      ) : (
        <div className="p-12 text-center text-zinc-500">
          No findings available to visualize. Run a scan first.
        </div>
      )}
    </div>
  );
};
