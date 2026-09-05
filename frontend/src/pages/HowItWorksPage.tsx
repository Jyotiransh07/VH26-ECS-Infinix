import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileCode,
  Workflow,
  Terminal,
  Activity,
  AlertTriangle,
  GitCommit,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ChevronRight,
  Info,
  Sparkles,
  Search,
  Cpu,
  Layers,
  ExternalLink,
  Code2,
  Zap,
  BookOpenCheck
} from '@/components/icons';

interface HowItWorksPageProps {
  onTriggerScan?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  onTriggerScan,
  onNavigateTab
}) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<string>('intro');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const navItems = [
    { id: 'intro', label: 'What is LeakGuard?' },
    { id: 'core-idea', label: 'Core Pipeline' },
    { id: 'step-source', label: '01 — Python Source' },
    { id: 'step-ast', label: '02 — AST Analysis' },
    { id: 'step-resource', label: '03 — Resource Detection' },
    { id: 'step-cleanup', label: '04 — Cleanup Detection' },
    { id: 'step-control-flow', label: '05 — Control Flow' },
    { id: 'step-path-analysis', label: '06 — Path Analysis' },
    { id: 'safe-vs-unsafe', label: '07 — Safe vs Leaking' },
    { id: 'step-finding', label: '08 — Finding Generation' },
    { id: 'step-output', label: '09 — Output Formats' },
    { id: 'step-actions', label: '10 — GitHub Actions' },
    { id: 'step-precommit', label: '11 — Pre-commit' },
    { id: 'step-dashboard', label: '12 — Dashboard Integration' },
    { id: 'complete-flow', label: 'Complete Architecture' },
    { id: 'limitations', label: 'Know the Boundaries' },
    { id: 'quickstart', label: 'Quick Start' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      for (let i = navItems.length - 1; i >= 0; i--) {
        const el = document.getElementById(navItems[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const pipelineStages = [
    {
      title: 'Python Source',
      tag: 'INPUT',
      desc: 'Raw Python source files parsed statically without runtime code execution.',
      detail: 'LeakGuard reads raw .py files, extracting tokens without invoking bytecode interpreter or importing third-party libraries.'
    },
    {
      title: 'AST Analysis',
      tag: 'STRUCTURE',
      desc: "Standard Python ast module creates an Abstract Syntax Tree of functions and blocks.",
      detail: 'Traverses FunctionDef, Assign, Call, If, Return, and With nodes to establish a pure syntactic tree of program statements.'
    },
    {
      title: 'Resource Detection',
      tag: 'DETECTION',
      desc: 'Matches open(), socket.socket(), sqlite3.connect() against rules/resources.yaml.',
      detail: 'Binds variable identifiers (e.g., f, sock, conn) to their declared resource class and tracks origin line coordinates.'
    },
    {
      title: 'Cleanup Detection',
      tag: 'LIFECYCLE',
      desc: 'Identifies f.close() calls and deterministic with statements in the AST.',
      detail: 'Verifies explicit cleanup methods and checks if context managers automatically wrap the resource lifecycle.'
    },
    {
      title: 'Control Flow Analysis',
      tag: 'CFG GRAPH',
      desc: 'Constructs basic blocks with branching edges (if/else, early returns, exceptions).',
      detail: 'Maps every statement to graph nodes and creates directed edges representing all possible runtime branching paths.'
    },
    {
      title: 'Path Analysis',
      tag: 'TRAVERSAL',
      desc: 'BFS / DFS path traversal discovers unclosed exit paths and deadlocks.',
      detail: 'Traces execution from resource acquisition to all function exit nodes. If any path exits without cleanup, a leak is flagged.'
    },
    {
      title: 'Finding Generation',
      tag: 'SCORING',
      desc: 'Computes severity, DEFINITE/LIKELY confidence score, and exact leaking path.',
      detail: 'Formats structured finding objects with file, line, resource, path (e.g. 4 → 5 → EXIT), and context-manager remediation advice.'
    },
    {
      title: 'Developer Feedback',
      tag: 'OUTPUT',
      desc: 'Emits JSON, SARIF, Terminal reports, and synchronizes with Dashboard & CI.',
      detail: 'Integrates natively into GitHub Actions PR annotations, pre-commit git hooks, and the LeakGuard interactive UI.'
    }
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Sticky Top Header Banner */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              STATIC ANALYSIS ENGINE
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              How LeakGuard Works
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Understand how LeakGuard analyzes Python resource lifecycles without executing your application.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onTriggerScan && (
              <button
                onClick={onTriggerScan}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                Run Live Scan
              </button>
            )}
            <a
              href="#quickstart"
              onClick={(e) => { e.preventDefault(); scrollToSection('quickstart'); }}
              className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              CLI Quick Start
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Main Content Sections (3 cols on desktop) */}
        <div className="lg:col-span-3 space-y-12 min-w-0">

          {/* SECTION 1: WHAT IS LEAKGUARD? */}
          <section id="intro" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-teal-600 dark:text-teal-400 tracking-wider">
              <span>SECTION 01</span>
              <span>•</span>
              <span>FOUNDATION</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              What is LeakGuard?
            </h2>

            <div className="p-4 rounded-lg bg-teal-500/5 border border-teal-500/20 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
              <strong className="text-teal-700 dark:text-teal-400">Core Principle: </strong>
              LeakGuard is a static analysis tool designed to detect resource lifecycle problems in Python code before they reach production. It analyzes Python source code <strong>without executing the target application</strong>.
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Python programs commonly acquire operating system and network resources such as:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <div className="font-mono text-xs font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-teal-600" />
                  Files
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <code className="text-teal-600 dark:text-teal-400">open("data.txt")</code> — OS file descriptors and buffers.
                </div>
              </div>
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <div className="font-mono text-xs font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-500" />
                  Network Sockets
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <code className="text-blue-500">socket.socket()</code> — TCP/UDP ports and kernel network sockets.
                </div>
              </div>
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <div className="font-mono text-xs font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-500" />
                  Database Connections
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <code className="text-purple-500">sqlite3.connect()</code> — Transaction locks and memory pools.
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              These resources need to be released correctly. If a resource is acquired but not released on every relevant execution path, the application can eventually experience resource exhaustion.
            </p>

            <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="text-slate-400 text-[11px] uppercase tracking-wider">The Fundamental Question</div>
              <div className="text-slate-300">
                The important question is not simply: <span className="text-rose-400">"Does close() exist?"</span>
              </div>
              <div className="text-teal-300 font-semibold text-sm">
                The critical question is: "Can the program reach an exit path without executing close()?"
              </div>
            </div>
          </section>

          {/* SECTION 2: CORE IDEA PIPELINE */}
          <section id="core-idea" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-teal-600 dark:text-teal-400 tracking-wider">
              <span>SECTION 02</span>
              <span>•</span>
              <span>PIPELINE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              From Source Code to Leak Finding
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              LeakGuard analyzes Python repositories across an 8-stage static pipeline. Click or tap any stage to inspect how the engine evaluates that phase.
            </p>

            {/* Interactive Pipeline Stages Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {pipelineStages.map((stage, idx) => {
                const isSelected = activeStageIndex === idx;
                return (
                  <button
                    key={stage.title}
                    onClick={() => setActiveStageIndex(idx)}
                    className={`p-3 rounded-lg text-left transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 ring-1 ring-teal-500/30'
                        : 'bg-white dark:bg-[#0d1117] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className={`text-[9px] font-mono px-1 rounded ${
                        isSelected ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {stage.tag}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {stage.title}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Stage Detail Card */}
            <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-500/5 dark:bg-teal-950/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400">
                  STAGE {String(activeStageIndex + 1).padStart(2, '0')}: {pipelineStages[activeStageIndex].title}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {pipelineStages[activeStageIndex].desc}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {pipelineStages[activeStageIndex].detail}
              </p>
            </div>
          </section>

          {/* SECTION 3: STEP 1 - PYTHON SOURCE CODE */}
          <section id="step-source" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-teal-600 dark:text-teal-400 tracking-wider">
              <span>STEP 01</span>
              <span>•</span>
              <span>INGESTION</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              01 — Read the Python Source
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              LeakGuard receives a Python file or directory as the scan target. The scanner analyzes the source code statically. It does <strong>NOT</strong> execute the application.
            </p>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-900 overflow-hidden">
              <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>CLI Ingestion Commands</span>
                <button
                  onClick={() => copyToClipboard('leakguard scan demo-project/', 'cmd-scan')}
                  className="flex items-center gap-1 text-slate-400 hover:text-white"
                >
                  {copiedIndex === 'cmd-scan' ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedIndex === 'cmd-scan' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3.5 font-mono text-xs text-teal-300 space-y-1">
                <div>$ leakguard scan demo-project/</div>
                <div className="text-slate-400"># or alternative module execution:</div>
                <div className="text-slate-300">$ python -m leakguard.cli scan demo-project/</div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117] overflow-hidden">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Example Target Function</span>
              </div>
              <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto">
                <div><span className="text-purple-600 dark:text-purple-400">def</span> <span className="text-blue-600 dark:text-blue-400">read_data</span>():</div>
                <div className="pl-4 bg-teal-500/10 -mx-4 px-4 py-0.5 border-l-2 border-teal-500">
                  <span className="text-amber-700 dark:text-amber-400">f</span> = <span className="text-teal-600 dark:text-teal-400 font-bold">open</span>(<span className="text-emerald-600">"data.txt"</span>)  <span className="text-slate-400"># &lt;-- Resource Acquisition</span>
                </div>
                <div className="pl-4 mt-1"><span className="text-purple-600 dark:text-purple-400">if</span> error_happened:</div>
                <div className="pl-8 text-rose-600 dark:text-rose-400"><span className="text-purple-600 dark:text-purple-400">return</span>  <span className="text-slate-400"># &lt;-- Early return bypasses close()</span></div>
                <div className="pl-4 mt-1"><span className="text-blue-600 dark:text-blue-400">print</span>(f.read())</div>
                <div className="pl-4"><span className="text-amber-700 dark:text-amber-400">f</span>.close()</div>
              </div>
            </div>
          </section>

          {/* SECTION 4: STEP 2 - AST ANALYSIS */}
          <section id="step-ast" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-teal-600 dark:text-teal-400 tracking-wider">
              <span>STEP 02</span>
              <span>•</span>
              <span>AST PARSING</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              02 — Parse the Python Code
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              LeakGuard uses Python's AST representation to understand the structure of the source code.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117] text-center">
                <div className="text-xs font-mono text-slate-400 mb-1">Source Code</div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white font-mono">f = open(...)</div>
              </div>
              <div className="p-3.5 rounded-lg border border-teal-500/30 bg-teal-500/5 text-center">
                <div className="text-xs font-mono text-teal-600 dark:text-teal-400 mb-1">Python AST</div>
                <div className="font-semibold text-sm text-teal-700 dark:text-teal-300 font-mono">ast.Assign / Call</div>
              </div>
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117] text-center">
                <div className="text-xs font-mono text-slate-400 mb-1">Structured Nodes</div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white font-mono">AST Program Graph</div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
              <div className="font-semibold text-slate-900 dark:text-white">Constructs Represented in the AST:</div>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                <li><strong>Functions:</strong> Function boundaries, signatures, and local scopes.</li>
                <li><strong>Calls &amp; Assignments:</strong> Target variables and invoked methods.</li>
                <li><strong>If Statements &amp; Loops:</strong> Conditional branch expressions and iteration blocks.</li>
                <li><strong>Return &amp; Raise Statements:</strong> Function exit points and exception control flow.</li>
              </ul>
              <div className="pt-2 text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                Important: The AST itself does not determine whether a resource leaks. The AST provides the structural representation used by later analysis stages.
              </div>
            </div>
          </section>

          {/* SECTION 5: STEP 3 - RESOURCE DETECTION */}
          <section id="step-resource" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-teal-600 dark:text-teal-400 tracking-wider">
              <span>STEP 03</span>
              <span>•</span>
              <span>ACQUISITION RULES</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              03 — Detect Resource Acquisition
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              LeakGuard identifies supported resource acquisition patterns. Current repository documentation states that default tracked resources include:
            </p>

            <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
              <li><strong>Files:</strong> Standard <code className="font-mono">open(...)</code> builtin calls.</li>
              <li><strong>Network sockets:</strong> <code className="font-mono">socket.socket(...)</code> descriptors.</li>
              <li><strong>SQLite3 connections:</strong> <code className="font-mono">sqlite3.connect(...)</code> database handles.</li>
            </ul>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              The exact acquisition patterns are controlled through <code className="font-mono text-teal-600 dark:text-teal-400">leakguard/rules/resources.yaml</code>. This allows resource lifecycle rules to be defined separately from the analysis engine.
            </p>

            <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="font-semibold text-slate-900 dark:text-white">Example Analyzer Record for `f = open("data.txt")`:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-slate-600 dark:text-slate-300">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded">
                  <span className="text-slate-400 block text-[10px]">Resource</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">File</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded">
                  <span className="text-slate-400 block text-[10px]">Variable</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">f</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded">
                  <span className="text-slate-400 block text-[10px]">Acquired</span>
                  <span className="font-bold text-slate-900 dark:text-white">Line containing open(...)</span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 6: STEP 4 - CLEANUP DETECTION */}
          <section id="step-cleanup" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-teal-600 dark:text-teal-400 tracking-wider">
              <span>STEP 04</span>
              <span>•</span>
              <span>CLEANUP DETECTION</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              04 — Detect Resource Cleanup
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              LeakGuard checks whether the acquired resource is properly released via explicit close calls or context managers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117] space-y-2">
                <div className="text-xs font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-blue-500" />
                  Explicit Cleanup Calls
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900 font-mono text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <div>f.close()</div>
                  <div>socket.close()</div>
                  <div>database connection close()</div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Explicit calls require every path to reach the close statement.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-teal-500/30 bg-teal-500/5 dark:bg-teal-950/20 space-y-2">
                <div className="text-xs font-mono font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  Context Manager (with)
                </div>
                <div className="p-2.5 rounded bg-teal-500/10 font-mono text-xs text-teal-900 dark:text-teal-200">
                  with open("data.txt") as f:<br />
                  &nbsp;&nbsp;data = f.read()
                </div>
                <p className="text-[11px] text-teal-700 dark:text-teal-300">
                  A context manager provides deterministic cleanup even when control leaves the block early.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 7: STEP 5 - CONTROL FLOW */}
          <section id="step-control-flow" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-teal-600 dark:text-teal-400 tracking-wider">
              <span>STEP 05</span>
              <span>•</span>
              <span>CONTROL FLOW</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              05 — Understand Possible Execution Paths
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              This is one of the most important concepts: simply finding an acquisition and a cleanup call in the same function is insufficient.
            </p>

            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117] space-y-6">
              <div className="text-center font-mono text-xs font-bold text-slate-900 dark:text-white">
                PATH BRANCHING DIAGRAM
              </div>

              <div className="flex flex-col items-center">
                <div className="px-4 py-2 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-700 dark:text-teal-300 font-mono text-xs font-semibold">
                  Resource acquired
                </div>
                <div className="h-5 w-0.5 bg-slate-300 dark:bg-slate-700" />
                <div className="text-slate-400 text-xs">▼</div>

                <div className="px-5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs font-bold">
                  condition
                </div>

                <div className="grid grid-cols-2 gap-8 sm:gap-20 w-full max-w-md mt-3">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      / false
                    </div>
                    <div className="h-4 w-0.5 bg-emerald-500" />
                    <div className="px-3 py-1.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-xs">
                      close
                    </div>
                    <div className="h-4 w-0.5 bg-emerald-500" />
                    <div className="px-3 py-1 rounded bg-emerald-600 text-white font-mono text-[11px] font-bold">
                      SAFE (PATH A)
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                      \ true
                    </div>
                    <div className="h-4 w-0.5 bg-rose-500" />
                    <div className="px-3 py-1.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 text-rose-700 dark:text-rose-300 font-mono text-xs">
                      return
                    </div>
                    <div className="h-4 w-0.5 bg-rose-500" />
                    <div className="px-3 py-1 rounded bg-rose-600 text-white font-mono text-[11px] font-bold">
                      LEAK (PATH B)
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg text-emerald-800 dark:text-emerald-300">
                  <div className="font-bold mb-1">PATH A: SAFE</div>
                  open → condition false → close → exit
                </div>
                <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-lg text-rose-800 dark:text-rose-300">
                  <div className="font-bold mb-1">PATH B: LEAK</div>
                  open → condition true → return → exit
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 8: STEP 6 - PATH ANALYSIS */}
          <section id="step-path-analysis" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-teal-600 dark:text-teal-400 tracking-wider">
              <span>STEP 06</span>
              <span>•</span>
              <span>PATH ANALYSIS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              06 — Trace the Leaking Path
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              LeakGuard's result identifies the exact path through which the resource can escape without cleanup.
            </p>

            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-rose-700 dark:text-rose-400">
                  CFG Path Sequence: Acquisition → CFG path → Branch → Return / Exit → No cleanup → Finding
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-slate-700 dark:text-slate-300">
                <div className="p-2 bg-white dark:bg-[#0d1117] rounded border border-rose-500/20">
                  <span className="text-slate-400 block text-[10px]">File &amp; Line</span>
                  demo-project/example.py : 2
                </div>
                <div className="p-2 bg-white dark:bg-[#0d1117] rounded border border-rose-500/20">
                  <span className="text-slate-400 block text-[10px]">Resource</span>
                  File 'f'
                </div>
                <div className="p-2 bg-white dark:bg-[#0d1117] rounded border border-rose-500/20">
                  <span className="text-slate-400 block text-[10px]">Leaking Path</span>
                  4 → 5 → EXIT
                </div>
              </div>

              <div className="text-xs text-rose-700 dark:text-rose-300 font-sans leading-relaxed">
                <strong>Reason: </strong> Early return or branch bypasses resource cleanup.
              </div>
            </div>
          </section>

          {/* SECTION 9: SAFE VS UNSAFE CODE */}
          <section id="safe-vs-unsafe" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-teal-600 dark:text-teal-400 tracking-wider">
              <span>SECTION 07</span>
              <span>•</span>
              <span>CODE COMPARISON</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              07 — Safe Code vs Leaking Code
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Unsafe Code */}
              <div className="rounded-xl border border-rose-500/30 bg-white dark:bg-[#0d1117] overflow-hidden">
                <div className="px-4 py-2.5 bg-rose-500/10 border-b border-rose-500/20 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    Unsafe
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold">
                    RESOURCE LEAK
                  </span>
                </div>
                <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto text-slate-800 dark:text-slate-200">
                  <div><span className="text-purple-600 dark:text-purple-400">def</span> <span className="text-blue-600 dark:text-blue-400">read_data</span>():</div>
                  <div className="pl-4 text-amber-700 dark:text-amber-400">f = open("data.txt")</div>
                  <div className="pl-4 text-purple-600 dark:text-purple-400">if error_happened:</div>
                  <div className="pl-8 text-rose-600 dark:text-rose-400 font-bold">return</div>
                  <div className="pl-4">f.close()</div>
                </div>
              </div>

              {/* Safe Code */}
              <div className="rounded-xl border border-emerald-500/30 bg-white dark:bg-[#0d1117] overflow-hidden">
                <div className="px-4 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Safe
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold">
                    SAFE
                  </span>
                </div>
                <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto text-slate-800 dark:text-slate-200">
                  <div><span className="text-purple-600 dark:text-purple-400">def</span> <span className="text-blue-600 dark:text-blue-400">read_data</span>():</div>
                  <div className="pl-4 text-teal-700 dark:text-teal-400 font-bold"><span className="text-purple-600 dark:text-purple-400">with</span> open("data.txt") <span className="text-purple-600 dark:text-purple-400">as</span> f:</div>
                  <div className="pl-8 text-purple-600 dark:text-purple-400">if error_happened:</div>
                  <div className="pl-12 text-emerald-600 dark:text-emerald-400 font-semibold">return</div>
                  <div className="pl-8">print(f.read())</div>
                </div>
                <div className="p-3 bg-emerald-500/5 text-[11px] text-emerald-700 dark:text-emerald-300 border-t border-emerald-500/10">
                  The context manager ensures the file is automatically cleaned up when control leaves the block.
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 10: STEP 8 - FINDING GENERATION */}
          <section id="step-finding" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-teal-600 dark:text-teal-400 tracking-wider">
              <span>STEP 08</span>
              <span>•</span>
              <span>FINDING GENERATION</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              08 — Turn Analysis into a Finding
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              When the analyzer determines that a resource can reach an exit without cleanup, LeakGuard produces a finding matching repository terminology:
            </p>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117] space-y-4 font-mono text-xs">
              <div className="text-rose-600 dark:text-rose-400 font-bold">
                [HIGH] DEFINITE RESOURCE LEAK
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[10px]">File:</span>
                  demo-project/example.py
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Line:</span>
                  2
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Resource:</span>
                  File 'f'
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Leaking path:</span>
                  4 → 5 → EXIT
                </div>
              </div>

              <div className="space-y-1 text-slate-700 dark:text-slate-300">
                <div><strong>Reason: </strong> Early return or branch bypasses resource cleanup.</div>
                <div><strong>Suggestion: </strong> Consider using a context manager.</div>
              </div>
            </div>
          </section>

          {/* SECTION 11: OUTPUT FORMATS */}
          <section id="step-output" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-teal-600 dark:text-teal-400 tracking-wider">
              <span>STEP 09</span>
              <span>•</span>
              <span>OUTPUT FORMATS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              09 — From Engine to Developer
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              LeakGuard supports machine-readable output across Terminal, JSON, and SARIF specifications.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117] space-y-2">
                <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                  Terminal Output
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Direct colorized CLI results for local developer iteration.
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  leakguard scan .
                </div>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117] space-y-2">
                <div className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                  JSON Output
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Useful for dashboards, backend adapters, and custom integrations.
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  leakguard scan . --format json
                </div>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117] space-y-2">
                <div className="font-mono text-xs font-bold text-purple-700 dark:text-purple-400">
                  SARIF Output
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Suitable for GitHub Code Scanning and automated security pipelines.
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  leakguard scan . --format sarif
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 12: GITHUB ACTIONS */}
          <section id="step-actions" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-teal-600 dark:text-teal-400 tracking-wider">
              <span>STEP 10</span>
              <span>•</span>
              <span>CI INTEGRATION</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              10 — GitHub Actions Integration
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Continuous integration runs LeakGuard against repository code on push or pull request to provide automated feedback:
            </p>

            <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 font-mono text-xs text-center space-y-1 text-slate-700 dark:text-slate-300">
              <div>GitHub Repository</div>
              <div className="text-slate-400">↓</div>
              <div>Push / Pull Request</div>
              <div className="text-slate-400">↓</div>
              <div className="text-teal-600 dark:text-teal-400 font-bold">GitHub Actions (action.yml)</div>
              <div className="text-slate-400">↓</div>
              <div className="text-teal-600 dark:text-teal-400 font-bold">LeakGuard Scan</div>
              <div className="text-slate-400">↓</div>
              <div>Result (SARIF / JSON)</div>
              <div className="text-slate-400">↓</div>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold">Developer Feedback &amp; PR Security Gate</div>
            </div>
          </section>

          {/* SECTION 13: PRE-COMMIT */}
          <section id="step-precommit" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-teal-600 dark:text-teal-400 tracking-wider">
              <span>STEP 11</span>
              <span>•</span>
              <span>INTEGRATION WORKFLOW</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              11 — Pre-commit Integration
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Pre-commit helps detect resource lifecycle issues before code is committed to version control.
            </p>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117] space-y-3 font-mono text-xs">
              <div className="flex flex-col items-center space-y-1 text-slate-700 dark:text-slate-300">
                <div>Developer edits code</div>
                <div className="text-slate-400">↓</div>
                <div>git commit</div>
                <div className="text-slate-400">↓</div>
                <div className="text-teal-600 dark:text-teal-400 font-bold">pre-commit hook</div>
                <div className="text-slate-400">↓</div>
                <div className="text-teal-600 dark:text-teal-400 font-bold">LeakGuard scan</div>
                <div className="text-slate-400">↓</div>
                <div>Finding?</div>
                <div className="grid grid-cols-2 gap-8 w-full max-w-xs text-center mt-2">
                  <div className="text-rose-600 dark:text-rose-400">
                    <div>YES</div>
                    <div>↓</div>
                    <div>Fix code</div>
                    <div>↓</div>
                    <div>Run again</div>
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400">
                    <div>NO</div>
                    <div>↓</div>
                    <div>Commit</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 14: DASHBOARD INTEGRATION */}
          <section id="step-dashboard" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-teal-600 dark:text-teal-400 tracking-wider">
              <span>STEP 12</span>
              <span>•</span>
              <span>ARCHITECTURE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              12 — How the Dashboard Fits In
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              The dashboard does not replace LeakGuard. The dashboard consumes LeakGuard scan results.
            </p>

            <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 font-mono text-xs text-center space-y-1 text-slate-700 dark:text-slate-300">
              <div>Existing LeakGuard Engine</div>
              <div className="text-slate-400">↓</div>
              <div>Structured Scan Output</div>
              <div className="text-slate-400">↓</div>
              <div>Dashboard Backend</div>
              <div className="text-slate-400">↓</div>
              <div>Supabase</div>
              <div className="text-slate-400">↓</div>
              <div className="text-teal-600 dark:text-teal-400 font-bold">Dashboard UI</div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <div className="font-semibold text-slate-900 dark:text-white">Dashboard Responsibilities:</div>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                <li>Presenting scan results and code viewers.</li>
                <li>Organizing findings and tracking remediation status.</li>
                <li>Tracking scan history and repository health.</li>
                <li>Showing team activity, audit logs, and integration status.</li>
              </ul>
            </div>
          </section>

          {/* SECTION 15: COMPLETE FLOW */}
          <section id="complete-flow" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-teal-600 dark:text-teal-400 tracking-wider">
              <span>ARCHITECTURE</span>
              <span>•</span>
              <span>END-TO-END</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              The Complete LeakGuard Flow
            </h2>

            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117] space-y-2 font-mono text-xs overflow-x-auto">
              <div className="flex flex-col items-center space-y-1.5">
                <div className="w-full max-w-sm p-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold text-slate-900 dark:text-white">
                  Python Repository
                </div>
                <div className="text-slate-400">↓</div>
                <div className="w-full max-w-sm p-2 rounded border border-teal-500/30 bg-teal-500/10 text-center font-bold text-teal-700 dark:text-teal-300">
                  LeakGuard Scanner
                </div>
                <div className="text-slate-400">↓</div>
                <div className="w-full max-w-sm p-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold text-slate-900 dark:text-white">
                  AST / Static Analysis
                </div>
                <div className="text-slate-400">↓</div>
                <div className="w-full max-w-sm p-2 rounded border border-teal-500/30 bg-teal-500/10 text-center font-bold text-teal-700 dark:text-teal-300">
                  Resource Detection
                </div>
                <div className="text-slate-400">↓</div>
                <div className="w-full max-w-sm p-2 rounded border border-teal-500/30 bg-teal-500/10 text-center font-bold text-teal-700 dark:text-teal-300">
                  Cleanup Detection
                </div>
                <div className="text-slate-400">↓</div>
                <div className="w-full max-w-sm p-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold text-slate-900 dark:text-white">
                  Control Flow / Path Analysis
                </div>
                <div className="text-slate-400">↓</div>
                <div className="w-full max-w-sm p-2 rounded border border-rose-500/30 bg-rose-500/10 text-center font-bold text-rose-700 dark:text-rose-400">
                  Finding
                </div>
                <div className="text-slate-400">↓</div>
                <div className="w-full max-w-sm p-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold text-slate-900 dark:text-white">
                  JSON / SARIF / CLI Output
                </div>
                <div className="text-slate-400">↓</div>
                <div className="w-full max-w-sm p-2 rounded border border-purple-500/30 bg-purple-500/10 text-center font-bold text-purple-700 dark:text-purple-300">
                  Dashboard / CI / Developer
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 16: LIMITATIONS */}
          <section id="limitations" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 tracking-wider">
              <span>BOUNDARIES</span>
              <span>•</span>
              <span>LIMITATIONS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Know the Boundaries
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              LeakGuard is designed to catch common structural resource lifecycle problems. It is not a replacement for every form of enterprise static-analysis tooling:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117] space-y-1.5">
                <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  1. Interprocedural Analysis
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Function A opens a resource, Function B closes it. The analyzer may not be able to fully track that ownership transfer.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117] space-y-1.5">
                <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  2. Variable Aliasing
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Complex aliasing and variable reassignment across dynamic scopes can be difficult to resolve statically.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117] space-y-1.5">
                <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  3. Dynamic Python Behavior
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Reflection, runtime monkey patching, and dynamic evaluation can evade static analysis.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117] space-y-1.5">
                <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  4. Concurrency &amp; Threads
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Concurrency and shared resource behavior are not fully modeled by the control-flow analysis.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 17: QUICK START */}
          <section id="quickstart" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-teal-600 dark:text-teal-400 tracking-wider">
              <span>GET STARTED</span>
              <span>•</span>
              <span>EXECUTION</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Run Your First Scan
            </h2>

            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                  <span>1. Install</span>
                  <button onClick={() => copyToClipboard('pip install .', 'qs-1')} className="hover:text-white">
                    {copiedIndex === 'qs-1' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="text-teal-300">$ pip install .</div>

                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2 pt-2">
                  <span>2. Scan</span>
                  <button onClick={() => copyToClipboard('leakguard scan demo-project/', 'qs-2')} className="hover:text-white">
                    {copiedIndex === 'qs-2' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="text-teal-300">$ leakguard scan demo-project/</div>

                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2 pt-2">
                  <span>3. JSON</span>
                  <button onClick={() => copyToClipboard('leakguard scan . --format json', 'qs-3')} className="hover:text-white">
                    {copiedIndex === 'qs-3' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="text-teal-300">$ leakguard scan . --format json</div>

                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2 pt-2">
                  <span>4. SARIF</span>
                  <button onClick={() => copyToClipboard('leakguard scan . --format sarif', 'qs-4')} className="hover:text-white">
                    {copiedIndex === 'qs-4' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="text-teal-300">$ leakguard scan . --format sarif</div>
              </div>

              <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    5. Review Findings in the Dashboard
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Open the Findings section to explore interactive Monaco line highlights and control-flow path diagrams.
                  </div>
                </div>
                {onTriggerScan && (
                  <button
                    onClick={onTriggerScan}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    Run Scan
                  </button>
                )}
              </div>
            </div>
          </section>

        </div>

        {/* Sticky On This Page TOC (1 col on desktop) */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117] space-y-3">
            <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              On this page
            </div>
            <nav className="space-y-1 text-xs">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-2 py-1 rounded text-[12px] transition-colors truncate cursor-pointer ${
                      isActive
                        ? 'font-semibold text-teal-700 dark:text-teal-400 bg-teal-500/10'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};
