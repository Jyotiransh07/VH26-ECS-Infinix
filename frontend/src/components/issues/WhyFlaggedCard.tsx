import React from 'react';
import { HelpCircle, AlertOctagon, CheckCircle, ArrowRight, ShieldAlert } from '@/components/icons';
import { IssueFinding } from '../../types';

interface WhyFlaggedCardProps {
  finding: IssueFinding;
}

export const WhyFlaggedCard: React.FC<WhyFlaggedCardProps> = ({ finding }) => {
  const pathSteps = finding.path.length > 0 
    ? finding.path.map(p => `Line ${p}`) 
    : ['Direct statement execution'];

  return (
    <div className="card-elevated p-6 space-y-5 border-l-4 border-l-rose-500 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Why was this flagged?</h3>
            <p className="text-xs text-zinc-400">LeakGuard static analysis path evidence & root cause</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold uppercase px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
          {finding.confidence} Confidence
        </span>
      </div>

      <p className="text-sm text-zinc-200 leading-relaxed bg-[#0d1017] p-4 rounded-xl border border-white/5 font-sans">
        {finding.why_flagged || finding.reason}
      </p>

      {/* Path Breakdown Flow */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">
          Execution Path to Leak
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary-light border border-primary/30 text-xs font-mono font-medium">
            Acquire '{finding.variable_name}' (Line {finding.line})
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
          
          {finding.path.map((line, idx) => (
            <React.Fragment key={idx}>
              <div className="px-3 py-1.5 rounded-lg bg-white/5 text-zinc-300 border border-white/10 text-xs font-mono">
                Line {line} (Branch / Return)
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
            </React.Fragment>
          ))}

          <div className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold">
            EXIT (Unclosed Descriptor)
          </div>
        </div>
      </div>
    </div>
  );
};
