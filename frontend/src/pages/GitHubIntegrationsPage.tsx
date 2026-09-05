import React, { useState } from 'react';
import { 
  Github, 
  GitBranch, 
  Workflow, 
  GitCommit, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  FolderGit2, 
  ShieldCheck, 
  AlertTriangle 
} from '@/components/icons';
import { Project } from '../types';

interface GitHubIntegrationsPageProps {
  projects: Project[];
  onTriggerScan: () => void;
}

export const GitHubIntegrationsPage: React.FC<GitHubIntegrationsPageProps> = ({
  projects,
  onTriggerScan
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectedUser, setConnectedUser] = useState<string | null>('Jyotiransh07');

  const connectedRepos = [
    {
      name: 'Jyotiransh07/VH26-ECS-Infinix',
      branch: 'main',
      commit: 'f4a9b1c',
      lastScan: 'Just now',
      status: 'BLOCKED',
      definiteLeaks: 4,
      ciStatus: 'ACTION CONFIGURED'
    },
    {
      name: 'mesh-enterprise/payment-service',
      branch: 'production',
      commit: '9e8d7c6',
      lastScan: '1 day ago',
      status: 'PASS',
      definiteLeaks: 0,
      ciStatus: 'SAFE'
    },
    {
      name: 'demo-project/python-backend',
      branch: 'main',
      commit: 'a1b2c3d',
      lastScan: '2 hours ago',
      status: 'BLOCKED',
      definiteLeaks: 1,
      ciStatus: 'ACTION CONFIGURED'
    }
  ];

  const handleSyncGitHub = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert('GitHub Repositories synchronized via Supabase Auth.');
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* GitHub OAuth Status Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
            <Github className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                GitHub Organization Integration
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400">
                CONNECTED
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Authenticated as <strong className="text-slate-700 dark:text-slate-300">@{connectedUser}</strong> via Supabase OAuth
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncGitHub}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Repositories</span>
          </button>

          <a
            href="https://github.com/Jyotiransh07/VH26-ECS-Infinix"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-all shadow-xs"
          >
            <span>View on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Connected Repositories Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            Connected GitHub Repositories ({connectedRepos.length})
          </h4>
          <span className="text-xs text-slate-400 font-mono">Real-time Webhook Enabled</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="pb-3 font-semibold">REPOSITORY</th>
                <th className="pb-3 font-semibold">DEFAULT BRANCH</th>
                <th className="pb-3 font-semibold">LATEST COMMIT</th>
                <th className="pb-3 font-semibold">LAST SCAN</th>
                <th className="pb-3 font-semibold">SECURITY STATUS</th>
                <th className="pb-3 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {connectedRepos.map((repo) => (
                <tr key={repo.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 font-bold text-slate-900 dark:text-white font-mono flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-slate-400" />
                    <span>{repo.name}</span>
                  </td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      {repo.branch}
                    </span>
                  </td>
                  <td className="py-3.5 font-mono text-teal-600 dark:text-teal-400 font-semibold">
                    {repo.commit}
                  </td>
                  <td className="py-3.5 text-slate-500 dark:text-slate-400">
                    {repo.lastScan}
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      repo.status === 'PASS'
                        ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                    }`}>
                      {repo.definiteLeaks > 0 ? `${repo.definiteLeaks} DEFINITE LEAKS` : 'SAFE'}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={onTriggerScan}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300 hover:bg-teal-500/20 transition-colors"
                    >
                      Trigger Scan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GitHub Actions & Pre-commit Documentation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GitHub Action CI/CD */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                GitHub Action: action.yml
              </h4>
              <p className="text-xs text-slate-400 font-mono">.github/workflows/leakguard.yml</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            LeakGuard integrates into GitHub Actions via composite actions, uploading SARIF v2.1.0 diagnostics directly to GitHub Code Scanning.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-[11px] text-teal-300 overflow-x-auto">
            <pre>{`- name: Scan with LeakGuard (SARIF)
  run: leakguard scan sample-repo-python/ --format sarif > results.sarif
  continue-on-error: true

- name: Upload to GitHub Code Scanning
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: results.sarif`}</pre>
          </div>
        </div>

        {/* Pre-commit Hook */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <GitCommit className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Pre-Commit Git Hook Integration
              </h4>
              <p className="text-xs text-slate-400 font-mono">.pre-commit-config.yaml</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Prevent unclosed file handles from ever entering the git commit history by enforcing the local LeakGuard CLI gate.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-[11px] text-indigo-300 overflow-x-auto">
            <pre>{`- repo: local
  hooks:
    - id: leakguard
      name: LeakGuard Static Analyzer
      entry: python -m leakguard.cli scan
      language: system
      types: [python]
      pass_filenames: true`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
