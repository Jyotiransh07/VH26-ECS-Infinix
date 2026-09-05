import React from 'react';
import { 
  GitBranch, 
  Clock, 
  Timer, 
  ArrowRight, 
  FileCode, 
  FolderGit2, 
  ShieldCheck, 
  ShieldAlert 
} from '@/components/icons';
import { ScanResult } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface ScanTableProps {
  scans: ScanResult[];
  onSelectScan: (scanId: string) => void;
  selectedScanId?: string;
}

export const ScanTable: React.FC<ScanTableProps> = ({
  scans,
  onSelectScan,
  selectedScanId
}) => {
  return (
    <div className="card-elevated overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-[#141722] text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              <th className="py-3.5 px-4">Project</th>
              <th className="py-3.5 px-4">Branch</th>
              <th className="py-3.5 px-4">Files</th>
              <th className="py-3.5 px-4">Resources</th>
              <th className="py-3.5 px-4">Definite Leaks</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Duration</th>
              <th className="py-3.5 px-4">Timestamp</th>
              <th className="py-3.5 px-4 text-right">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {scans.map((scan) => {
              const isSelected = selectedScanId === scan.id;
              const dateStr = new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <tr
                  key={scan.id}
                  onClick={() => onSelectScan(scan.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-primary/15 border-l-2 border-primary' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-primary-light" />
                      {scan.project_name}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {scan.target_path}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="inline-flex items-center gap-1 font-mono text-zinc-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                      <GitBranch className="w-3 h-3 text-zinc-500" />
                      {scan.branch}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-zinc-300">
                    {scan.summary.files_scanned}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-zinc-300">
                    {scan.summary.resources_detected}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`font-mono font-bold ${scan.summary.definite_leaks > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {scan.summary.definite_leaks}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="status" value={scan.status} />
                  </td>
                  <td className="py-3.5 px-4 font-mono text-zinc-400">
                    {scan.duration_ms}ms
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400">
                    {dateStr}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="ghost" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Inspect
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
