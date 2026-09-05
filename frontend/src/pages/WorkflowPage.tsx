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
  ZoomIn, 
  ZoomOut, 
  Github, 
  Workflow as WorkflowIcon, 
  GitCommit, 
  Check
} from '@/components/icons';

interface WorkflowPageProps {
  onTriggerScan?: () => void;
}

export const WorkflowPage: React.FC<WorkflowPageProps> = ({ onTriggerScan }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeNode, setActiveNode] = useState<string>('decision');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [timelineStep, setTimelineStep] = useState<number>(2);
  const [aiQuery, setAiQuery] = useState<string>('');
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([
    {
      role: 'ai',
      text: 'Your analysis mission is on track! 4 key resource leak insights are ready for review.'
    }
  ]);

  const handleSendAi = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiQuery.trim()) return;

    const query = aiQuery;
    setAiMessages(prev => [...prev, { role: 'user', text: query }]);
    setAiQuery('');

    setTimeout(() => {
      let reply = 'The AST & CFG engine traversed 4 execution paths in sample-repo-python and identified that early_return.py bypasses f.close() on line 5.';
      if (query.toLowerCase().includes('fix') || query.toLowerCase().includes('help')) {
        reply = 'Recommended Remediation: Use `with open(...) as f:` to ensure file handles are automatically closed on return or exception.';
      } else if (query.toLowerCase().includes('socket')) {
        reply = 'The Socket Stream Analyzer found socket allocation without a try-finally or context manager.';
      }
      setAiMessages(prev => [...prev, { role: 'ai', text: reply }]);
    }, 500);
  };

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimelineStep(0);
    const interval = setInterval(() => {
      setTimelineStep(prev => {
        if (prev >= 4) {
          clearInterval(interval);
          setIsSimulating(false);
          return 4;
        }
        return prev + 1;
      });
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Header & Zoom Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Mission Workflow
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize, build and monitor autonomous static analysis leak detection workflow.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Bar */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#0d1117] px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 shadow-2xs">
            <button
              onClick={() => setZoomLevel(prev => Math.max(70, prev - 10))}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] font-medium">Zoom {zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(130, prev + 10))}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-600 hover:bg-teal-500 text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Tracing...' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout: 12-Column Grid matching the inspiration image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Visual Canvas & Execution Timeline (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Interactive Dot-Grid Workflow Canvas */}
          <div 
            className="relative w-full rounded-2xl bg-[#fafafa] dark:bg-[#090d16] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 min-h-[480px] flex items-center justify-center overflow-x-auto select-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.3) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center'
            }}
          >
            {/* SVG Connecting Bezier Wires */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <linearGradient id="splineFile" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
                <linearGradient id="splineSocket" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="splineDb" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="splineLock" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
                <linearGradient id="splineDecision" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>

              {/* Fanning out from Goal Node (x:130, y:240) to 4 Agents (x:240, y:80, 160, 260, 360) */}
              <path d="M 140 240 C 180 240, 190 90, 240 90" fill="none" stroke="url(#splineFile)" strokeWidth="2.5" strokeDasharray={timelineStep >= 1 ? "5 5" : "none"} className={timelineStep >= 1 ? "animate-pulse" : ""} />
              <path d="M 140 240 C 180 240, 190 170, 240 170" fill="none" stroke="url(#splineSocket)" strokeWidth="2.5" strokeDasharray={timelineStep >= 1 ? "5 5" : "none"} className={timelineStep >= 1 ? "animate-pulse" : ""} />
              <path d="M 140 240 C 180 240, 190 270, 240 270" fill="none" stroke="url(#splineDb)" strokeWidth="2.5" strokeDasharray={timelineStep >= 1 ? "5 5" : "none"} className={timelineStep >= 1 ? "animate-pulse" : ""} />
              <path d="M 140 240 C 180 240, 190 370, 240 370" fill="none" stroke="url(#splineLock)" strokeWidth="2.5" strokeDasharray={timelineStep >= 1 ? "5 5" : "none"} className={timelineStep >= 1 ? "animate-pulse" : ""} />

              {/* Converging into AI Decision Node (x:480, y:240) */}
              <path d="M 400 90 C 440 90, 440 240, 470 240" fill="none" stroke="#22c55e" strokeWidth="2" />
              <path d="M 400 170 C 440 170, 440 240, 470 240" fill="none" stroke="#3b82f6" strokeWidth="2" />
              <path d="M 400 270 C 440 270, 440 240, 470 240" fill="none" stroke="#06b6d4" strokeWidth="2" />
              <path d="M 400 370 C 440 370, 440 240, 470 240" fill="none" stroke="#f59e0b" strokeWidth="2" />

              {/* Decision Node to Mission Complete */}
              <path d="M 580 240 L 620 240" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeDasharray="4 4" />
            </svg>

            {/* Nodes Container */}
            <div className="relative z-10 w-full flex items-center justify-between gap-3 sm:gap-6">
              
              {/* Node 1: Goal Target */}
              <div
                onClick={() => setActiveNode('goal')}
                className={`cursor-pointer w-36 sm:w-40 p-4 rounded-xl bg-white dark:bg-[#121826] border transition-all hover:scale-102 shadow-xs ${
                  activeNode === 'goal' 
                    ? 'border-sky-500 ring-2 ring-sky-500/20' 
                    : 'border-slate-200 dark:border-slate-700/80'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-2">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Goal</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
                  sample-repo-python
                </div>
              </div>

              {/* Node Column 2: 4 Parallel Detection Agents */}
              <div className="flex flex-col gap-2.5 w-44 sm:w-52">
                
                {/* Agent 1: Research / File Agent (Green) */}
                <div
                  onClick={() => setActiveNode('file')}
                  className={`cursor-pointer p-3 rounded-xl bg-white dark:bg-[#121826] border transition-all hover:scale-102 shadow-xs ${
                    activeNode === 'file'
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <FileCode className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-900 dark:text-white leading-none">Research Agent</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">Market Intelligence</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Completed</span>
                    <span className="text-emerald-500 font-bold">Confident ✓</span>
                  </div>
                </div>

                {/* Agent 2: Data Analysis (Blue) */}
                <div
                  onClick={() => setActiveNode('socket')}
                  className={`cursor-pointer p-3 rounded-xl bg-white dark:bg-[#121826] border transition-all hover:scale-102 shadow-xs ${
                    activeNode === 'socket'
                      ? 'border-sky-500 ring-2 ring-sky-500/20'
                      : 'border-slate-200 dark:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-900 dark:text-white leading-none">Data Analysis</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">Trend & Forecast</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                      <span>Processing...</span>
                      <span className="font-mono font-bold text-sky-500">67%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full" style={{ width: '67%' }} />
                    </div>
                  </div>
                </div>

                {/* Agent 3: Sales Agent (Cyan) */}
                <div
                  onClick={() => setActiveNode('db')}
                  className={`cursor-pointer p-3 rounded-xl bg-white dark:bg-[#121826] border transition-all hover:scale-102 shadow-xs ${
                    activeNode === 'db'
                      ? 'border-cyan-500 ring-2 ring-cyan-500/20'
                      : 'border-slate-200 dark:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-900 dark:text-white leading-none">Sales Agent</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">Lead Generation</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                      <span>Running...</span>
                      <span className="font-mono font-bold text-cyan-500">78%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: '78%' }} />
                    </div>
                  </div>
                </div>

                {/* Agent 4: Marketing Agent (Amber) */}
                <div
                  onClick={() => setActiveNode('lock')}
                  className={`cursor-pointer p-3 rounded-xl bg-white dark:bg-[#121826] border transition-all hover:scale-102 shadow-xs ${
                    activeNode === 'lock'
                      ? 'border-amber-500 ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-900 dark:text-white leading-none">Marketing Agent</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">Campaign Optimization</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                      <span>Running...</span>
                      <span className="font-mono font-bold text-amber-500">62%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '62%' }} />
                    </div>
                  </div>
                </div>

              </div>

              {/* Node 3: AI Decision & Strategy (Purple) */}
              <div
                onClick={() => setActiveNode('decision')}
                className={`cursor-pointer w-36 sm:w-40 p-4 rounded-xl bg-white dark:bg-[#121826] border transition-all hover:scale-102 shadow-xs ${
                  activeNode === 'decision'
                    ? 'border-purple-500 ring-2 ring-purple-500/20'
                    : 'border-purple-200 dark:border-purple-900/60'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  AI Decision & Strategy
                </div>
              </div>

              {/* Node 4: Mission Complete (Green) */}
              <div
                onClick={() => setActiveNode('complete')}
                className={`cursor-pointer w-32 sm:w-36 p-4 rounded-xl bg-white dark:bg-[#121826] border transition-all hover:scale-102 shadow-xs text-center ${
                  activeNode === 'complete'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-emerald-200 dark:border-emerald-900/60'
                }`}
              >
                <div className="w-8 h-8 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center mb-2 shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Mission Complete
                </div>
              </div>

            </div>
          </div>

          {/* Execution Timeline (Bottom Stepper) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Execution Timeline
            </h3>

            <div className="relative flex items-center justify-between">
              {/* Track Bar */}
              <div className="absolute left-0 right-0 top-3.5 h-1 bg-slate-100 dark:bg-slate-800 -z-0" />
              <div 
                className="absolute left-0 top-3.5 h-1 bg-teal-500 transition-all duration-500 -z-0" 
                style={{ width: `${(timelineStep / 4) * 100}%` }} 
              />

              {/* Stepper items */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${timelineStep >= 0 ? 'bg-teal-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  1
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white mt-2">Mission Started</span>
                <span className="text-[10px] text-slate-400">10:00 AM</span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${timelineStep >= 1 ? 'bg-teal-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  2
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white mt-2">Research Completed</span>
                <span className="text-[10px] text-slate-400">11:20 AM</span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${timelineStep >= 2 ? 'bg-teal-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  3
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white mt-2">Data Analysis</span>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">In Progress...</span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${timelineStep >= 3 ? 'bg-teal-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  4
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white mt-2">Strategy</span>
                <span className="text-[10px] text-slate-400">Pending</span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${timelineStep >= 4 ? 'bg-teal-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  5
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white mt-2">Mission Completion</span>
                <span className="text-[10px] text-slate-400">ETA 2 days</span>
              </div>

            </div>
          </div>

        </div>

        {/* Right: Mission Details & AI Assistant Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Mission Details Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mission Details</span>
              <span className="text-[10px] font-bold font-mono text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                High
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Mission</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                Grow EU Sales Revenue
              </h4>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">Progress</span>
                <span className="text-teal-600 dark:text-teal-400 font-mono font-bold">68%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: '68%' }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-medium">Started</span>
                <span className="text-xs font-semibold text-slate-900 dark:text-white font-mono">May 24, 2026</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-medium">ETA</span>
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 font-mono">2 days left</span>
              </div>
            </div>
          </div>

          {/* Connected Apps Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Connected Apps
            </span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs" title="HubSpot">
                H
              </div>
              <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs" title="Google Workspace">
                G
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs" title="Notion">
                N
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs" title="Slack">
                S
              </div>
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs" title="Discord">
                D
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700">
                +4
              </div>
            </div>
          </div>

          {/* AI Assistant Card (Matching image bottom-right) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">AI Assistant</span>
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            </div>

            {/* Bubble */}
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-slate-800 dark:text-slate-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Your mission is on track!</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                3 key insights are ready to review.
              </p>
            </div>

            {/* Chat list */}
            {aiMessages.length > 1 && (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {aiMessages.slice(1).map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                      m.role === 'ai'
                        ? 'bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60'
                        : 'bg-teal-500/10 text-teal-900 dark:text-teal-200 text-right'
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
              </div>
            )}

            {/* Input prompt */}
            <form onSubmit={handleSendAi} className="relative mt-2">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask AI anything..."
                className="w-full pl-3 pr-10 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer"
                title="Send"
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
