import React from 'react';
import { FolderGit2, Play } from '@/components/icons';
import { Project } from '../types';

interface RepositoriesListPageProps {
  projects: Project[];
  onTriggerScan: () => void;
}

export const RepositoriesListPage: React.FC<RepositoriesListPageProps> = ({
  projects,
  onTriggerScan
}) => {
  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Repositories
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitored codebases and branch health status.
          </p>
        </div>
        <button
          onClick={onTriggerScan}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-teal-600 hover:bg-teal-500 text-white transition-colors cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Scan repository</span>
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.map((repo) => (
          <div
            key={repo.id}
            className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-mono">
                  {repo.name}
                </h3>
                <span className="text-[11px] text-slate-400">branch: {repo.branch || 'main'}</span>
              </div>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                repo.open_findings > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  repo.open_findings > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
                {repo.open_findings > 0 ? 'Needs attention' : 'Healthy'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Open findings</span>
                <span className="font-semibold text-slate-900 dark:text-white">{repo.open_findings}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Last scan</span>
                <span className="text-slate-600 dark:text-slate-300 font-mono text-[11px]">Today</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
