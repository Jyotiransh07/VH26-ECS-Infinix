import React from 'react';
import { DocSection, SearchResult } from '../types/docs';
import { CodeBlock } from '../components/docs/CodeBlock';
import { Alert } from '../components/docs/Alert';
import { LiveScannerWidget } from '../components/docs/LiveScannerWidget';

export const docsSections: Record<string, DocSection> = {
  intro: {
    id: 'intro',
    title: 'Introduction to LeakGuard',
    category: 'GETTING STARTED',
    description: 'Learn what LeakGuard is, why resource descriptor leaks happen, and how static analysis prevents production outages.',
    breadcrumbs: ['Home', 'Getting Started', 'Introduction'],
    toc: [
      { id: 'what-is-leakguard', title: 'What is LeakGuard?' },
      { id: 'why-static-detection', title: 'Why Static Resource Leak Detection?' },
      { id: 'core-pipeline', title: 'Core Analysis Pipeline' },
      { id: 'key-features', title: 'Key Features' },
    ],
    content: (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Welcome to LeakGuard
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          <strong>LeakGuard</strong> is a lightweight, explainable, path-aware static analysis platform designed to detect unclosed Python resources—such as file descriptors, database connections, and network sockets—before unsafe code hits production.
        </p>

        <Alert type="info" title="Zero Runtime Overhead">
          Unlike dynamic profilers or runtime garbage-collection hooks, LeakGuard evaluates your code statically via AST parsing and Control Flow Graph (CFG) path verification. It executes in milliseconds with zero dependencies on your production environment.
        </Alert>

        <h2 id="what-is-leakguard" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          What is a Resource Leak?
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          When a program interacts with the operating system—such as calling <code className="font-mono text-teal-600 dark:text-teal-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">open()</code>, <code className="font-mono text-teal-600 dark:text-teal-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">sqlite3.connect()</code>, or <code className="font-mono text-teal-600 dark:text-teal-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">socket.socket()</code>—it allocates an operating system resource handle. If an early return, conditional branch, or unhandled exception bypasses the corresponding <code className="font-mono text-teal-600 dark:text-teal-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">.close()</code> invocation, that resource descriptor remains open in memory.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Over time, unclosed handles lead to file descriptor exhaustion (<code className="font-mono text-rose-500">EMFILE: Too many open files</code>), database connection pool lockouts, and memory leaks.
        </p>

        <h2 id="why-static-detection" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          Why Static Resource Leak Detection?
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          In Python, reliance on CPython's reference counting is unsafe: cyclic references, exception stack frames, and long-running event loops frequently prevent timely <code className="font-mono">__del__</code> execution. LeakGuard proves path safety across all branches before deployment.
        </p>

        <h2 id="core-pipeline" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          Core Analysis Pipeline
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Every scan traverses an end-to-end multi-stage static verification pipeline:
        </p>

        <CodeBlock
          language="text"
          filename="Pipeline Architecture"
          code={`Python Source Code
       ↓
AST Parser (ast.parse)
       ↓
Resource Detector (open, socket, sqlite3)
       ↓
Lifecycle & Variable Tracker
       ↓
Control Flow Graph (CFG) Synthesis
       ↓
Path Analyzer (Branch & Exception traversal)
       ↓
Leak Decision Engine (Safe vs Unclosed Exit)
       ↓
Confidence Scoring (Definite / Likely / Safe)
       ↓
Enforcement Policy (PASS / BLOCKED)`}
        />

        <h2 id="key-features" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          Key Features
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <li><strong>AST & Control Flow Graph Verification:</strong> Traces every execution path from resource allocation to function termination.</li>
          <li><strong>Explainable Root Cause Reports:</strong> Shows exact source lines, variables, and leaking branch trajectories.</li>
          <li><strong>OASIS SARIF v2.1.0 & JSON Compliance:</strong> Direct integration with GitHub Code Scanning alerts and custom CI/CD pipelines.</li>
          <li><strong>Configurable Resource Rules:</strong> Easily track custom client sessions, database pools, or locks via declarative YAML.</li>
          <li><strong>Developer Tooling:</strong> CLI, Pre-commit hooks, GitHub Actions, and REST API.</li>
        </ul>
      </div>
    )
  },

  installation: {
    id: 'installation',
    title: 'Installation & Setup',
    category: 'GETTING STARTED',
    description: 'Instructions for installing LeakGuard via pip, setting up editable development environments, and PATH configuration.',
    breadcrumbs: ['Home', 'Getting Started', 'Installation'],
    toc: [
      { id: 'requirements', title: 'System Requirements' },
      { id: 'pip-install', title: 'Installing via pip' },
      { id: 'editable-install', title: 'Development Installation' },
      { id: 'path-troubleshooting', title: 'PATH Verification' },
    ],
    content: (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Installation Guide
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          LeakGuard is packaged as a standard Python distribution compatible with modern Python environments.
        </p>

        <h2 id="requirements" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          System Requirements
        </h2>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
          <li>Python 3.10, 3.11, 3.12, or 3.13</li>
          <li>Operating System: Linux, macOS, or Windows (PowerShell / WSL)</li>
          <li>No external C compilation or native libraries required</li>
        </ul>

        <h2 id="pip-install" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          Installing via pip
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Install the latest package directly from the repository root:
        </p>

        <CodeBlock
          language="bash"
          filename="Terminal"
          code="pip install ."
        />

        <h2 id="editable-install" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          Development / Editable Installation
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          If you are modifying rules or extending analyzers, install in editable mode:
        </p>

        <CodeBlock
          language="bash"
          filename="Terminal"
          code="pip install -e ."
        />

        <h2 id="path-troubleshooting" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          PATH Verification
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Confirm the binary executable is accessible in your environment:
        </p>

        <CodeBlock
          language="bash"
          filename="Terminal"
          code="leakguard --help"
        />

        <Alert type="info" title="Module Invocation Fallback">
          If your Python scripts directory is not added to your global <code className="font-mono">PATH</code>, you can always invoke LeakGuard directly as a Python module using <code className="font-mono">python -m leakguard.cli scan &lt;path&gt;</code>.
        </Alert>
      </div>
    )
  },

  quickstart: {
    id: 'quickstart',
    title: 'Quick Start',
    category: 'GETTING STARTED',
    description: 'Run your first scan, understand findings, and apply canonical context manager remediation.',
    breadcrumbs: ['Home', 'Getting Started', 'Quick Start'],
    toc: [
      { id: 'first-scan', title: 'Running Your First Scan' },
      { id: 'analyzing-output', title: 'Understanding the Output' },
      { id: 'fixing-leaks', title: 'Fixing Resource Leaks' },
      { id: 'exit-codes', title: 'CLI Exit Codes' },
    ],
    content: (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Quick Start Guide
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Get started with LeakGuard in less than 60 seconds.
        </p>

        <h2 id="first-scan" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          Running Your First Scan
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Point LeakGuard to any Python file or directory:
        </p>

        <CodeBlock
          language="bash"
          filename="Terminal"
          code="leakguard scan sample-repo-python"
        />

        <h2 id="analyzing-output" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          Understanding the Output
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          When a resource leak is detected, LeakGuard prints an explainable diagnostic block:
        </p>

        <CodeBlock
          language="text"
          filename="Scan Results"
          code={`[HIGH] DEFINITE RESOURCE LEAK

File: sample-repo-python/early_return.py
Line: 2

Resource:
    File 'f'

Opened:
    line 2

Leaking path:
    4 -> 5 -> 6 -> EXIT

Reason:
    Early return or branch bypasses resource cleanup.

Suggestion:
    Consider using a context manager (\`with\` statement) to automatically manage this resource.
----------------------------------------
Files scanned: 6
Resources detected: 7
Definite leaks: 4
Likely leaks: 0`}
        />

        <h2 id="fixing-leaks" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          Fixing Resource Leaks
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Compare the vulnerable implementation with the recommended context manager pattern:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-bold font-mono text-rose-500 uppercase block mb-1">❌ Vulnerable (Flagged by LeakGuard)</span>
            <CodeBlock
              language="python"
              filename="bad_code.py"
              code={`def load_data(path, is_valid):
    f = open(path, "r")
    if not is_valid:
        return None  # Leaks file descriptor!
    data = f.read()
    f.close()
    return data`}
            />
          </div>
          <div>
            <span className="text-xs font-bold font-mono text-teal-600 dark:text-teal-400 uppercase block mb-1">✅ Safe (Passes Analysis)</span>
            <CodeBlock
              language="python"
              filename="good_code.py"
              code={`def load_data(path, is_valid):
    with open(path, "r") as f:
        if not is_valid:
            return None  # Safely closed by context manager!
        return f.read()`}
            />
          </div>
        </div>

        <h2 id="exit-codes" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          CLI Exit Codes & Enforcement Standard
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-200 dark:border-slate-800">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-200">
                <th className="p-3 border border-slate-200 dark:border-slate-700">Exit Code</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700">Status</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700">Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="p-3 font-mono font-bold text-teal-600 dark:text-teal-400">0</td>
                <td className="p-3 font-semibold">PASS</td>
                <td className="p-3 text-slate-600 dark:text-slate-300">Clean codebase. No unclosed execution paths found.</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-rose-500">1</td>
                <td className="p-3 font-semibold">BLOCKED</td>
                <td className="p-3 text-slate-600 dark:text-slate-300">Definite high-confidence resource leak detected. CI build fails.</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-amber-500">2</td>
                <td className="p-3 font-semibold">ERROR</td>
                <td className="p-3 text-slate-600 dark:text-slate-300">Invalid arguments, missing files, or syntax parse error.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  },

  scanning: {
    id: 'scanning',
    title: 'Security Scanning & Analysis',
    category: 'CORE FEATURES',
    description: 'Detailed guide to scanning options, formats, and path selection.',
    breadcrumbs: ['Home', 'Core Features', 'Security Scanning'],
    toc: [
      { id: 'scan-targets', title: 'Target Selection' },
      { id: 'output-formats', title: 'Output Formats' },
      { id: 'json-output', title: 'JSON Output' },
      { id: 'sarif-output', title: 'SARIF v2.1.0 Output' },
    ],
    content: (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Security Scanning & Output Formats
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          LeakGuard supports scanning single Python files or entire directory trees with customizable report formats.
        </p>

        <h2 id="scan-targets" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          Target Selection
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Scan single files or nested project directories:
        </p>

        <CodeBlock
          language="bash"
          filename="Terminal"
          code={`# Scan a single file
leakguard scan demo-project/example.py

# Scan current workspace recursively
leakguard scan .

# Scan specific submodule
leakguard scan src/database/`}
        />

        <h2 id="output-formats" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          Output Formats
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Use the <code className="font-mono">--format</code> option to choose your preferred output format:
        </p>

        <CodeBlock
          language="bash"
          filename="Terminal"
          code={`# Human-readable console text (Default)
leakguard scan . --format text

# Structured JSON
leakguard scan . --format json > report.json

# OASIS Standard SARIF
leakguard scan . --format sarif > results.sarif`}
        />

        <h2 id="json-output" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          JSON Output Schema
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Machine-readable JSON schema for automated tooling integration:
        </p>

        <CodeBlock
          language="json"
          filename="report.json"
          code={`{
  "summary": {
    "files_scanned": 6,
    "definite_leaks": 4,
    "likely_leaks": 0,
    "unknown": 0
  },
  "findings": [
    {
      "file": "sample-repo-python/early_return.py",
      "line": 2,
      "column": 4,
      "resource_type": "file",
      "variable_name": "f",
      "severity": "HIGH",
      "confidence": "DEFINITE",
      "reason": "Early return or branch bypasses resource cleanup.",
      "path": [4, 5, 6],
      "suggestion": "Consider using a context manager (\`with\` statement) to automatically manage this resource."
    }
  ]
}`}
        />
      </div>
    )
  },

  decision: {
    id: 'decision',
    title: 'Leak Decision Engine & Confidence',
    category: 'CORE FEATURES',
    description: 'Understanding the formal classification of Definite, Likely, and Safe confidence scoring.',
    breadcrumbs: ['Home', 'Core Features', 'Leak Decision Engine'],
    toc: [
      { id: 'confidence-levels', title: 'Confidence Scoring Standards' },
      { id: 'lifecycle-states', title: 'Lifecycle State Machine' },
      { id: 'ownership-tracking', title: 'Ownership & Transfers' },
    ],
    content: (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Leak Decision Engine
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          LeakGuard classifies findings using an evidence-based confidence scoring system.
        </p>

        <h2 id="confidence-levels" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          Confidence Scoring Standards
        </h2>
        
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 space-y-1">
            <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 uppercase">HIGH / DEFINITE LEAK</span>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Confirmed execution path where a resource is allocated and the function returns or exits without calling the corresponding release method. <strong>Blocks CI/CD builds (Exit code 1).</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-1">
            <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">MEDIUM / LIKELY LEAK</span>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Realistic branch or exception path (e.g. within a <code className="font-mono">try</code> block) where an exception causes early scope exit before cleanup.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-500/10 space-y-1">
            <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 uppercase">SAFE PATTERN</span>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Cleanup is structurally guaranteed across all paths via a context manager (<code className="font-mono">with</code>) or <code className="font-mono">try...finally</code>.
            </p>
          </div>
        </div>

        <h2 id="lifecycle-states" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          Resource Lifecycle State Machine
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Each tracked descriptor traverses formal lifecycle states:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 dark:text-slate-300">
          <li><code className="font-mono">UNOPENED</code>: Symbol identifier before assignment.</li>
          <li><code className="font-mono">OPEN</code>: Allocated via recognized acquisition pattern.</li>
          <li><code className="font-mono">CLOSED</code>: Released via recognized cleanup method.</li>
          <li><code className="font-mono">ESCAPED</code>: Transferred to external caller or returned from function.</li>
        </ul>
      </div>
    )
  },

  cfg: {
    id: 'cfg',
    title: 'Control Flow Graph Analysis',
    category: 'CORE FEATURES',
    description: 'How LeakGuard constructs AST control flow graphs to trace branch and exception trajectories.',
    breadcrumbs: ['Home', 'Core Features', 'Control Flow Analysis'],
    toc: [
      { id: 'cfg-construction', title: 'CFG Construction' },
      { id: 'branch-traversal', title: 'Branch & Exception Traversal' },
      { id: 'interactive-visualizer', title: 'Visual Topology' },
    ],
    content: (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Control Flow Graph (CFG) Analysis
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          LeakGuard's differentiator is its path analyzer that builds a Control Flow Graph directly from Python's abstract syntax tree.
        </p>

        <h2 id="cfg-construction" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          CFG Construction
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          The <code className="font-mono">CFGBuilder</code> traverses AST nodes, mapping sequential statements, <code className="font-mono">if/else</code> branches, loops, and exception blocks into directed graph nodes.
        </p>

        <CodeBlock
          language="text"
          filename="Control Flow Graph Topology"
          code={`        Resource Acquired (Line 2)
                   │
                   ▼
            if not is_valid (Line 4)
             /                   \\
            /                     \\
    [False Branch]            [True Branch]
          │                         │
          ▼                         ▼
   f.close() (Line 8)        return None (Line 5)
          │                         │
          ▼                         ▼
   Normal Function Exit            EXIT
          │                         │
          ▼                         ▼
      [SAFE PATH]            [DEFINITE LEAK]`}
        />
      </div>
    )
  },

  reports: {
    id: 'reports',
    title: 'Compliance & SARIF Reports',
    category: 'CORE FEATURES',
    description: 'Exporting machine-readable JSON and OASIS SARIF v2.1.0 for GitHub Code Scanning.',
    breadcrumbs: ['Home', 'Core Features', 'Compliance Reports'],
    toc: [
      { id: 'sarif-standard', title: 'OASIS SARIF v2.1.0' },
      { id: 'github-security-tab', title: 'GitHub Security Tab Integration' },
      { id: 'console-output', title: 'Console Output Format' },
    ],
    content: (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Compliance & SARIF Reports
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          LeakGuard natively outputs OASIS standard SARIF (Static Analysis Results Interchange Format) v2.1.0, enabling direct ingestion by GitHub Code Scanning, SonarQube, and enterprise SIEM dashboards.
        </p>

        <h2 id="sarif-standard" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          Generating SARIF Reports
        </h2>
        <CodeBlock
          language="bash"
          filename="Terminal"
          code="leakguard scan . --format sarif > leakguard-results.sarif"
        />

        <h2 id="github-security-tab" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          Uploading to GitHub Code Scanning
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Upload SARIF artifacts in GitHub Actions to display inline code annotations on Pull Requests:
        </p>

        <CodeBlock
          language="yaml"
          filename=".github/workflows/security.yml"
          code={`- name: Run LeakGuard
  run: leakguard scan . --format sarif > leakguard.sarif

- name: Upload SARIF report
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: leakguard.sarif`}
        />
      </div>
    )
  },

  'config-rules': {
    id: 'config-rules',
    title: 'Resource Rules YAML',
    category: 'CONFIGURATION',
    description: 'Configuring standard and custom resource definitions via declarative YAML.',
    breadcrumbs: ['Home', 'Configuration', 'Resource Rules YAML'],
    toc: [
      { id: 'default-rules', title: 'Default Built-in Rules' },
      { id: 'custom-rules', title: 'Custom Resource Definitions' },
      { id: 'rule-syntax', title: 'YAML Rule Syntax' },
    ],
    content: (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Resource Rules Configuration
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          LeakGuard reads resource specifications from <code className="font-mono">leakguard/rules/resources.yaml</code>.
        </p>

        <h2 id="default-rules" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          Default Built-in Rules
        </h2>
        <CodeBlock
          language="yaml"
          filename="leakguard/rules/resources.yaml"
          code={`resources:
  - name: file
    acquire:
      - open
    release:
      - close

  - name: socket
    acquire:
      - socket.socket
    release:
      - close

  - name: sqlite_connection
    acquire:
      - sqlite3.connect
    release:
      - close`}
        />

        <h2 id="custom-rules" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          Custom Resource Definitions
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Define custom internal client sessions, locks, or database pools:
        </p>

        <CodeBlock
          language="yaml"
          filename="custom_rules.yaml"
          code={`resources:
  - name: custom_database_session
    acquire:
      - SessionLocal
      - get_db_session
    release:
      - close
      - rollback

  - name: distributed_lock
    acquire:
      - acquire_lock
    release:
      - release_lock`}
        />

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Pass your custom rules file using the <code className="font-mono">--config</code> flag:
        </p>

        <CodeBlock
          language="bash"
          filename="Terminal"
          code="leakguard scan . --config custom_rules.yaml"
        />
      </div>
    )
  },

  'github-actions': {
    id: 'github-actions',
    title: 'GitHub Actions Integration',
    category: 'INTEGRATIONS',
    description: 'Setting up continuous automated scanning on Pull Requests and Main branch commits.',
    breadcrumbs: ['Home', 'Integrations', 'GitHub Actions'],
    toc: [
      { id: 'composite-action', title: 'Composite Action Definition' },
      { id: 'workflow-setup', title: 'Workflow Setup' },
      { id: 'pr-blocking', title: 'PR Gating Policy' },
    ],
    content: (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          GitHub Actions CI/CD Integration
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          LeakGuard provides a composite GitHub Action to automatically scan Python pull requests and block merges if definite resource leaks are introduced.
        </p>

        <h2 id="workflow-setup" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          Workflow Setup
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Create <code className="font-mono">.github/workflows/leakguard.yml</code> in your repository:
        </p>

        <CodeBlock
          language="yaml"
          filename=".github/workflows/leakguard.yml"
          code={`name: LeakGuard Static Analysis

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  resource-leak-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install LeakGuard
        run: pip install .

      - name: Run LeakGuard Analysis
        run: leakguard scan .`}
        />

        <Alert type="success" title="Automatic PR Blocking">
          If any developer introduces unclosed file handles or database connections, LeakGuard exits with status code 1, automatically marking the GitHub PR check as failed.
        </Alert>
      </div>
    )
  },

  'pre-commit': {
    id: 'pre-commit',
    title: 'Pre-commit Git Hook',
    category: 'INTEGRATIONS',
    description: 'Catch resource leaks locally in under 100ms before git commits are created.',
    breadcrumbs: ['Home', 'Integrations', 'Pre-commit Hooks'],
    toc: [
      { id: 'hook-config', title: '.pre-commit-config.yaml' },
      { id: 'hook-install', title: 'Installation Commands' },
    ],
    content: (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Pre-commit Git Hook
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Catch unclosed resource descriptors directly in your local terminal before changes are committed.
        </p>

        <h2 id="hook-config" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          Configuration
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Add LeakGuard to your <code className="font-mono">.pre-commit-config.yaml</code>:
        </p>

        <CodeBlock
          language="yaml"
          filename=".pre-commit-config.yaml"
          code={`repos:
  - repo: https://github.com/Jyotiransh07/VH26-ECS-Infinix
    rev: v0.1.0
    hooks:
      - id: leakguard
        name: LeakGuard Resource Leak Detector
        entry: leakguard scan .
        language: python
        types: [python]
        pass_filenames: false`}
        />

        <h2 id="hook-install" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          Installation
        </h2>
        <CodeBlock
          language="bash"
          filename="Terminal"
          code={`pip install pre-commit
pre-commit install
pre-commit run leakguard --all-files`}
        />
      </div>
    )
  },

  api: {
    id: 'api',
    title: 'FastAPI REST API Reference',
    category: 'INTEGRATIONS',
    description: 'Programmatic REST API endpoints for triggering scans, querying findings, and exporting reports.',
    breadcrumbs: ['Home', 'Integrations', 'FastAPI REST API'],
    toc: [
      { id: 'endpoints-list', title: 'API Endpoints' },
      { id: 'health-endpoint', title: 'Health Endpoint' },
      { id: 'scans-endpoint', title: 'Trigger Scan Endpoint' },
    ],
    content: (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          FastAPI REST API Reference
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          LeakGuard includes a FastAPI backend layer (<code className="font-mono">api/main.py</code>) allowing programmatic access to the AST analyzer.
        </p>

        <h2 id="endpoints-list" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          Key Endpoints
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-200 dark:border-slate-800">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-200">
                <th className="p-3 border border-slate-200 dark:border-slate-700">Method</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700">Endpoint</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
              <tr>
                <td className="p-3 text-teal-600 font-bold">GET</td>
                <td className="p-3 font-semibold">/api/health</td>
                <td className="p-3 text-slate-600 dark:text-slate-300 font-sans">Returns engine status, loaded rules count, and system time.</td>
              </tr>
              <tr>
                <td className="p-3 text-blue-600 font-bold">POST</td>
                <td className="p-3 font-semibold">/api/scans</td>
                <td className="p-3 text-slate-600 dark:text-slate-300 font-sans">Executes real static analysis on target directory and returns findings.</td>
              </tr>
              <tr>
                <td className="p-3 text-teal-600 font-bold">GET</td>
                <td className="p-3 font-semibold">/api/issues</td>
                <td className="p-3 text-slate-600 dark:text-slate-300 font-sans">Lists all discovered leak issues with CFG nodes and code snippets.</td>
              </tr>
              <tr>
                <td className="p-3 text-teal-600 font-bold">GET</td>
                <td className="p-3 font-semibold">/api/rules</td>
                <td className="p-3 text-slate-600 dark:text-slate-300 font-sans">Fetches active resource tracking rules from resources.yaml.</td>
              </tr>
              <tr>
                <td className="p-3 text-teal-600 font-bold">GET</td>
                <td className="p-3 font-semibold">/api/reports/{'{scan_id}'}</td>
                <td className="p-3 text-slate-600 dark:text-slate-300 font-sans">Exports report in JSON, SARIF v2.1.0, or plain text format.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 id="health-endpoint" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          Health Check Example
        </h2>
        <CodeBlock
          language="bash"
          filename="curl"
          code="curl -X GET http://127.0.0.1:8000/api/health"
        />
      </div>
    )
  },

  sandbox: {
    id: 'sandbox',
    title: 'Live Scanner Sandbox',
    category: 'RESOURCES & TOOLS',
    description: 'Execute live static analysis against repository files and inspect Control Flow Graphs.',
    breadcrumbs: ['Home', 'Resources', 'Live Sandbox'],
    toc: [
      { id: 'interactive-widget', title: 'Interactive Scanner' },
      { id: 'supported-fixtures', title: 'Supported Sample Fixtures' },
    ],
    content: (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Live Static Analysis Sandbox
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Interact with the live LeakGuard AST engine right here in the documentation.
        </p>

        <h2 id="interactive-widget" className="text-xl font-bold text-slate-900 dark:text-white pt-2">
          Interactive Scanner
        </h2>
        
        {/* Live Embedded Scanner */}
        <LiveScannerWidget />

        <h2 id="supported-fixtures" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          Sample Test Fixtures in Repository
        </h2>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
          <li><code className="font-mono">sample-repo-python/early_return.py</code>: Demonstrates early function returns before file descriptor close.</li>
          <li><code className="font-mono">sample-repo-python/exception_path.py</code>: Demonstrates unhandled exceptions inside try blocks leaking SQLite connections.</li>
          <li><code className="font-mono">sample-repo-python/missing_close.py</code>: Unclosed TCP socket connection.</li>
          <li><code className="font-mono">sample-repo-python/reassigned.py</code>: Descriptor overwritten before initial stream release.</li>
        </ul>
      </div>
    )
  },

  faq: {
    id: 'faq',
    title: 'Frequently Asked Questions',
    category: 'RESOURCES & TOOLS',
    description: 'Answers to common questions regarding performance, false positives, and architecture.',
    breadcrumbs: ['Home', 'Resources', 'FAQ'],
    toc: [
      { id: 'how-fast', title: 'How fast is LeakGuard?' },
      { id: 'false-positives', title: 'How are false positives handled?' },
      { id: 'comparison', title: 'Comparison with Other Tools' },
    ],
    content: (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h1>

        <div className="space-y-6 pt-2">
          <div>
            <h3 id="how-fast" className="text-base font-bold text-slate-900 dark:text-white">
              How fast is LeakGuard?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              LeakGuard analyzes hundreds of Python files in under 200ms because it evaluates abstract syntax trees in memory without executing the code or importing heavy runtime dependencies.
            </p>
          </div>

          <div>
            <h3 id="false-positives" className="text-base font-bold text-slate-900 dark:text-white">
              How are false positives minimized?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Only definite leaks (proven unclosed exits) return High confidence and block CI/CD pipelines. Uncertain or interprocedural ownership transfers are classified as Likely/Low confidence to avoid developer fatigue.
            </p>
          </div>

          <div>
            <h3 id="comparison" className="text-base font-bold text-slate-900 dark:text-white">
              How does LeakGuard compare to Bandit or Flake8?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Bandit focuses broadly on Python security vulnerabilities (hardcoded passwords, insecure imports, SQL injection). LeakGuard is a specialized, path-aware resource lifecycle analyzer specifically dedicated to unclosed OS handles, connection descriptor exhaustion, and control-flow leak prevention.
            </p>
          </div>
        </div>
      </div>
    )
  },

  troubleshooting: {
    id: 'troubleshooting',
    title: 'Troubleshooting & Known Limitations',
    category: 'RESOURCES & TOOLS',
    description: 'Known limitations of static analysis in dynamic Python programs.',
    breadcrumbs: ['Home', 'Resources', 'Troubleshooting'],
    toc: [
      { id: 'known-limits', title: 'Static Analysis Limitations' },
      { id: 'interprocedural', title: 'Interprocedural Ownership' },
      { id: 'dynamic-eval', title: 'Dynamic Behavior' },
    ],
    content: (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Troubleshooting & Known Limitations
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Static analysis of dynamic languages like Python has natural theoretical constraints. LeakGuard is designed to be transparent about what it can and cannot detect.
        </p>

        <h2 id="known-limits" className="text-xl font-bold text-slate-900 dark:text-white pt-4">
          Known Limitations
        </h2>

        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p><strong>1. Interprocedural Hand-offs:</strong> If a resource is opened in Function A and passed into Function B to be closed, LeakGuard cannot guarantee Function B will execute without exception, scoring it as <code className="font-mono text-amber-500">LIKELY</code>.</p>
          <p><strong>2. Dynamic Reflection:</strong> Descriptors created via <code className="font-mono">getattr()</code> or <code className="font-mono">eval()</code> are not visible to the static AST parser.</p>
          <p><strong>3. Complex Aliasing:</strong> Storing handles inside nested dictionary structures or monkey-patching references bypasses local variable tracking.</p>
        </div>

        <Alert type="warning" title="Best Practice Recommendation">
          Always prefer Python's native <code className="font-mono">with</code> context managers (<code className="font-mono">with open(...) as f:</code>) whenever possible. Context managers structurally guarantee safety regardless of language complexity.
        </Alert>
      </div>
    )
  }
};

// Build Search Index
export const searchIndex: SearchResult[] = Object.values(docsSections).flatMap((section) => [
  {
    sectionId: section.id,
    title: section.title,
    category: section.category,
    snippet: section.description,
  },
  ...section.toc.map((t) => ({
    sectionId: section.id,
    title: t.title,
    category: section.title,
    snippet: `Section in ${section.title}`,
  }))
]);
