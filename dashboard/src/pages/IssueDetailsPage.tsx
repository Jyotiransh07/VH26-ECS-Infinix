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
  ChevronRight
} from '@/components/icons';
import { IssueFinding } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { WhyFlaggedCard } from '../components/issues/WhyFlaggedCard';
import { CodeViewer } from '../components/issues/CodeViewer';
import { CFGGraph } from '../components/issues/CFGGraph';

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

  // Suggested code remediation snippet
  const remediationCode = finding.resource_type === 'file'
    ? `# Recommended Fix using Python Context Manager\nwith open(data_path, 'r') as ${finding.variable_name}:\n    header = ${finding.variable_name}.readline()\n    if not is_valid:\n        return None\n    content = ${finding.variable_name}.read()\n    return content\n# Resource is guaranteed to close automatically on all exit paths!`
    : finding.resource_type === 'sqlite_connection'
    ? `# Recommended Fix for Database Connections\nimport sqlite3\n\ndef query_database(db_path):\n    with sqlite3.connect(db_path) as conn:\n        cursor = conn.cursor()\n        cursor.execute("SELECT * FROM sensitive_records")\n        return cursor.fetchall()\n    # Automatically closes connection on return or exception`
    : `# Recommended Fix using try...finally\n${finding.variable_name} = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\ntry:\n    ${finding.variable_name}.connect(("telemetry.internal", 9000))\n    ${finding.variable_name}.sendall(payload)\nfinally:\n    ${finding.variable_name}.close() # Guaranteed cleanup`;

  const handleCopyFix = () => {
    navigator.clipboard.writeText(remediationCode);
    setCopiedFix(true);
    setTimeout(() => setCopiedFix(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Back Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Issues
          </Button>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Issues</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-zinc-300 font-mono">{finding.id}</span>
          </div>
        </div>

        {onReScan && (
          <Button variant="secondary" size="sm" onClick={onReScan} icon={<RefreshCw className="w-4 h-4" />}>
            Re-scan Target
          </Button>
        )}
      </div>

      {/* Header Card */}
      <div className="card-elevated p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold text-white font-mono">
                {finding.file}:{finding.line}
              </h2>
              <Badge variant="severity" value={finding.severity} />
              <Badge variant="confidence" value={finding.confidence} />
            </div>
            <p className="text-sm text-zinc-300">
              {finding.reason}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#0f121a] border border-white/5 flex items-center gap-4 text-xs">
            <div>
              <p className="text-zinc-500 uppercase font-semibold text-[10px]">CI Impact</p>
              <p className="font-bold text-rose-400">BLOCKED</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-zinc-500 uppercase font-semibold text-[10px]">Confidence</p>
              <p className="font-bold text-white font-mono">{finding.confidence}</p>
            </div>
          </div>
        </div>

        {/* Resource Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-card-highlight border border-white/5">
            <p className="text-zinc-400 uppercase font-semibold text-[10px]">Resource Type</p>
            <p className="font-mono font-bold text-white mt-1 capitalize">{finding.resource_type}</p>
          </div>
          <div className="p-3 rounded-xl bg-card-highlight border border-white/5">
            <p className="text-zinc-400 uppercase font-semibold text-[10px]">Tracked Variable</p>
            <p className="font-mono font-bold text-primary-light mt-1">{finding.variable_name}</p>
          </div>
          <div className="p-3 rounded-xl bg-card-highlight border border-white/5">
            <p className="text-zinc-400 uppercase font-semibold text-[10px]">Opened Location</p>
            <p className="font-mono font-bold text-white mt-1">Line {finding.line}</p>
          </div>
          <div className="p-3 rounded-xl bg-card-highlight border border-white/5">
            <p className="text-zinc-400 uppercase font-semibold text-[10px]">Expected Cleanup</p>
            <p className="font-mono font-bold text-emerald-400 mt-1">{finding.variable_name}.close()</p>
          </div>
        </div>
      </div>

      {/* Signature Feature: "Why was this flagged?" */}
      <WhyFlaggedCard finding={finding} />

      {/* Control Flow Graph Visualizer */}
      <CFGGraph nodes={finding.cfg_nodes} finding={finding} />

      {/* Diagnostic Code Viewer */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Source Code Diagnostics</h3>
          <p className="text-xs text-zinc-400">Exact source location with highlighted acquisition and leak branch</p>
        </div>
        <CodeViewer
          filePath={finding.file}
          codeSnippet={finding.code_snippet}
          startLine={finding.snippet_start_line || 1}
          highlightLine={finding.line}
          pathLines={finding.path}
        />
      </div>

      {/* Remediation & Suggested Fix */}
      <div className="card-elevated p-6 space-y-4 border border-emerald-500/20 bg-gradient-to-br from-[#0c1618] to-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Suggested Remediation</h3>
              <p className="text-xs text-zinc-400">Canonical pattern recommended by LeakGuard engine</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyFix}
            icon={copiedFix ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copiedFix ? "Copied Fix" : "Copy Solution"}
          </Button>
        </div>

        <p className="text-xs text-zinc-300">
          {finding.suggestion}
        </p>

        <div className="rounded-xl border border-white/10 bg-[#0d1017] p-4 font-mono text-xs overflow-x-auto text-emerald-300 custom-scrollbar">
          <pre>{remediationCode}</pre>
        </div>
      </div>
    </div>
  );
};
