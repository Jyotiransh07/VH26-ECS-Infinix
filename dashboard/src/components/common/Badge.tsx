import React from 'react';
import { Severity, Confidence, ScanStatus } from '../../types';

interface BadgeProps {
  variant?: 'severity' | 'confidence' | 'status' | 'outline' | 'purple';
  value: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'status', value, size = 'sm' }) => {
  const val = value.toUpperCase();
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  // Severity styles
  if (variant === 'severity') {
    if (val === 'HIGH') {
      return <span className={`inline-flex items-center font-medium rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/20 ${sizeClasses}`}>HIGH</span>;
    }
    if (val === 'MEDIUM') {
      return <span className={`inline-flex items-center font-medium rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 ${sizeClasses}`}>MEDIUM</span>;
    }
    return <span className={`inline-flex items-center font-medium rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 ${sizeClasses}`}>LOW</span>;
  }

  // Confidence styles
  if (variant === 'confidence') {
    if (val === 'DEFINITE') {
      return <span className={`inline-flex items-center font-medium rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-mono ${sizeClasses}`}>Definite</span>;
    }
    if (val === 'LIKELY') {
      return <span className={`inline-flex items-center font-medium rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono ${sizeClasses}`}>Likely</span>;
    }
    if (val === 'SAFE') {
      return <span className={`inline-flex items-center font-medium rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono ${sizeClasses}`}>Safe</span>;
    }
    return <span className={`inline-flex items-center font-medium rounded-full bg-zinc-700/30 text-zinc-400 border border-zinc-700/50 font-mono ${sizeClasses}`}>Unknown</span>;
  }

  // Status styles
  if (variant === 'status') {
    if (val === 'PASS') {
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          PASS
        </span>
      );
    }
    if (val === 'BLOCKED') {
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          BLOCKED
        </span>
      );
    }
    if (val === 'RUNNING') {
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
          RUNNING
        </span>
      );
    }
    if (val === 'WARNING') {
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          WARNING
        </span>
      );
    }
  }

  if (variant === 'purple') {
    return <span className={`inline-flex items-center font-medium rounded-full bg-primary/20 text-primary-light border border-primary/30 ${sizeClasses}`}>{value}</span>;
  }

  return <span className={`inline-flex items-center font-medium rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 ${sizeClasses}`}>{value}</span>;
};
