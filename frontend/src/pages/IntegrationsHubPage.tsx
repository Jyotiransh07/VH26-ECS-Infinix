import React from 'react';
import { Workflow, GitCommit, Terminal } from '@/components/icons';

export const IntegrationsHubPage: React.FC = () => {
  return (
    <div className="space-y-5 max-w-4xl">
      <div className="pb-2 border-b border-slate-100 dark:border-slate-800/60">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Integrations
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Embed LeakGuard static analysis into your CI/CD pipelines and developer tools.
        </p>
      </div>

      <div className="space-y-4">
        {/* GitHub Actions */}
        <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">GitHub Actions</h3>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Connected</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Run LeakGuard automatically when code is pushed or a pull request is opened.
          </p>
          <div className="font-mono text-xs bg-slate-900 text-slate-100 p-3 rounded leading-relaxed overflow-x-auto">
            <div>- name: Run LeakGuard Static Scanner</div>
            <div>  uses: ./.github/workflows/leakguard.yml</div>
            <div>  with:</div>
            <div>    target: '.'</div>
          </div>
        </div>

        {/* Pre-commit */}
        <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Pre-commit</h3>
            <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">Configured</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Check staged Python files before committing to prevent leaks from entering version control.
          </p>
          <div className="font-mono text-xs bg-slate-900 text-slate-100 p-3 rounded leading-relaxed overflow-x-auto">
            <div>- repo: local</div>
            <div>  hooks:</div>
            <div>    - id: leakguard</div>
            <div>      name: leakguard</div>
            <div>      entry: python -m leakguard.cli scan</div>
            <div>      language: system</div>
          </div>
        </div>

        {/* CLI */}
        <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">CLI</h3>
            <span className="text-xs text-slate-400 font-mono">v0.1.0</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Direct command-line execution for local developers and custom build scripts.
          </p>
          <div className="font-mono text-xs bg-slate-900 text-slate-100 p-3 rounded leading-relaxed overflow-x-auto">
            python -m leakguard.cli scan sample-repo-python/ --format json
          </div>
        </div>
      </div>
    </div>
  );
};
