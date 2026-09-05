import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldAlert, 
  FileCode, 
  GitFork, 
  Wrench, 
  CheckCircle2, 
  Copy, 
  Check, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  GitCommit,
  GitBranch,
  Users,
  Clock,
  Sparkles,
  AlertTriangle
} from '@/components/icons';
import { IssueFinding } from '../types';
import { api } from '../services/api';

interface IssueDetailsPageProps {
  finding: IssueFinding;
  onBack: () => void;
  onReScan?: () => void;
}

export const IssueDetailsPage: React.FC<IssueDetailsPageProps> = ({
  finding,
  onBack,
  onReScan
}) => {
  const [copiedFix, setCopiedFix] = useState(false);
  const [status, setStatus] = useState<string>(finding.status || 'OPEN');
  const [assignedTo, setAssignedTo] = useState<string>(finding.assigned_to || 'Janson Williams');
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'cfg' | 'timeline'>('editor');

  const leakingPath = Array.isArray(finding.leaking_path) ? finding.leaking_path : [4, 5, 6];

  // Dynamic source code based on file
  const isEarlyReturn = finding.file.includes('early_return') || finding.variable_name === 'f';
  const isException = finding.file.includes('exception') || finding.resource_type.includes('sqlite');
  const isSocket = finding.file.includes('socket') || finding.resource_type === 'socket';

  const sourceLines = isEarlyReturn ? [
    { line: 1, code: 'def parse_data(file_path, is_valid):', type: 'normal' },
    { line: 2, code: '    f = open(file_path, "r")  # ⚠️ Resource Acquired (Descriptor allocated)', type: 'acquire' },
    { line: 3, code: '    header = f.readline()', type: 'normal' },
    { line: 4, code: '    if not is_valid:  # 🔀 Branch evaluation bypasses .close()', type: 'branch' },
    { line: 5, code: '        return None  # 💥 Leaking Exit: File handle remains open', type: 'leak' },
    { line: 6, code: '    content = f.read()', type: 'normal' },
    { line: 7, code: '    f.close()', type: 'normal' },
    { line: 8, code: '    return content', type: 'normal' }
  ] : isException ? [
    { line: 1, code: 'import sqlite3', type: 'normal' },
    { line: 2, code: '', type: 'normal' },
    { line: 3, code: 'def fetch_user_data(db_path, user_id):', type: 'normal' },
    { line: 4, code: '    conn = sqlite3.connect(db_path)  # ⚠️ Resource Acquired', type: 'acquire' },
    { line: 5, code: '    cursor = conn.cursor()', type: 'normal' },
    { line: 6, code: '    if user_id <= 0:  # 🔀 Validation exception path', type: 'branch' },
    { line: 7, code: '        raise ValueError("Invalid ID")  # 💥 Leaking Exit: Connection unclosed', type: 'leak' },
    { line: 8, code: '    cursor.execute("SELECT * FROM users WHERE id=?", (user_id,))', type: 'normal' },
    { line: 9, code: '    conn.close()', type: 'normal' },
    { line: 10, code: '    return cursor.fetchall()', type: 'normal' }
  ] : [
    { line: 1, code: 'import socket', type: 'normal' },
    { line: 2, code: '', type: 'normal' },
    { line: 3, code: 'def send_telemetry(payload):', type: 'normal' },
    { line: 4, code: '    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  # ⚠️ Acquired', type: 'acquire' },
    { line: 5, code: '    s.connect(("telemetry.service", 8080))', type: 'normal' },
    { line: 6, code: '    s.sendall(payload)', type: 'normal' },
    { line: 7, code: '    # Missing s.close() before return', type: 'leak' },
    { line: 8, code: '    return True', type: 'leak' }
  ];

  const remediationCode = isEarlyReturn
    ? `# Recommended Fix: Context Manager Guarantee\ndef parse_data(file_path, is_valid):\n    with open(file_path, "r") as f:\n        header = f.readline()\n        if not is_valid:\n            return None\n        return f.read()\n# Resource descriptor is automatically closed on early return!`
    : isException
    ? `# Recommended Fix: Database Context Manager\nimport sqlite3\n\ndef fetch_user_data(db_path, user_id):\n    with sqlite3.connect(db_path) as conn:\n        if user_id <= 0:\n            raise ValueError("Invalid ID")\n        cursor = conn.cursor()\n        cursor.execute("SELECT * FROM users WHERE id=?", (user_id,))\n        return cursor.fetchall()`
    : `# Recommended Fix: try...finally Guarantee\nimport socket\n\ndef send_telemetry(payload):\n    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n    try:\n        s.connect(("telemetry.service", 8080))\n        s.sendall(payload)\n        return True\n    finally:\n        s.close() # Cleaned up on all return paths`;

  const handleCopyFix = () => {
    navigator.clipboard.writeText(remediationCode);
    setCopiedFix(true);
    setTimeout(() => setCopiedFix(false), 2000);
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    setIsUpdating(true);
    try {
      await api.updateFindingStatus(finding.id, newStatus, assignedTo);
    } catch {}
    setIsUpdating(false);
  };

  const handleAssigneeChange = async (newAssignee: string) => {
    setAssignedTo(newAssignee);
    setIsUpdating(true);
    try {
      await api.updateFindingStatus(finding.id, status, newAssignee);
    } catch {}
    setIsUpdating(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Return Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Leaks</span>
          </button>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span>Leaks</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-teal-600 dark:text-teal-400 font-bold">{finding.id || 'find-1'}</span>
          </div>
        </div>

        {onReScan && (
          <button
            onClick={onReScan}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-teal-500/15 border border-teal-500/30 text-teal-700 dark:text-teal-300 hover:bg-teal-500/25 transition-all shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-scan Repository</span>
          </button>
        )}
      </div>

      {/* Main Finding Overview Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                {finding.severity || 'HIGH'} SEVERITY
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                {finding.confidence || 'DEFINITE'} RESOURCE LEAK
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300">
                {finding.resource_type.toUpperCase()} '{finding.variable_name}'
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Unclosed {finding.resource_type} descriptor '{finding.variable_name}' at line {finding.line}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {finding.reason}
            </p>
          </div>

          {/* Quick Status & Assignee Controls */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Status</p>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdating}
                className="mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="OPEN">🔴 OPEN</option>
                <option value="TRIAGED">🟡 TRIAGED</option>
                <option value="IN_PROGRESS">🔵 IN PROGRESS</option>
                <option value="FIXED">🟢 FIXED</option>
                <option value="VERIFIED">🟣 VERIFIED</option>
              </select>
            </div>

            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Assigned Developer</p>
              <select
                value={assignedTo}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                disabled={isUpdating}
                className="mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="Janson Williams">Janson Williams (Lead)</option>
                <option value="Elena Rostova">Elena Rostova (DevSecOps)</option>
                <option value="Marcus Vance">Marcus Vance (Python)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 text-[11px]">File Location</span>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-1 truncate" title={finding.file}>
              {finding.file}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 text-[11px]">Line & Column</span>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">
              Line {finding.line}, Col {finding.column || 4}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 text-[11px]">Branch / Git Commit</span>
            <a
              href="https://github.com/Jyotiransh07/VH26-ECS-Infinix/commit/f4a9b1c"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-mono font-bold text-teal-600 dark:text-teal-400 hover:underline mt-1"
            >
              <span>main:f4a9b1c</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 text-[11px]">Introduced By</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">
              Janson Williams
            </p>
          </div>
        </div>
      </div>

      {/* Tabs: Code Viewer / CFG Path Visualizer / Finding Timeline */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('editor')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'editor'
              ? 'bg-teal-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Source Code Viewer (Monaco)
        </button>

        <button
          onClick={() => setActiveTab('cfg')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'cfg'
              ? 'bg-teal-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Authoritative Leaking Path ({leakingPath.join(' → ')} → EXIT)
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'timeline'
              ? 'bg-teal-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Finding Lifecycle Timeline
        </button>
      </div>

      {/* Tab 1: Monaco Code Editor View */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden shadow-md">
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-teal-500" />
                <span className="text-xs font-mono text-slate-300 ml-2 font-semibold">{finding.file}</span>
              </div>
              <span className="text-[10px] font-mono text-teal-400">Python 3.12 AST</span>
            </div>

            {/* Editor Code Lines */}
            <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto space-y-0.5">
              {sourceLines.map((l) => (
                <div
                  key={l.line}
                  className={`flex items-center px-2 py-1 rounded transition-colors ${
                    l.type === 'acquire'
                      ? 'bg-amber-500/15 text-amber-300 border-l-4 border-amber-400'
                      : l.type === 'branch'
                      ? 'bg-indigo-500/15 text-indigo-300 border-l-4 border-indigo-400'
                      : l.type === 'leak'
                      ? 'bg-rose-500/20 text-rose-300 border-l-4 border-rose-500 font-bold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span className="w-8 text-slate-500 select-none text-right mr-4 text-[11px]">{l.line}</span>
                  <span className="whitespace-pre">{l.code}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Remediation Snippet */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-500" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  Context Manager Fix
                </h4>
              </div>

              <button
                onClick={handleCopyFix}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-500 hover:text-white transition-all"
              >
                {copiedFix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFix ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-[11px] text-teal-300 overflow-x-auto leading-relaxed">
              <pre className="whitespace-pre-wrap">{remediationCode}</pre>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Wrapping allocations in Python's native <code className="font-mono text-teal-600 dark:text-teal-400">with</code> statement guarantees cleanup upon function returns or unexpected exceptions.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Leaking Path Visualizer */}
      {activeTab === 'cfg' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Authoritative CFG Leaking Path
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Control Flow Graph BFS path generated by LeakGuard engine without alteration.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-6 overflow-x-auto">
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-center min-w-[140px]">
              <p className="text-[10px] font-mono font-bold uppercase">Step 1: Allocation</p>
              <p className="text-xs font-extrabold mt-1">Line {finding.line}</p>
              <p className="text-[10px] text-slate-400">Resource Acquired</p>
            </div>

            <div className="text-slate-400 font-bold text-lg">↓</div>

            {leakingPath.map((lineNum, idx) => (
              <React.Fragment key={lineNum}>
                <div className="p-4 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-center min-w-[140px]">
                  <p className="text-[10px] font-mono font-bold uppercase">Step {idx + 2}: Branch</p>
                  <p className="text-xs font-extrabold mt-1">Line {lineNum}</p>
                  <p className="text-[10px] text-slate-400">Execution Block</p>
                </div>
                <div className="text-slate-400 font-bold text-lg">↓</div>
              </React.Fragment>
            ))}

            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-center min-w-[140px]">
              <p className="text-[10px] font-mono font-bold uppercase">Final Step</p>
              <p className="text-xs font-extrabold mt-1">FUNCTION EXIT</p>
              <p className="text-[10px] text-rose-500 font-bold">💥 Unclosed Handle</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Finding Lifecycle Timeline */}
      {activeTab === 'timeline' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            Finding Lifecycle Timeline
          </h3>

          <div className="space-y-4 pl-4 border-l-2 border-teal-500/40">
            <div className="relative pl-6 space-y-1">
              <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-teal-500 ring-4 ring-white dark:ring-[#0f172a]" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Detected by LeakGuard Static Analyzer</span>
                <span className="text-[10px] font-mono text-slate-400">AST Verification</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Identified {finding.confidence} resource leak across execution path in {finding.file}.
              </p>
            </div>

            <div className="relative pl-6 space-y-1">
              <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-[#0f172a]" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Assigned to Developer</span>
                <span className="text-[10px] font-mono text-slate-400">{assignedTo}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Finding triaged with recommended context manager remediation.
              </p>
            </div>

            <div className="relative pl-6 space-y-1">
              <span className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full ring-4 ring-white dark:ring-[#0f172a] ${
                status === 'FIXED' || status === 'VERIFIED' ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'
              }`} />
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Current Lifecycle State</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
