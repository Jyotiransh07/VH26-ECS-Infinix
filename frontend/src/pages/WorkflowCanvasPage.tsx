import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  Layers, 
  FolderGit2, 
  FileCode, 
  Activity, 
  Cpu, 
  Terminal, 
  Search, 
  Send, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Github, 
  Workflow, 
  GitCommit, 
  GitBranch,
  Check,
  ChevronRight,
  Sliders
} from '@/components/icons';
import { ScanResult, IssueFinding } from '../types';
import { api } from '../services/api';

interface WorkflowCanvasPageProps {
  onNavigateToFinding?: (findingId: string) => void;
  onTriggerScan?: () => void;
}

export const WorkflowCanvasPage: React.FC<WorkflowCanvasPageProps> = ({
  onNavigateToFinding,
  onTriggerScan
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeNode, setActiveNode] = useState<string>('decision');
  const [isRunningTrace, setIsRunningTrace] = useState<boolean>(false);
  const [traceStep, setTraceStep] = useState<number>(3);
  const [aiQuery, setAiQuery] = useState<string>('');
  const [aiChat, setAiChat] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([
    {
      role: 'ai',
      text: 'Analysis workflow active! 4 definite resource leaks identified across early return paths in sample-repo-python.'
    }
  ]);

  const handleSendAi = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiQuery.trim()) return;

    const userText = aiQuery;
    setAiChat(prev => [...prev, { role: 'user', text: userText }]);
    setAiQuery('');

    setTimeout(() => {
      let reply = "LeakGuard AST & CFG Engine evaluated all branching paths. In `early_return.py`, `open()` allocates file descriptor on line 2, but `if not is_valid: return None` exits without calling `.close()`.";
      if (userText.toLowerCase().includes('fix') || userText.toLowerCase().includes('remediat')) {
        reply = "Recommended Fix: Wrap the allocation inside `with open(...) as f:` to guarantee deterministic cleanup on all return paths.";
      } else if (userText.toLowerCase().includes('socket')) {
        reply = "The Socket Analyzer detected `socket.socket()` on line 4 without a `finally: s.close()` safeguard block.";
      }
      setAiChat(prev => [...prev, { role: 'ai', text: reply }]);
    }, 600);
  };

  const handleSimulateTrace = () => {
    setIsRunningTrace(true);
    setTraceStep(0);
    const interval = setInterval(() => {
      setTraceStep(prev => {
        if (prev >= 4) {
          clearInterval(interval);
          setIsRunningTrace(false);
          return 4;
        }
        return prev + 1;
      });
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-teal-500/15 text-teal-700 dark:text-teal-300">
              ● Live Flow Visualizer
            </span>
            <span className="text-xs text-slate-400">AST & Control Flow Pipeline</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            Static Analysis & Leak Detection Workflow
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize, trace and monitor control flow and AST resource lifecycle in real time.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setZoomLevel(prev => Math.max(70, prev - 10))}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px]">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(130, prev + 10))}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleSimulateTrace}
            disabled={isRunningTrace}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${isRunningTrace ? 'animate-spin' : ''}`} />
            <span>{isRunningTrace ? 'Tracing AST Paths...' : 'Simulate CFG Trace'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid: Canvas (Left) + Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Visual Node Graph Canvas (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Interactive Node Graph Canvas with Dot Grid Background */}
          <div 
            className="relative w-full rounded-2xl bg-[#fafafa] dark:bg-[#090d16] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 overflow-x-auto min-h-[520px] flex items-center justify-center transition-all"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.25) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center'
            }}
          >
            {/* SVG Connecting Bezier Wires */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <linearGradient id="flowGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <linearGradient id="flowGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
                <linearGradient id="flowGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="flowGrad4" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
                <linearGradient id="flowToDecision" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>

              {/* Dynamic Connecting Curved Lines (Bezier) */}
              <path d="M 140 260 C 180 260, 190 100, 240 100" fill="none" stroke="url(#flowGrad1)" strokeWidth="2.5" strokeDasharray={traceStep >= 1 ? "6 6" : "none"} className={traceStep >= 1 ? "animate-pulse" : ""} />
              <path d="M 140 260 C 180 260, 190 190, 240 190" fill="none" stroke="url(#flowGrad2)" strokeWidth="2.5" strokeDasharray={traceStep >= 1 ? "6 6" : "none"} className={traceStep >= 1 ? "animate-pulse" : ""} />
              <path d="M 140 260 C 180 260, 190 310, 240 310" fill="none" stroke="url(#flowGrad3)" strokeWidth="2.5" strokeDasharray={traceStep >= 1 ? "6 6" : "none"} className={traceStep >= 1 ? "animate-pulse" : ""} />
              <path d="M 140 260 C 180 260, 190 400, 240 400" fill="none" stroke="url(#flowGrad4)" strokeWidth="2.5" strokeDasharray={traceStep >= 1 ? "6 6" : "none"} className={traceStep >= 1 ? "animate-pulse" : ""} />

              {/* Converging Lines into AI Decision */}
              <path d="M 400 100 C 440 100, 440 260, 480 260" fill="none" stroke="#10b981" strokeWidth="2" />
              <path d="M 400 190 C 440 190, 440 260, 480 260" fill="none" stroke="#0ea5e9" strokeWidth="2" />
              <path d="M 400 310 C 440 310, 440 260, 480 260" fill="none" stroke="#06b6d4" strokeWidth="2" />
              <path d="M 400 400 C 440 400, 440 260, 480 260" fill="none" stroke="#f59e0b" strokeWidth="2" />

              {/* Decision to Complete Output */}
              <path d="M 590 260 L 630 260" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeDasharray="4 4" />
            </svg>

            {/* Nodes Layout Container */}
            <div className="relative z-10 w-full flex items-center justify-between gap-3 sm:gap-5">
              
              {/* 1. START NODE: Target Repo & Goal */}
              <div 
                onClick={() => setActiveNode('goal')}
                className={`cursor-pointer w-36 sm:w-40 p-4 rounded-2xl bg-white dark:bg-[#131b2e] border ${activeNode === 'goal' ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200 dark:border-slate-700/80'} shadow-md transition-all hover:scale-105`}
              >
                <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-2.5">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Target Goal</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-2">
                  sample-repo-python
                </div>
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Check className="w-3 h-3" />
                  <span>AST Parsed</span>
                </div>
              </div>

              {/* 2. MIDDLE COLUMN: 4 Parallel Detection Agents */}
              <div className="flex flex-col gap-3 w-40 sm:w-48">
                
                {/* Agent 1: File Descriptor */}
                <div 
                  onClick={() => setActiveNode('file')}
                  className={`cursor-pointer p-3 rounded-xl bg-white dark:bg-[#131b2e] border ${activeNode === 'file' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-700/80'} shadow-sm hover:scale-102 transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <FileCode className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">File Descriptor</p>
                        <p className="text-[9px] text-slate-400">open() Lifecycle</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Completed</span>
                    <span className="text-emerald-500 font-bold font-mono">Definite Leak ✓</span>
                  </div>
                </div>

                {/* Agent 2: Socket & Stream */}
                <div 
                  onClick={() => setActiveNode('socket')}
                  className={`cursor-pointer p-3 rounded-xl bg-white dark:bg-[#131b2e] border ${activeNode === 'socket' ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200 dark:border-slate-700/80'} shadow-sm hover:scale-102 transition-all`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">Socket Stream</p>
                      <p className="text-[9px] text-slate-400">socket.socket()</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Processing...</span>
                      <span className="font-mono font-semibold text-sky-500">67%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full" style={{ width: '67%' }} />
                    </div>
                  </div>
                </div>

                {/* Agent 3: Database Connection */}
                <div 
                  onClick={() => setActiveNode('db')}
                  className={`cursor-pointer p-3 rounded-xl bg-white dark:bg-[#131b2e] border ${activeNode === 'db' ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-200 dark:border-slate-700/80'} shadow-sm hover:scale-102 transition-all`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">Database Agent</p>
                      <p className="text-[9px] text-slate-400">sqlite3 / Connection</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Running...</span>
                      <span className="font-mono font-semibold text-cyan-500">78%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: '78%' }} />
                    </div>
                  </div>
                </div>

                {/* Agent 4: Lock & Threading */}
                <div 
                  onClick={() => setActiveNode('lock')}
                  className={`cursor-pointer p-3 rounded-xl bg-white dark:bg-[#131b2e] border ${activeNode === 'lock' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 dark:border-slate-700/80'} shadow-sm hover:scale-102 transition-all`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">Lock & Sync</p>
                      <p className="text-[9px] text-slate-400">threading.Lock()</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Running...</span>
                      <span className="font-mono font-semibold text-amber-500">62%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '62%' }} />
                    </div>
                  </div>
                </div>

              </div>

              {/* 3. DECISION ENGINE NODE: CFG Path Synthesis */}
              <div 
                onClick={() => setActiveNode('decision')}
                className={`cursor-pointer w-36 sm:w-40 p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 dark:from-purple-950/30 dark:to-indigo-950/30 bg-white dark:bg-[#131b2e] border ${activeNode === 'decision' ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-purple-300 dark:border-purple-800'} shadow-md hover:scale-105 transition-all`}
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">CFG Engine</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
                  Branch & Path Evaluation
                </div>
                <div className="mt-2 text-[10px] font-medium text-slate-400">
                  4 bypass paths found
                </div>
              </div>

              {/* 4. FINAL OUTPUT NODE: Scan Complete / Verdict */}
              <div 
                onClick={() => setActiveNode('complete')}
                className={`cursor-pointer w-32 sm:w-36 p-4 rounded-2xl bg-white dark:bg-[#131b2e] border ${activeNode === 'complete' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-emerald-200 dark:border-emerald-800/80'} shadow-md hover:scale-105 transition-all text-center`}
              >
                <div className="w-9 h-9 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center mb-2 shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Scan Complete
                </div>
                <div className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  POLICY: BLOCKED
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Execution Timeline (Matching user image stepper) */}
          <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Execution Timeline & Stage Progression
            </h3>

            <div className="relative flex items-center justify-between">
              {/* Background Connecting Bar */}
              <div className="absolute left-0 right-0 top-3.5 h-1 bg-slate-100 dark:bg-slate-800 -z-0" />
              <div className="absolute left-0 top-3.5 h-1 bg-teal-500 transition-all duration-500 -z-0" style={{ width: `${(traceStep / 4) * 100}%` }} />

              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${traceStep >= 0 ? 'bg-teal-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  1
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white mt-2">Scan Started</span>
                <span className="text-[10px] text-slate-400">10:00 AM</span>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${traceStep >= 1 ? 'bg-teal-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  2
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white mt-2">AST Built</span>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">Completed</span>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${traceStep >= 2 ? 'bg-teal-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  3
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white mt-2">CFG Traversal</span>
                <span className="text-[10px] text-sky-500 font-semibold">In Progress...</span>
              </div>

              {/* Step 4 */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${traceStep >= 3 ? 'bg-teal-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  4
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white mt-2">Decision Synthesis</span>
                <span className="text-[10px] text-slate-400">Pending</span>
              </div>

              {/* Step 5 */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${traceStep >= 4 ? 'bg-teal-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  5
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white mt-2">Enforcement</span>
                <span className="text-[10px] text-slate-400">ETA 2ms</span>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Mission Details & AI Assistant (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Mission Details */}
          <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mission Details</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400">
                CRITICAL
              </span>
            </div>

            <div>
              <p className="text-xs text-slate-400">Mission Target</p>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                Detect Descriptors in sample-repo-python
              </h4>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-500">Pipeline Execution</span>
                <span className="text-teal-600 dark:text-teal-400 font-mono font-bold">68%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full transition-all duration-300" style={{ width: '68%' }} />
              </div>
            </div>

            {/* Started & ETA Info */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-medium">Started</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">Just Now</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-medium">ETA</span>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 font-mono">142 ms</span>
              </div>
            </div>
          </div>

          {/* Card 2: Connected Ecosystem / Apps */}
          <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Connected Apps & CI Hooks
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs" title="GitHub">
                <Github className="w-4 h-4" />
              </div>
              <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-xs" title="GitHub Actions">
                <Workflow className="w-4 h-4" />
              </div>
              <div className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-xs" title="Pre-Commit Git Hook">
                <GitCommit className="w-4 h-4" />
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs" title="Supabase Database">
                <Layers className="w-4 h-4" />
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700">
                +4
              </div>
            </div>
          </div>

          {/* Card 3: Interactive AI Assistant (like in user screenshot) */}
          <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">AI Security Co-Pilot</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            {/* Chat Bubble History */}
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {aiChat.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'ai'
                      ? 'bg-gradient-to-r from-teal-500/10 to-indigo-500/10 dark:from-teal-950/30 dark:to-indigo-950/30 border border-teal-500/20 text-slate-800 dark:text-slate-200'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-right'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input Prompt Box */}
            <form onSubmit={handleSendAi} className="relative mt-2">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask AI about this workflow..."
                className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 p-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors cursor-pointer"
                title="Send query"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
