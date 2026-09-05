import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  RefreshCw, 
  Plus, 
  Download, 
  FileText, 
  FolderGit2, 
  GitBranch, 
  Sliders, 
  ArrowRight,
  Sparkles,
  ExternalLink,
  Code
} from '@/components/icons';
import { BaselineSnapshot, BaselineComparisonResult, BaselineFinding, Severity } from '../types';
import { api } from '../services/api';

interface BaselinePageProps {
  onInvestigateFinding?: (findingId: string) => void;
}

export const BaselinePage: React.FC<BaselinePageProps> = ({ onInvestigateFinding }) => {
  const [baselines, setBaselines] = useState<BaselineSnapshot[]>([]);
  const [selectedBaselineId, setSelectedBaselineId] = useState<string>('');
  const [diffResult, setDiffResult] = useState<BaselineComparisonResult | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'NEW' | 'BASELINE' | 'RESOLVED'>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newBaselineName, setNewBaselineName] = useState<string>('');
  const [newBaselineDesc, setNewBaselineDesc] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);

  const loadBaselines = async () => {
    setLoading(true);
    try {
      const list = await api.getBaselines();
      setBaselines(list);
      if (list.length > 0 && !selectedBaselineId) {
        setSelectedBaselineId(list[0].id);
      }
    } catch (e) {
      console.error('Failed to load baselines', e);
    } finally {
      setLoading(false);
    }
  };

  const loadComparison = async (bId: string) => {
    if (!bId) return;
    setLoading(true);
    try {
      const res = await api.compareBaseline(bId);
      setDiffResult(res);
    } catch (e) {
      console.error('Failed to compare baseline', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBaselines();
  }, []);

  useEffect(() => {
    if (selectedBaselineId) {
      loadComparison(selectedBaselineId);
    }
  }, [selectedBaselineId]);

  const handleCreateBaseline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBaselineName.trim()) return;
    setCreating(true);
    try {
      const created = await api.createBaseline({
        name: newBaselineName,
        repository_name: 'sample-repo-python',
        description: newBaselineDesc
      });
      if (created) {
        setIsCreateModalOpen(false);
        setNewBaselineName('');
        setNewBaselineDesc('');
        await loadBaselines();
        setSelectedBaselineId(created.id);
      }
    } catch (e) {
      console.error('Failed to create baseline', e);
    } finally {
      setCreating(false);
    }
  };

  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-900/50">LOW</span>;
    }
  };

  const getDifferentialBadge = (status?: string) => {
    switch (status) {
      case 'NEW_REGRESSION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" />
            NEW REGRESSION
          </span>
        );
      case 'RESOLVED_FIXED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            RESOLVED / FIXED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Layers className="w-3 h-3" />
            BASELINE UNCHANGED
          </span>
        );
    }
  };

  // Combine or filter findings based on activeTab
  const getDisplayFindings = (): BaselineFinding[] => {
    if (!diffResult) return [];
    switch (activeTab) {
      case 'NEW':
        return diffResult.new_findings;
      case 'BASELINE':
        return diffResult.baseline_findings;
      case 'RESOLVED':
        return diffResult.resolved_findings;
      default:
        return [
          ...diffResult.new_findings,
          ...diffResult.baseline_findings,
          ...diffResult.resolved_findings
        ];
    }
  };

  const displayFindings = getDisplayFindings();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Baseline Differential & Quality Gate</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-900/40">
              CI Differential Engine Active
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compare live AST scan results against accepted release baselines to distinguish legacy debt from new blocking leaks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Baseline Selector */}
          <select
            value={selectedBaselineId}
            onChange={(e) => setSelectedBaselineId(e.target.value)}
            className="px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-teal-500 shadow-sm"
          >
            {baselines.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.findings?.length || 0} findings)
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Set New Baseline
          </button>
        </div>
      </div>

      {/* 3 Core Differential Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. New Findings (Regressions) */}
        <div 
          onClick={() => setActiveTab('NEW')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'NEW' 
              ? 'bg-rose-500/10 border-rose-500/50 shadow-md ring-1 ring-rose-500/30' 
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-rose-400/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">New Regressions (Blockers)</span>
            <span className="p-1.5 rounded-lg bg-rose-500/15 text-rose-500">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {diffResult?.summary.new_findings_count ?? 0}
            </span>
            <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Must Fix in PR</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Leaks introduced since baseline snapshot was established.
          </p>
        </div>

        {/* 2. Baseline Findings (Legacy Unchanged) */}
        <div 
          onClick={() => setActiveTab('BASELINE')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'BASELINE' 
              ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30' 
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-amber-400/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Baseline Findings (Legacy)</span>
            <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {diffResult?.summary.baseline_findings_count ?? 0}
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Accepted Technical Debt</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Existing leaks recorded in baseline that remain present in codebase.
          </p>
        </div>

        {/* 3. Resolved Findings (Fixed) */}
        <div 
          onClick={() => setActiveTab('RESOLVED')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'RESOLVED' 
              ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30' 
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Resolved Leaks (Fixed)</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {diffResult?.summary.resolved_findings_count ?? 0}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Successfully Eliminated</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Leaks that were present in baseline but have been cleaned up and verified.
          </p>
        </div>
      </div>

      {/* Differential Filter Tabs Bar */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'ALL'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Differential Findings ({displayFindings.length})
          </button>
          <button
            onClick={() => setActiveTab('NEW')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'NEW'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            🔴 New Regressions ({diffResult?.summary.new_findings_count ?? 0})
          </button>
          <button
            onClick={() => setActiveTab('BASELINE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'BASELINE'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            🟡 Baseline ({diffResult?.summary.baseline_findings_count ?? 0})
          </button>
          <button
            onClick={() => setActiveTab('RESOLVED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'RESOLVED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            🟢 Resolved ({diffResult?.summary.resolved_findings_count ?? 0})
          </button>
        </div>

        <button
          onClick={() => selectedBaselineId && loadComparison(selectedBaselineId)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Recompute Diff
        </button>
      </div>

      {/* Differential Findings Table (Brisk Design) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Differential Status</th>
                <th className="py-3.5 px-4">File & Line</th>
                <th className="py-3.5 px-4">Resource Type</th>
                <th className="py-3.5 px-4">Variable</th>
                <th className="py-3.5 px-4">Severity / Confidence</th>
                <th className="py-3.5 px-4">Diagnosis / Reason</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-500" />
                    Computing AST baseline comparison...
                  </td>
                </tr>
              ) : displayFindings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                    No findings in this differential category!
                  </td>
                </tr>
              ) : (
                displayFindings.map((f, idx) => (
                  <tr 
                    key={f.fingerprint || `${f.file}-${f.line}-${idx}`}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      {getDifferentialBadge(f.differential_status)}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                      <span className="text-teal-600 dark:text-teal-400">{f.file}</span>
                      <span className="text-slate-400">:{f.line}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {f.resource_type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      '{f.variable_name}'
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {getSeverityBadge(f.severity)}
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {f.confidence}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600 dark:text-slate-400" title={f.reason}>
                      {f.reason}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onInvestigateFinding && onInvestigateFinding(f.fingerprint || f.file)}
                        className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Baseline Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Capture Current Scan as Baseline</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBaseline} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Baseline Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Release v1.1.0 Golden Baseline"
                  value={newBaselineName}
                  onChange={(e) => setNewBaselineName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Release Note
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Baseline snapshot capturing accepted legacy leaks before refactoring."
                  value={newBaselineDesc}
                  onChange={(e) => setNewBaselineDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                ℹ️ Establishing a baseline locks in all current open findings as accepted legacy technical debt. Subsequent PRs and CI scans will only fail on newly introduced leaks.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newBaselineName.trim()}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-50"
                >
                  {creating ? 'Establishing...' : 'Save Baseline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
