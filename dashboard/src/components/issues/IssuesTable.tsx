import React from 'react';
import { 
  AlertTriangle, 
  ArrowRight, 
  FileCode, 
  ShieldAlert, 
  Search,
  Filter
} from '@/components/icons';
import { IssueFinding } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface IssuesTableProps {
  issues: IssueFinding[];
  onSelectIssue: (issueId: string) => void;
  selectedIssueId?: string;
}

export const IssuesTable: React.FC<IssuesTableProps> = ({
  issues,
  onSelectIssue,
  selectedIssueId
}) => {
  return (
    <div className="card-elevated overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-[#141722] text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              <th className="py-3.5 px-4">Severity</th>
              <th className="py-3.5 px-4">Confidence</th>
              <th className="py-3.5 px-4">Resource & Variable</th>
              <th className="py-3.5 px-4">File : Line</th>
              <th className="py-3.5 px-4">Leak Reason</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {issues.map((issue) => {
              const isSelected = selectedIssueId === issue.id;
              return (
                <tr
                  key={issue.id}
                  onClick={() => onSelectIssue(issue.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-primary/15 border-l-2 border-primary' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <Badge variant="severity" value={issue.severity} />
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="confidence" value={issue.confidence} />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-white font-mono">
                      {issue.variable_name}
                    </div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                      {issue.resource_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-mono text-zinc-300">
                      <FileCode className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="hover:text-primary-light transition-colors">
                        {issue.file}:{issue.line}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-zinc-400 line-clamp-1">
                      {issue.reason}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="ghost" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Details
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
