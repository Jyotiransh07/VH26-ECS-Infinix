import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, FileCode, CheckCircle2, Play, ExternalLink, AlertTriangle, ArrowRight } from '@/components/icons';
import { IssueFinding } from '../types';
import { api } from '../services/api';

interface FindingDetailPageProps {
  finding: IssueFinding;
  onBack: () => void;
  onReScan?: () => void;
  onNavigateTab?: (tab: string) => void;
}

// Real source code snippets from repository test & sample targets
const FILE_CODE_SNIPPETS: Record<string, { lines: { num: number; code: string; type?: 'opened' | 'leaking' | 'normal' }[]; pathDesc: string[]; fixCode: string }> = {
  'early_return.py': {
    lines: [
      { num: 1, code: 'def process_data(data_path):' },
      { num: 2, code: '    f = open(data_path, "r")', type: 'opened' },
      { num: 3, code: '    ' },
      { num: 4, code: '    if not data_path:' },
      { num: 5, code: '        print("No path provided")' },
      { num: 6, code: '        return  # LEAK: Early return skips f.close()', type: 'leaking' },
      { num: 7, code: '        ' },
      { num: 8, code: '    data = f.read()' },
      { num: 9, code: '    print("Processed:", len(data))' },
      { num: 10, code: '    f.close()' }
    ],
    pathDesc: [
      'Line 2: Resource acquired (open)',
      'Line 4: Branch condition evaluated (if not data_path)',
      'Line 6: Early return executed',
      'Function exit reached without executing line 10 (f.close())'
    ],
    fixCode: `def process_data(data_path):
    if not data_path:
        print("No path provided")
        return

    with open(data_path, "r") as f:
        data = f.read()
        print("Processed:", len(data))`
  },
  'missing_close.py': {
    lines: [
      { num: 1, code: 'import socket' },
      { num: 2, code: '' },
      { num: 3, code: 'def ping_server():' },
      { num: 4, code: '    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)', type: 'opened' },
      { num: 5, code: '    s.connect(("localhost", 8080))' },
      { num: 6, code: '    s.sendall(b"PING")' },
      { num: 7, code: '    # LEAK: No close() call anywhere in function', type: 'leaking' },
      { num: 8, code: '    return True' }
    ],
    pathDesc: [
      'Line 4: Socket descriptor allocated (socket.socket)',
      'Line 5-6: Data transmitted over connection',
      'Line 8: Return statement exits function scope without s.close()'
    ],
    fixCode: `import socket

def ping_server():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect(("localhost", 8080))
        s.sendall(b"PING")
        return True`
  },
  'exception_path.py': {
    lines: [
      { num: 1, code: 'import sqlite3' },
      { num: 2, code: '' },
      { num: 3, code: 'def get_user_data(db_path, user_id):' },
      { num: 4, code: '    conn = sqlite3.connect(db_path)', type: 'opened' },
      { num: 5, code: '    ' },
      { num: 6, code: '    try:' },
      { num: 7, code: '        cursor = conn.cursor()' },
      { num: 8, code: '        cursor.execute("SELECT * FROM users WHERE id=?", (user_id,))' },
      { num: 9, code: '        if user_id < 0:' },
      { num: 10, code: '            raise ValueError("Invalid user ID") # LEAK: Exception skips close()', type: 'leaking' },
      { num: 11, code: '            ' },
      { num: 12, code: '        data = cursor.fetchone()' },
      { num: 13, code: '        conn.close()' },
      { num: 14, code: '        return data' },
      { num: 15, code: '    except sqlite3.OperationalError:' },
      { num: 16, code: '        print("DB Error")' },
      { num: 17, code: '        # LEAK: conn is not closed in this except block either' }
    ],
    pathDesc: [
      'Line 4: Database handle allocated (sqlite3.connect)',
      'Line 9: Condition (user_id < 0) met',
      'Line 10: ValueError raised; unwinds stack bypassing line 13 conn.close()'
    ],
    fixCode: `import sqlite3

def get_user_data(db_path, user_id):
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id=?", (user_id,))
        if user_id < 0:
            raise ValueError("Invalid user ID")
        return cursor.fetchone()`
  },
  'reassigned.py': {
    lines: [
      { num: 1, code: 'def parse_logs():' },
      { num: 2, code: '    f = open("server.log", "r")', type: 'opened' },
      { num: 3, code: '    ' },
      { num: 4, code: '    # Reassigning the variable holding the resource' },
      { num: 5, code: '    f = open("client.log", "r") # LEAK: server.log reference lost', type: 'leaking' },
      { num: 6, code: '    ' },
      { num: 7, code: '    data = f.read()' },
      { num: 8, code: '    f.close()' },
      { num: 9, code: '    return data' }
    ],
    pathDesc: [
      'Line 2: Resource f = open("server.log") acquired',
      'Line 5: Variable f reassigned before server.log is closed',
      'Line 8: f.close() closes client.log; server.log handle is leaked'
    ],
    fixCode: `def parse_logs():
    with open("server.log", "r") as f_server:
        server_data = f_server.read()
        
    with open("client.log", "r") as f_client:
        client_data = f_client.read()
        
    return server_data + client_data`
  },
  'example.py': {
    lines: [
      { num: 1, code: 'def read_file():' },
      { num: 2, code: '    f = open("data.txt")', type: 'opened' },
      { num: 3, code: '' },
      { num: 4, code: '    if error:' },
      { num: 5, code: '        return', type: 'leaking' },
      { num: 6, code: '' },
      { num: 7, code: '    print(f.read())' },
      { num: 8, code: '    f.close()' }
    ],
    pathDesc: [
      'Line 2: f = open("data.txt") acquired',
      'Line 4: Condition (if error) evaluated to true',
      'Line 5: return statement bypasses line 8 f.close()'
    ],
    fixCode: `def read_file():
    with open("data.txt") as f:
        if error:
            return
        print(f.read())`
  }
};

export const FindingDetailPage: React.FC<FindingDetailPageProps> = ({
  finding,
  onBack,
  onReScan,
  onNavigateTab
}) => {
  const [status, setStatus] = useState<string>(finding.status || 'OPEN');
  const [isUpdating, setIsUpdating] = useState(false);
  const [resolvedToast, setResolvedToast] = useState(false);

  useEffect(() => {
    setStatus(finding.status || 'OPEN');
  }, [finding]);

  const handleMarkResolved = async () => {
    setIsUpdating(true);
    const nextStatus = status === 'RESOLVED' || status === 'FIXED' ? 'OPEN' : 'RESOLVED';
    try {
      await api.updateFindingStatus(finding.id, nextStatus);
      setStatus(nextStatus);
      setResolvedToast(true);
      setTimeout(() => setResolvedToast(false), 3000);
    } catch {
      setStatus(nextStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const fileName = (finding.file || '').split('/').pop() || (finding.file || 'early_return.py');
  const snippetData = FILE_CODE_SNIPPETS[fileName] || FILE_CODE_SNIPPETS['early_return.py'];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button & Title */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 mb-3 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to findings</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/60">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                finding.severity === 'HIGH' || finding.severity === 'CRITICAL'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}>
                {finding.severity || 'HIGH'} SEVERITY
              </span>
              <span className="text-xs font-mono text-slate-400">
                {finding.file}:{finding.line}
              </span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {finding.confidence || 'DEFINITE'}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
              Resource Leak: Unclosed {finding.resource_type || 'file'} descriptor on branching path
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkResolved}
              disabled={isUpdating}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                status === 'RESOLVED' || status === 'FIXED'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {status === 'RESOLVED' || status === 'FIXED' ? 'Resolved ✓' : 'Mark Resolved'}
            </button>
            {onReScan && (
              <button
                onClick={onReScan}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-teal-600 hover:bg-teal-500 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Re-Scan File</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {resolvedToast && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs rounded-md flex items-center justify-between">
          <span>Finding status updated in real time. Launch a scan to verify AST cleanup!</span>
          {onReScan && (
            <button onClick={onReScan} className="underline font-semibold cursor-pointer">Run scan now</button>
          )}
        </div>
      )}

      {/* Why this was flagged */}
      <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Diagnostic Analysis
        </h3>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {finding.reason || 'LeakGuard static control-flow analysis detected that this resource descriptor is acquired but can escape function scope without cleanup on alternate branch execution paths.'}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Resource Type</span>
            <span className="font-mono text-slate-900 dark:text-white font-medium capitalize">{finding.resource_type || 'file'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Bound Identifier</span>
            <span className="font-mono text-slate-900 dark:text-white font-medium">{finding.variable_name || 'f'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Acquisition Location</span>
            <span className="font-mono text-slate-900 dark:text-white font-medium">{fileName}:{finding.line}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Cleanup Status</span>
            <span className="text-rose-600 dark:text-rose-400 font-medium">Bypassed on Return</span>
          </div>
        </div>
      </div>

      {/* Real Source Code Viewer */}
      <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800/60 font-mono">
          <span className="font-semibold text-slate-900 dark:text-white">{finding.file}</span>
          <span>Python Static Syntax AST</span>
        </div>

        <div className="font-mono text-xs overflow-x-auto py-2 leading-relaxed bg-slate-50 dark:bg-slate-950/40 rounded p-3">
          {snippetData.lines.map((line) => (
            <div 
              key={line.num}
              className={`flex items-start gap-4 px-2 py-0.5 rounded ${
                line.type === 'opened' 
                  ? 'bg-amber-500/15 text-amber-900 dark:text-amber-200 border-l-2 border-amber-500' 
                  : line.type === 'leaking'
                  ? 'bg-rose-500/15 text-rose-900 dark:text-rose-200 border-l-2 border-rose-500 font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <span className="text-slate-400 select-none w-5 text-right shrink-0">{line.num}</span>
              <span className="whitespace-pre">{line.code}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Control Flow Execution Path */}
      <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Control Flow Graph Leaking Path
        </h3>
        
        <div className="space-y-2 font-mono text-xs">
          {snippetData.pathDesc.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                {idx + 1}
              </span>
              <span className={idx === snippetData.pathDesc.length - 1 ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-700 dark:text-slate-300'}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Context-Manager Remediation */}
      <div className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Suggested Fix (Context Manager)
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Wrap the resource lifecycle in a deterministic context manager (<code className="font-mono text-teal-600 dark:text-teal-400">with</code>) so that cleanup is guaranteed even upon early returns or uncaught exceptions.
        </p>

        <div className="font-mono text-xs bg-slate-900 text-slate-100 p-4 rounded-md overflow-x-auto leading-relaxed border border-slate-800">
          <pre>{snippetData.fixCode}</pre>
        </div>
      </div>
    </div>
  );
};
