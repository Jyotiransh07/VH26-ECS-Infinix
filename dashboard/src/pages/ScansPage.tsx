import React, { useState } from 'react';
import { 
  ScanSearch, 
  Play, 
  Filter, 
  Search, 
  CheckCircle2, 
  AlertTriangle,
  FolderGit2,
  Calendar
} from '@/components/icons';
import { ScanResult } from '../types';
import { Button } from '../components/common/Button';
import { ScanTable } from '../components/scans/ScanTable';

interface ScansPageProps {
  scans: ScanResult[];
  onTriggerScan: () => void;
  onSelectScan: (scanId: string) => void;
}

export const ScansPage: React.FC<ScansPageProps> = ({
  scans,
  onTriggerScan,
  onSelectScan
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredScans = scans.filter((scan) => {
    const matchesSearch = scan.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scan.target_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scan.branch.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || scan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Scan History</h2>
          <p className="text-sm text-zinc-400">Review all static analysis runs, durations, and enforcement results</p>
        </div>
        <Button onClick={onTriggerScan} icon={<Play className="w-4 h-4 fill-current" />}>
          New Scan
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-card-elevated border border-white/5">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by project, path, branch..."
            className="w-full bg-[#10131c] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-primary/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-zinc-500 hidden sm:block" />
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#10131c] border border-white/5 w-full sm:w-auto">
            {['ALL', 'PASS', 'BLOCKED', 'WARNING'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === status 
                    ? 'bg-primary text-white shadow-glow' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scans Table */}
      <ScanTable
        scans={filteredScans}
        onSelectScan={onSelectScan}
      />
    </div>
  );
};
