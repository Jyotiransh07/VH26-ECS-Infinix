import React from 'react';
import { ShieldCheck, Github } from '@/components/icons';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1120] text-xs text-slate-500 dark:text-slate-400 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
            LeakGuard Static Analysis
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <a href="#intro" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Documentation</a>
          <a href="https://github.com/Jyotiransh07/VH26-ECS-Infinix" target="_blank" rel="noopener noreferrer" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">GitHub</a>
          <a href="#ci-cd" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">CI/CD Integration</a>
          <a href="#faq" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">FAQ</a>
        </div>

        <p className="text-[11px] text-slate-400">
          © 2026 LeakGuard. Built for Python developers.
        </p>
      </div>
    </footer>
  );
};
