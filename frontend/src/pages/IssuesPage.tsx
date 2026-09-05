import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  ShieldAlert, 
  Layers, 
  SlidersHorizontal,
  ChevronDown
} from '@/components/icons';
import { IssueFinding } from '../types';
import { IssuesTable } from '../components/issues/IssuesTable';
import { Badge } from '../components/common/Badge';

interface IssuesPageProps {
  issues: IssueFinding[];
  onSelectIssue: (issueId: string) => void;
}

export const IssuesPage: React.FC<IssuesPageProps> = ({
  issues,
  onSelectIssue
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [resourceFilter, setResourceFilter] = useState('ALL');

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch = issue.file.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          issue.variable_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          issue.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || issue.severity === severityFilter;
    const matchesResource = resourceFilter === 'ALL' || issue.resource_type === resourceFilter;
    return matchesSearch && matchesSeverity && matchesResource;
  });

  const uniqueResources = Array.from(new Set(issues.map(i => i.resource_type)));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Issues Explorer</h2>
        <p className="text-sm text-zinc-400">All static resource leaks detected across repository codebases</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-card-elevated border border-white/5">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by file, variable, reason..."
            className="w-full bg-[#10131c] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-primary/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Severity Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#10131c] border border-white/5">
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  severityFilter === sev 
                    ? 'bg-primary text-white shadow-glow' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Resource Type Dropdown */}
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="bg-[#10131c] border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-primary/50"
          >
            <option value="ALL">All Resources</option>
            {uniqueResources.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Issues Table */}
      <IssuesTable
        issues={filteredIssues}
        onSelectIssue={onSelectIssue}
      />
    </div>
  );
};
