import React from 'react';
import { 
  FolderGit2, 
  GitBranch, 
  Files, 
  AlertTriangle, 
  ShieldAlert, 
  Play, 
  ArrowRight,
  ExternalLink
} from '@/components/icons';
import { Project } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

interface ProjectsPageProps {
  projects: Project[];
  onTriggerScan: () => void;
  onSelectProject?: (projectId: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  onTriggerScan,
  onSelectProject
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Monitored Projects</h2>
          <p className="text-sm text-zinc-400">Configured repositories and target folders under static security analysis</p>
        </div>
        <Button onClick={onTriggerScan} icon={<Play className="w-4 h-4 fill-current" />}>
          Scan Repository
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="card-elevated p-6 space-y-5 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary-light border border-primary/20">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-mono">{project.name}</h3>
                    <span className="text-xs text-zinc-500">{project.repository}</span>
                  </div>
                </div>
                <Badge variant="status" value={project.status} />
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 pt-1">
                <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  <GitBranch className="w-3 h-3 text-zinc-500" />
                  {project.branch}
                </span>
                <span>•</span>
                <span>Last scan: {project.last_scan || 'Recent'}</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#0e111a] border border-white/5 text-center text-xs">
              <div>
                <span className="text-[10px] uppercase text-zinc-500 font-semibold block">Files</span>
                <span className="font-mono font-bold text-white text-sm">{project.files_count}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-zinc-500 font-semibold block">Leaks</span>
                <span className={`font-mono font-bold text-sm ${project.issues_count > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {project.issues_count}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-zinc-500 font-semibold block">Risk</span>
                <span className={`font-mono font-semibold text-xs ${project.risk_level === 'High' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {project.risk_level}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/5">
              <span className="text-xs text-zinc-500 font-mono">{project.path}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onTriggerScan}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Scan Now
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
