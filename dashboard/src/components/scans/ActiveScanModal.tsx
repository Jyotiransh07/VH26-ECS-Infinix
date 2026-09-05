import React, { useState, useEffect } from 'react';
import { 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FolderCheck, 
  FileCode, 
  ShieldAlert, 
  GitFork, 
  Cpu, 
  FileCheck2, 
  Sparkles,
  ArrowRight,
  Download,
  Eye
} from '@/components/icons';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ScanResult } from '../../types';
import { api } from '../../services/api';

interface ActiveScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (scan: ScanResult) => void;
  onViewFinding?: (findingId: string) => void;
}

const PIPELINE_STAGES = [
  { id: 1, name: 'Target Selection', desc: 'Validating Python workspace and files' },
  { id: 2, name: 'AST Parsing', desc: 'Constructing Python abstract syntax trees' },
  { id: 3, name: 'Resource Detection', desc: 'Scanning for open(), socket(), connect()' },
  { id: 4, name: 'Lifecycle Tracking', desc: 'Tracing descriptor states & assignments' },
  { id: 5, name: 'CFG Path Building', desc: 'Synthesizing branch & exception graphs' },
  { id: 6, name: 'Safe Pattern Verification', desc: 'Checking `with` managers & try-finally' },
  { id: 7, name: 'Leak Decision Engine', desc: 'Identifying unclosed exit paths' },
  { id: 8, name: 'Confidence Scoring', desc: 'Assigning Definite / Likely / Safe' },
  { id: 9, name: 'Report Synthesis', desc: 'Generating structured JSON/SARIF payload' },
  { id: 10, name: 'Enforcement Policy', desc: 'Applying threshold (PASS / BLOCKED)' },
];

export const ActiveScanModal: React.FC<ActiveScanModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  onViewFinding
}) => {
  const [targetPath, setTargetPath] = useState('sample-repo-python');
  const [projectName, setProjectName] = useState('sample-repo-python');
  const [branch, setBranch] = useState('main');
  const [isScanning, setIsScanning] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [completedScan, setCompletedScan] = useState<ScanResult | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsScanning(false);
      setCurrentStage(0);
      setCompletedScan(null);
    }
  }, [isOpen]);

  const handleStartScan = async () => {
    setIsScanning(true);
    setCurrentStage(1);
    setCompletedScan(null);

    // Animate stages smoothly while making the real API call
    const stageInterval = setInterval(() => {
      setCurrentStage(prev => {
        if (prev < 9) return prev + 1;
        return prev;
      });
    }, 280);

    try {
      const result = await api.triggerScan(targetPath, projectName, branch);
      clearInterval(stageInterval);
      setCurrentStage(10);
      setCompletedScan(result);
      setIsScanning(false);
      onScanComplete(result);
    } catch (err) {
      clearInterval(stageInterval);
      setIsScanning(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={completedScan ? "Scan Complete — Results" : (isScanning ? "Active Analysis Pipeline" : "Configure & Run Scan")}
      subtitle={completedScan ? `Target: ${completedScan.target_path} (${completedScan.duration_ms}ms)` : "Static resource leak detection engine"}
      maxWidth="2xl"
    >
      {!isScanning && !completedScan ? (
        /* Configuration Form */
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-400 mb-2">
                Target Directory or File
              </label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => { setTargetPath('sample-repo-python'); setProjectName('sample-repo-python'); }}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    targetPath === 'sample-repo-python'
                      ? 'bg-primary/15 border-primary/40 text-white'
                      : 'bg-card border-white/5 text-zinc-400 hover:border-white/10'
                  }`}
                >
                  <p className="text-sm font-medium text-zinc-200">sample-repo-python</p>
                  <p className="text-xs text-zinc-500">6 files with deliberate leak paths</p>
                </button>

                <button
                  type="button"
                  onClick={() => { setTargetPath('demo-project'); setProjectName('demo-project'); }}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    targetPath === 'demo-project'
                      ? 'bg-primary/15 border-primary/40 text-white'
                      : 'bg-card border-white/5 text-zinc-400 hover:border-white/10'
                  }`}
                >
                  <p className="text-sm font-medium text-zinc-200">demo-project</p>
                  <p className="text-xs text-zinc-500">FastAPI demo endpoint</p>
                </button>
              </div>

              <input
                type="text"
                value={targetPath}
                onChange={(e) => setTargetPath(e.target.value)}
                placeholder="Enter path e.g. sample-repo-python or ."
                className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-primary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-2">
                  Git Branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
          </div>

          {/* Engine capabilities notice */}
          <div className="p-4 rounded-xl bg-[#141824] border border-white/5 flex items-start gap-3">
            <Cpu className="w-5 h-5 text-primary-light shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-300 space-y-1">
              <p className="font-semibold text-white">Full AST & CFG Control Flow Verification</p>
              <p className="text-zinc-400">
                LeakGuard will parse AST nodes, trace open descriptors across branches and exception edges, and score confidence using the official engine rules.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleStartScan} icon={<Play className="w-4 h-4 fill-current" />}>
              Start Analysis
            </Button>
          </div>
        </div>
      ) : isScanning ? (
        /* Live Pipeline Stage Animation */
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <div>
                <p className="text-sm font-semibold text-white">Executing LeakGuard Static Pipeline</p>
                <p className="text-xs text-primary-light">Target: {targetPath}</p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-1 rounded bg-primary/20 text-primary-light">
              Stage {currentStage}/10
            </span>
          </div>

          <div className="space-y-2">
            {PIPELINE_STAGES.map((stage) => {
              const isDone = stage.id < currentStage;
              const isCurrent = stage.id === currentStage;
              return (
                <div
                  key={stage.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    isDone 
                      ? 'bg-[#121620] border-emerald-500/20 text-zinc-300' 
                      : isCurrent 
                        ? 'bg-primary/15 border-primary/40 text-white shadow-sm'
                        : 'bg-[#0f121a] border-white/5 text-zinc-500 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-zinc-600 flex items-center justify-center text-[9px]">
                        {stage.id}
                      </span>
                    )}
                    <div>
                      <p className="text-xs font-semibold">{stage.name}</p>
                      <p className="text-[10px] text-zinc-400">{stage.desc}</p>
                    </div>
                  </div>
                  {isDone && <span className="text-[10px] font-mono text-emerald-400 font-semibold">Done</span>}
                  {isCurrent && <span className="text-[10px] font-mono text-primary-light font-semibold animate-pulse">Running...</span>}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Results View */
        completedScan && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`p-5 rounded-2xl border flex items-center justify-between ${
              completedScan.status === 'BLOCKED'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}>
              <div className="flex items-center gap-3.5">
                {completedScan.status === 'BLOCKED' ? (
                  <ShieldAlert className="w-8 h-8 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white">
                      {completedScan.status === 'BLOCKED' ? 'SCAN BLOCKED (HIGH CONFIDENCE FINDINGS)' : 'SCAN PASSED (CLEAN PIPELINE)'}
                    </h4>
                    <Badge variant="status" value={completedScan.status} />
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Enforcement threshold: Definite resource leaks block CI/CD.
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-card-elevated border border-white/5 text-center">
                <p className="text-[11px] text-zinc-400 uppercase font-semibold">Files Scanned</p>
                <p className="text-xl font-bold text-white mt-1">{completedScan.summary.files_scanned}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-card-elevated border border-white/5 text-center">
                <p className="text-[11px] text-zinc-400 uppercase font-semibold">Resources</p>
                <p className="text-xl font-bold text-white mt-1">{completedScan.summary.resources_detected}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-card-elevated border border-white/5 text-center">
                <p className="text-[11px] text-rose-400 uppercase font-semibold">Definite Leaks</p>
                <p className="text-xl font-bold text-rose-400 mt-1">{completedScan.summary.definite_leaks}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-card-elevated border border-white/5 text-center">
                <p className="text-[11px] text-emerald-400 uppercase font-semibold">Safe Patterns</p>
                <p className="text-xl font-bold text-emerald-400 mt-1">{completedScan.summary.safe_patterns}</p>
              </div>
            </div>

            {/* Finding highlights */}
            {completedScan.findings.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Detected Leaks ({completedScan.findings.length})
                </h5>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {completedScan.findings.map((f) => (
                    <div 
                      key={f.id}
                      className="p-3 rounded-xl bg-[#131722] border border-white/5 flex items-center justify-between hover:border-primary/30 transition-all cursor-pointer"
                      onClick={() => {
                        onClose();
                        if (onViewFinding) onViewFinding(f.id);
                      }}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-rose-400">{f.file}:{f.line}</span>
                          <span className="text-xs text-zinc-300">({f.resource_type})</span>
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-1">{f.reason}</p>
                      </div>
                      <Button variant="ghost" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Inspect
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-white/5">
              <span className="text-xs text-zinc-500 font-mono">Scan ID: {completedScan.id}</span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
                <Button 
                  size="sm" 
                  onClick={() => {
                    onClose();
                  }}
                >
                  View Dashboard
                </Button>
              </div>
            </div>
          </div>
        )
      )}
    </Modal>
  );
};
