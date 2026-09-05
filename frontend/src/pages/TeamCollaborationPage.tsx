import React, { useState } from 'react';
import { Users, CheckCircle2, ShieldCheck, Mail, FolderGit2, Plus, Clock } from '@/components/icons';

export const TeamCollaborationPage: React.FC = () => {
  const [members, setMembers] = useState([
    {
      id: 'usr-1',
      name: 'Janson Williams',
      role: 'Lead Security Engineer',
      email: 'williams@mesh.com',
      repositories: ['sample-repo-python', 'demo-project'],
      assignedFindings: 2,
      status: 'Active'
    },
    {
      id: 'usr-2',
      name: 'Elena Rostova',
      role: 'DevSecOps Specialist',
      email: 'elena@mesh.com',
      repositories: ['sample-repo-python', 'payment-service'],
      assignedFindings: 1,
      status: 'Active'
    },
    {
      id: 'usr-3',
      name: 'Marcus Vance',
      role: 'Backend Python Engineer',
      email: 'marcus@mesh.com',
      repositories: ['payment-service'],
      assignedFindings: 1,
      status: 'In Review'
    },
    {
      id: 'usr-4',
      name: 'Sarah Chen',
      role: 'QA & Compliance Architect',
      email: 'sarah@mesh.com',
      repositories: ['demo-project'],
      assignedFindings: 0,
      status: 'Active'
    }
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Team Members & Repository Permissions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Multi-developer collaboration with repository-level membership and realtime finding alerts.
          </p>
        </div>

        <button
          onClick={() => alert('Invite member modal: Enter developer email to grant repository access.')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Invite Member</span>
        </button>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {members.map((m) => (
          <div key={m.id} className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {m.name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400">
                {m.status}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {m.name}
                </h4>
                <CheckCircle2 className="w-3 h-3 text-teal-500" />
              </div>
              <p className="text-[11px] text-slate-400">{m.role}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Assigned Leaks</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{m.assignedFindings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Repositories</span>
                <span className="font-mono text-teal-600 dark:text-teal-400">{m.repositories.length} access</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Multi-Developer Repository Access Matrix */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
          Repository Access & Realtime Notification Matrix
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="pb-3 font-semibold">DEVELOPER</th>
                <th className="pb-3 font-semibold">SAMPLE-REPO-PYTHON</th>
                <th className="pb-3 font-semibold">PAYMENT-SERVICE</th>
                <th className="pb-3 font-semibold">DEMO-PROJECT</th>
                <th className="pb-3 font-semibold text-right">REALTIME BROADCAST</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                    {m.name}
                  </td>
                  <td className="py-3.5">
                    {m.repositories.includes('sample-repo-python') ? (
                      <span className="text-teal-600 dark:text-teal-400 font-bold">✔ Read & Triage</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5">
                    {m.repositories.includes('payment-service') ? (
                      <span className="text-teal-600 dark:text-teal-400 font-bold">✔ Full Access</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5">
                    {m.repositories.includes('demo-project') ? (
                      <span className="text-teal-600 dark:text-teal-400 font-bold">✔ Read Only</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 text-right font-mono text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                    SUBSCRIBED
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
