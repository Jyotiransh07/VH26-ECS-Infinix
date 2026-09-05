import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Terminal, 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  FileCode, 
  GitFork, 
  Layers, 
  Cpu, 
  Sparkles, 
  Github, 
  Download,
  AlertTriangle,
  Clock,
  Activity
} from '@/components/icons';

interface LandingPageProps {
  onLaunchDashboard: () => void;
  onTriggerScan: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchDashboard, onTriggerScan }) => {
  const [selectedStage, setSelectedStage] = useState<number>(1);

  const pipelineStages = [
    {
      id: 1,
      title: 'Python Code',
      subtitle: 'Source Ingestion',
      icon: FileCode,
      tag: 'INPUT',
      description: 'Raw Python source files with file descriptors, database connections, and network sockets are fed to the engine.',
      snippet: `def process_records(filename):\n    f = open(filename, 'r') # Resource Acquired\n    data = f.readline()\n    if not data:\n        return None         # Early return leaks 'f'!\n    f.close()\n    return data`
    },
    {
      id: 2,
      title: 'Static Analysis',
      subtitle: 'Non-Executing',
      icon: Terminal,
      tag: 'SECURITY',
      description: 'The engine inspects source code without executing it, avoiding security risks while analyzing 100% of execution paths.',
      snippet: `$ python -m leakguard.cli scan sample-repo-python --format json\n[*] Scanning directory: sample-repo-python\n[*] Discovered 6 Python source modules\n[*] Static inspection initialized`
    },
    {
      id: 3,
      title: 'AST Parsing',
      subtitle: 'Abstract Syntax Tree',
      icon: Layers,
      tag: 'PARSER',
      description: 'Python parser builds the native Abstract Syntax Tree (ast.Module) to detect resource acquisition nodes.',
      snippet: `Module(\n  body=[\n    FunctionDef(name='process_records',\n      body=[\n        Assign(targets=[Name(id='f')], value=Call(func=Name(id='open'))),\n        If(test=UnaryOp(op=Not(), operand=Name(id='data')),\n           body=[Return(value=Constant(value=None))])\n      ])\n  ])`
    },
    {
      id: 4,
      title: 'CFG Generation',
      subtitle: 'Control Flow Graph',
      icon: GitFork,
      tag: 'GRAPH',
      description: 'Transforms the AST into a directed Control Flow Graph with statement nodes, conditional branches, and function exit points.',
      snippet: `NODE 0: [Acquisition] f = open(filename, 'r') -> NEXT: [NODE 1]\nNODE 1: [Statement]   data = f.readline()     -> NEXT: [NODE 2]\nNODE 2: [Branch]      if not data             -> NEXT: [NODE 3, NODE 4]\nNODE 3: [Return]      return None             -> NEXT: [NODE 5 (EXIT)]\nNODE 4: [Cleanup]     f.close()               -> NEXT: [NODE 5 (EXIT)]`
    },
    {
      id: 5,
      title: 'Path Analysis',
      subtitle: 'BFS Reachability',
      icon: Activity,
      tag: 'ALGORITHM',
      description: 'Breadth-First Search (BFS) explores all possible control-flow execution paths from acquisition to function termination.',
      snippet: `PATH 1: Node 0 -> Node 1 -> Node 2 -> Node 4 -> Node 5 (Safe: f.close() called)\nPATH 2: Node 0 -> Node 1 -> Node 2 -> Node 3 -> Node 5 (LEAK: Exit without cleanup!)`
    },
    {
      id: 6,
      title: 'Leak Detection',
      subtitle: 'Decision Engine',
      icon: AlertTriangle,
      tag: 'DIAGNOSTIC',
      description: 'Flags unclosed resource descriptors with mathematical certainty (Confidence: DEFINITE, Severity: HIGH).',
      snippet: `{\n  "file": "early_return.py",\n  "line": 2,\n  "resource_type": "file",\n  "variable_name": "f",\n  "severity": "HIGH",\n  "confidence": "DEFINITE",\n  "reason": "Early return or branch bypasses resource cleanup."\n}`
    },
    {
      id: 7,
      title: 'Dashboard Triage',
      subtitle: 'Visual Platform',
      icon: ShieldAlert,
      tag: 'DEVOPS',
      description: 'Real-time DevSecOps dashboard renders Monaco editor line markers, leaking path diagrams, and team assignments.',
      snippet: `RESOURCE ACQUIRED (Line 2)\n      ↓\nBRANCH EVALUATION (Line 4)\n      ↓\nEARLY RETURN EXIT (Line 5) [NO CLEANUP PERFORMED]`
    },
    {
      id: 8,
      title: 'One-Click Fix',
      subtitle: 'Remediation',
      icon: Sparkles,
      tag: 'PATCH',
      description: 'Suggests Pythonic context managers (with statements) to guarantee cleanup on all exits and exceptions.',
      snippet: `def process_records(filename):\n    with open(filename, 'r') as f: # Automatically managed\n        data = f.readline()\n        if not data:\n            return None\n        return data`
    },
    {
      id: 9,
      title: 'Verification',
      subtitle: 'CI Gate Quality',
      icon: CheckCircle2,
      tag: 'VERIFIED',
      description: 'Rescans the AST/CFG to verify 0 leaking paths, passing the GitHub Action and unblocking deployment.',
      snippet: `[✔] PASS: All control-flow paths verified safe.\n[✔] 0 Resource Leaks detected.\n[✔] GitHub CI Check Passed: Ready for Production Merge.`
    }
  ];

  const currentStage = pipelineStages.find(s => s.id === selectedStage) || pipelineStages[0];

  return (
    <div className="space-y-16 animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950/50 to-slate-900 border border-purple-500/20 p-8 sm:p-12 md:p-16 text-center space-y-6 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          STATIC ANALYSIS PLATFORM FOR PYTHON RESOURCE LEAKS
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
          LEAKGUARD
        </h1>

        <p className="text-xl sm:text-2xl font-medium text-purple-200/90 max-w-2xl mx-auto italic font-serif">
          "Find the leak before production does."
        </p>

        <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Zero false-positive static analysis that builds native <strong>Abstract Syntax Trees (AST)</strong> and <strong>Control Flow Graphs (CFG)</strong> to detect unclosed file descriptors, database connections, and socket leaks before they crash your production servers.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={onLaunchDashboard}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all shadow-glow hover:scale-105"
          >
            <Activity className="w-4 h-4" />
            Launch Live Dashboard
          </button>
          <button
            onClick={onTriggerScan}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all hover:scale-105"
          >
            <Play className="w-4 h-4 text-emerald-400" />
            Run AST Scanner
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/10 max-w-3xl mx-auto text-left">
          <div>
            <div className="text-2xl font-extrabold text-white">100%</div>
            <div className="text-xs text-slate-400">Deterministic Path Analysis</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-teal-400">&lt; 30ms</div>
            <div className="text-xs text-slate-400">AST Parse & BFS Speed</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-indigo-400">0 Exec</div>
            <div className="text-xs text-slate-400">Safe Static Analysis</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-purple-400">SARIF</div>
            <div className="text-xs text-slate-400">OASIS v2.1.0 Standard</div>
          </div>
        </div>
      </div>

      {/* 9-Stage Engine Pipeline Interactive Walkthrough */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            How LeakGuard Engine Works
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Step through the 9-stage analysis pipeline executed on every commit, PR, and baseline check.
          </p>
        </div>

        {/* 9 Stages Interactive Step Pills */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
          {pipelineStages.map((stage) => {
            const Icon = stage.icon;
            const isSelected = selectedStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(stage.id)}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between min-h-[90px] ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-400/30 scale-105'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-400/50'
                }`}
              >
                <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-purple-200' : 'text-slate-400'}`}>
                  0{stage.id}
                </span>
                <Icon className={`w-5 h-5 my-1 ${isSelected ? 'text-white' : 'text-purple-500'}`} />
                <span className="text-[11px] font-bold leading-tight truncate w-full">{stage.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detailed Breakdown & Code Inspection */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <currentStage.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Stage {currentStage.id}: {currentStage.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    {currentStage.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{currentStage.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={selectedStage === 1}
                onClick={() => setSelectedStage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40"
              >
                Previous Stage
              </button>
              <button
                disabled={selectedStage === 9}
                onClick={() => setSelectedStage(prev => Math.min(9, prev + 1))}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold disabled:opacity-40"
              >
                Next Stage →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Engine Behavior & Logic</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentStage.description}
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-500" />
                  Existing LeakGuard Invariant:
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  The static analysis core executes strictly within Python 3.12 without spawning arbitrary code, executing network calls, or modifying developer repositories.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Payload / Code Artifact</span>
                <span>Python 3.12 AST</span>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
                {currentStage.snippet}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="p-2.5 w-fit rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-500">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Differential Baselines</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Lock in accepted technical debt with release snapshots. CI PR gates fail only when new resource regressions are introduced.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="p-2.5 w-fit rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Tenant-Isolated RLS</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Supabase Row-Level Security ensures that Developer A cannot view Developer B's private findings or repository metrics.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="p-2.5 w-fit rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-500">
            <Github className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">OASIS SARIF Standard</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Exports machine-readable OASIS SARIF v2.1.0 for direct integration into GitHub Code Scanning and security alerts.
          </p>
        </div>
      </div>
    </div>
  );
};
