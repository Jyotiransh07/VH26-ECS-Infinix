import React, { useState } from 'react';
import { 
  GitFork, 
  ArrowDown, 
  CheckCircle2, 
  AlertOctagon, 
  ShieldAlert, 
  CornerDownRight,
  Info,
  Sparkles
} from '@/components/icons';
import { CFGNode, IssueFinding } from '../../types';

interface CFGGraphProps {
  nodes?: CFGNode[];
  finding: IssueFinding;
}

export const CFGGraph: React.FC<CFGGraphProps> = ({ nodes, finding }) => {
  const [activeNode, setActiveNode] = useState<number | null>(null);

  // If no custom nodes, build default CFG nodes
  const displayNodes = nodes && nodes.length > 0 ? nodes : [
    { id: 1, label: `Acquire ${finding.resource_type} ('${finding.variable_name}')`, type: 'acquisition' as const, line: finding.line, is_leaking: false, is_exit: false },
    { id: 2, label: `Branch / Execution Path`, type: 'branch' as const, line: finding.path[0] || finding.line + 2, is_leaking: true, is_exit: false },
    { id: 3, label: `Early Return / Termination`, type: 'return' as const, line: finding.path[finding.path.length - 1] || finding.line + 4, is_leaking: true, is_exit: false },
    { id: 4, label: `EXIT: Resource Unclosed (Leak Detected)`, type: 'exit' as const, line: null, is_leaking: true, is_exit: true },
    { id: 99, label: `Expected ${finding.variable_name}.close()`, type: 'cleanup' as const, line: null, is_leaking: false, is_exit: false },
    { id: 100, label: `Normal Safe Exit`, type: 'exit' as const, line: null, is_leaking: false, is_exit: true },
  ];

  const acquisitionNode = displayNodes.find(n => n.type === 'acquisition') || displayNodes[0];
  const leakingNodes = displayNodes.filter(n => n.is_leaking && n.type !== 'exit');
  const leakingExitNode = displayNodes.find(n => n.is_exit && n.is_leaking);
  const cleanupNode = displayNodes.find(n => n.type === 'cleanup');
  const safeExitNode = displayNodes.find(n => n.is_exit && !n.is_leaking);

  return (
    <div className="card-elevated p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary-light border border-primary/20">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Control Flow Graph (CFG)</h3>
            <p className="text-xs text-zinc-400">Static branch analysis and leak propagation topology</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-rose-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" /> Leaking Path
          </span>
          <span className="text-zinc-600">|</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Safe Alternative
          </span>
        </div>
      </div>

      {/* Interactive Visual Graph Canvas */}
      <div className="p-6 rounded-2xl bg-[#0a0c12] border border-white/5 relative overflow-hidden flex flex-col items-center">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="w-full max-w-xl space-y-4 relative z-10 flex flex-col items-center">
          {/* 1. Acquisition Node (Top) */}
          <div 
            onMouseEnter={() => setActiveNode(acquisitionNode.id)}
            onMouseLeave={() => setActiveNode(null)}
            className="w-full p-4 rounded-xl bg-[#161a26] border-2 border-primary/60 text-center shadow-glow transition-transform hover:scale-[1.02] cursor-pointer"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-light block mb-1">
              Resource Acquisition (Entry)
            </span>
            <p className="text-sm font-semibold text-white font-mono">
              {acquisitionNode.label}
            </p>
            {acquisitionNode.line && (
              <span className="text-[11px] text-zinc-400 font-mono mt-1 inline-block">
                Source Line: {acquisitionNode.line}
              </span>
            )}
          </div>

          {/* Split Branches */}
          <div className="w-full flex items-center justify-between text-xs text-zinc-500 px-12 py-1">
            <div className="flex flex-col items-center text-rose-400 font-medium">
              <span>Leaking Branch</span>
              <ArrowDown className="w-4 h-4 animate-bounce text-rose-400 mt-1" />
            </div>
            <div className="flex flex-col items-center text-emerald-400 font-medium">
              <span>Guaranteed Cleanup</span>
              <ArrowDown className="w-4 h-4 text-emerald-400 mt-1" />
            </div>
          </div>

          {/* 2-Column Split: Leaking Path vs Safe Path */}
          <div className="w-full grid grid-cols-2 gap-4">
            {/* Left Column: Leaking Path */}
            <div className="space-y-3">
              {leakingNodes.map((node, i) => (
                <div
                  key={node.id}
                  className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-left hover:border-rose-500/60 transition-all shadow-glow-red"
                >
                  <div className="flex items-center gap-1.5 mb-1 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Path Step {i + 1}</span>
                  </div>
                  <p className="text-xs font-mono font-medium text-zinc-200">{node.label}</p>
                  {node.line && (
                    <p className="text-[10px] text-rose-400/80 font-mono mt-1">Line {node.line}</p>
                  )}
                </div>
              ))}

              {/* Leaking Exit Terminal */}
              {leakingExitNode && (
                <div className="p-3.5 rounded-xl bg-rose-600 text-white font-bold text-center border border-rose-400 shadow-glow-red animate-pulse">
                  <p className="text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> DEFINITE RESOURCE LEAK
                  </p>
                  <p className="text-[10px] text-rose-100 font-normal mt-0.5 font-mono">
                    Function returns without calling .close()
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Safe Alternative */}
            <div className="space-y-3">
              {cleanupNode && (
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-left hover:border-emerald-500/60 transition-all">
                  <div className="flex items-center gap-1.5 mb-1 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resource Release</span>
                  </div>
                  <p className="text-xs font-mono font-medium text-zinc-200">{cleanupNode.label}</p>
                  <p className="text-[10px] text-emerald-400/80 font-mono mt-1">
                    Guaranteed in all branches / context manager
                  </p>
                </div>
              )}

              {/* Safe Exit Terminal */}
              {safeExitNode && (
                <div className="p-3.5 rounded-xl bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 text-center font-semibold">
                  <p className="text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Safe Scope Exit
                  </p>
                  <p className="text-[10px] text-zinc-400 font-normal mt-0.5">
                    Descriptor closed before stack unwind
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
