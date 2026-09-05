import React from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Play, 
  Settings, 
  CheckCircle2,
  Cpu,
  Sparkles
} from '@/components/icons';
import { Button } from '../common/Button';

interface TopHeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileNav: () => void;
  onTriggerScan: () => void;
  onOpenSettings: () => void;
  engineOnline?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  subtitle,
  onOpenMobileNav,
  onTriggerScan,
  onOpenSettings,
  engineOnline = true
}) => {
  return (
    <header className="sticky top-0 z-30 h-20 bg-[#0b0d13]/80 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Info */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileNav}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-zinc-400 hidden sm:block mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Search, System Status, Notifications & Primary CTA */}
      <div className="flex items-center gap-3">
        {/* Global Search Input */}
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search scans, files, rules..."
            className="w-full bg-[#131722] border border-white/10 rounded-xl pl-9 pr-10 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-white/5 border border-white/10 text-zinc-400 px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </div>

        {/* System Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card-elevated border border-white/5 text-xs text-zinc-300">
          <Cpu className="w-3.5 h-3.5 text-primary-light" />
          <span className="font-mono font-medium">AST/CFG Active</span>
          <span className={`w-2 h-2 rounded-full ${engineOnline ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
        </div>

        {/* Notifications Icon */}
        <button className="relative p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>

        {/* Settings button */}
        <button 
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors hidden sm:block"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Primary Action Button: Lavender "Run Scan" */}
        <Button
          onClick={onTriggerScan}
          icon={<Play className="w-4 h-4 fill-current" />}
          className="font-semibold shadow-glow"
        >
          Run Scan
        </Button>
      </div>
    </header>
  );
};
