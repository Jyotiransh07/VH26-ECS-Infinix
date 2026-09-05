import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Code, 
  ShieldCheck, 
  Terminal, 
  FileJson,
  Layers
} from '@/components/icons';
import { Button } from '../components/common/Button';
import { ReportData, ScanResult } from '../types';
import { api } from '../services/api';

interface ReportsPageProps {
  scans: ScanResult[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ scans }) => {
  const [selectedScanId, setSelectedScanId] = useState<string>(scans[0]?.id || 'scan-sample-01');
  const [activeFormat, setActiveFormat] = useState<'json' | 'sarif' | 'text'>('json');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (scans.length > 0 && !scans.some(s => s.id === selectedScanId)) {
      setSelectedScanId(scans[0].id);
    }
  }, [scans, selectedScanId]);

  useEffect(() => {
    if (!selectedScanId) return;
    setLoading(true);
    api.getReport(selectedScanId, activeFormat).then((res) => {
      setReportData(res);
      setLoading(false);
    });
  }, [selectedScanId, activeFormat]);

  const handleCopy = () => {
    if (!reportData) return;
    navigator.clipboard.writeText(reportData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!reportData) return;
    const blob = new Blob([reportData.content], { type: reportData.mime_type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = reportData.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Compliance & Reports Hub</h2>
          <p className="text-sm text-zinc-400">
            Export machine-readable JSON, OASIS SARIF v2.1.0 for GitHub Code Scanning, and text summaries
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedScanId}
            onChange={(e) => setSelectedScanId(e.target.value)}
            className="bg-card-elevated border border-white/10 rounded-xl px-4 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-primary/50"
          >
            {scans.map((s) => (
              <option key={s.id} value={s.id}>
                {s.project_name} ({s.id}) - {s.status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Format Selector Pills & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card-elevated border border-white/5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFormat('json')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeFormat === 'json'
                ? 'bg-primary text-white shadow-glow'
                : 'bg-[#10131c] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileJson className="w-4 h-4" />
            JSON (Machine Readable)
          </button>

          <button
            onClick={() => setActiveFormat('sarif')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeFormat === 'sarif'
                ? 'bg-primary text-white shadow-glow'
                : 'bg-[#10131c] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            SARIF (GitHub Code Scanning)
          </button>

          <button
            onClick={() => setActiveFormat('text')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeFormat === 'text'
                ? 'bg-primary text-white shadow-glow'
                : 'bg-[#10131c] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Console Output
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            icon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? "Copied" : "Copy Payload"}
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            icon={<Download className="w-4 h-4" />}
          >
            Download Report
          </Button>
        </div>
      </div>

      {/* Format Info Note */}
      {activeFormat === 'sarif' && (
        <div className="p-4 rounded-xl bg-purple-950/20 border border-primary/30 flex items-center gap-3 text-xs text-primary-light">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <p>
            SARIF (Static Analysis Results Interchange Format) v2.1.0 can be directly uploaded to GitHub via <code className="font-mono bg-white/10 px-1.5 py-0.5 rounded">github/codeql-action/upload-sarif</code> to generate native GitHub Security Alerts on pull requests.
          </p>
        </div>
      )}

      {/* Report Code Viewer */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1017] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-[#131622] border-b border-white/5">
          <span className="font-mono text-xs font-semibold text-zinc-400">
            {reportData?.filename || 'report-preview'}
          </span>
          <span className="text-[11px] text-zinc-500 font-mono">
            {reportData?.content.length || 0} bytes
          </span>
        </div>

        <div className="p-5 font-mono text-xs text-zinc-300 overflow-x-auto max-h-[500px] custom-scrollbar">
          {loading ? (
            <p className="text-zinc-500 text-center py-8">Generating report...</p>
          ) : (
            <pre className="whitespace-pre">{reportData?.content || 'No report available.'}</pre>
          )}
        </div>
      </div>
    </div>
  );
};
