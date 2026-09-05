import React, { useState } from 'react';
import { Play, CheckCircle2, ShieldAlert, GitFork, Loader2, ArrowRight, Download, Copy, Check } from '@/components/icons';
import { api } from '../../services/api';
import { ScanResult, IssueFinding } from '../../types';
import { Badge } from '../common/Badge';
import { CFGGraph } from '../issues/CFGGraph';
import { CodeViewer } from '../issues/CodeViewer';

export const LiveScannerWidget: React.FC = () => {
  const [target, setTarget] = useState('sample-repo-python');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<IssueFinding | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'cfg' | 'code'>('overview');

  const handleRunScan = async () => {
    setLoading(true);
    try {
      const res = await api.triggerScan(target);
      setScanResult(res);
      if (res.findings.length > 0) {
        setSelectedFinding(res.findings[0]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="my-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm overflow-hidden">
      {/* Widget Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#131d36] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Live Static Analysis Sandbox
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Test the LeakGuard AST parser and Control Flow Graph generator in real-time
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
          >
            <option value="sample-repo-python">sample-repo-python (6 files)</option>
            <option value="demo-project">demo-project (1 file)</option>
            <option value="leakguard">leakguard (Core Engine)</option>
          </select>

          <button
            onClick={handleRunScan}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {loading ? "Analyzing AST..." : "Run Scanner"}
          </button>
        </div>
      </div>

      {/* Widget Content */}
      <div className="p-6">
        {!scanResult && !loading ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Select a target repository above and click <strong className="text-teal-600 dark:text-teal-400">Run Scanner</strong> to execute live static leak analysis.
          </div>
        ) : loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Parsing AST nodes & building control-flow graph...
            </p>
          </div>
        ) : (
          scanResult && (
            <div className="space-y-6">
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Files Scanned</span>
                  <p className="font-bold text-base text-slate-900 dark:text-white mt-0.5">{scanResult.summary.files_scanned}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Resources Tracked</span>
                  <p className="font-bold text-base text-slate-900 dark:text-white mt-0.5">{scanResult.summary.resources_detected}</p>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                  <span className="text-[10px] uppercase font-semibold">Definite Leaks</span>
                  <p className="font-bold text-base mt-0.5">{scanResult.summary.definite_leaks}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <span className="text-[10px] uppercase font-semibold">CI Status</span>
                  <p className="font-bold text-base mt-0.5">{scanResult.status}</p>
                </div>
              </div>

              {/* Findings Selector */}
              {scanResult.findings.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Discovered Leak Issues ({scanResult.findings.length})
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                          activeTab === 'overview'
                            ? 'bg-teal-600 text-white'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Details
                      </button>
                      <button
                        onClick={() => setActiveTab('cfg')}
                        className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                          activeTab === 'cfg'
                            ? 'bg-teal-600 text-white'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        CFG Graph
                      </button>
                      <button
                        onClick={() => setActiveTab('code')}
                        className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                          activeTab === 'code'
                            ? 'bg-teal-600 text-white'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Source Code
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {scanResult.findings.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFinding(f)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedFinding?.id === f.id
                            ? 'border-teal-500 bg-teal-500/10'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                            {f.file}:{f.line}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {f.resource_type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {f.reason}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Active Tab View */}
                  {selectedFinding && (
                    <div className="pt-2">
                      {activeTab === 'overview' && (
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#131a2c] border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900 dark:text-white">Why was this flagged?</span>
                            <span className="font-mono text-rose-500 font-bold">{selectedFinding.confidence} LEAK</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {selectedFinding.why_flagged || selectedFinding.reason}
                          </p>
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 font-mono text-[11px] text-teal-600 dark:text-teal-400">
                            Suggested Fix: {selectedFinding.suggestion}
                          </div>
                        </div>
                      )}

                      {activeTab === 'cfg' && (
                        <CFGGraph nodes={selectedFinding.cfg_nodes} finding={selectedFinding} />
                      )}

                      {activeTab === 'code' && (
                        <CodeViewer
                          filePath={selectedFinding.file}
                          codeSnippet={selectedFinding.code_snippet}
                          startLine={selectedFinding.snippet_start_line || 1}
                          highlightLine={selectedFinding.line}
                          pathLines={selectedFinding.path}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};
