import React, { useState } from 'react';
import { Copy, Check, FileCode, AlertCircle } from '@/components/icons';

interface CodeViewerProps {
  filePath: string;
  codeSnippet?: string;
  startLine?: number;
  highlightLine?: number;
  pathLines?: number[];
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  filePath,
  codeSnippet = '',
  startLine = 1,
  highlightLine,
  pathLines = []
}) => {
  const [copied, setCopied] = useState(false);

  const lines = codeSnippet ? codeSnippet.split('\n') : [];

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1017] overflow-hidden">
      {/* File Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#131622] border-b border-white/5">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-primary-light" />
          <span className="font-mono text-xs font-semibold text-zinc-300">{filePath}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Editor Body */}
      <div className="p-4 font-mono text-xs overflow-x-auto custom-scrollbar">
        {lines.length === 0 ? (
          <p className="text-zinc-500 italic py-4 text-center">No source snippet available.</p>
        ) : (
          <div className="space-y-1">
            {lines.map((lineText, idx) => {
              const currentLineNumber = startLine + idx;
              const isAcquisition = currentLineNumber === highlightLine;
              const isPath = pathLines.includes(currentLineNumber);

              let rowClass = 'flex items-start px-2 py-0.5 rounded transition-colors';
              let badge = null;

              if (isAcquisition) {
                rowClass += ' bg-primary/20 text-white border-l-2 border-primary';
                badge = (
                  <span className="ml-3 text-[10px] font-sans font-semibold px-2 py-0.2 rounded bg-primary/30 text-primary-light border border-primary/40 shrink-0">
                    Acquisition Point
                  </span>
                );
              } else if (isPath) {
                rowClass += ' bg-rose-500/15 text-rose-200 border-l-2 border-rose-500';
                badge = (
                  <span className="ml-3 text-[10px] font-sans font-semibold px-2 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Leaking Path
                  </span>
                );
              } else {
                rowClass += ' text-zinc-300 hover:bg-white/5';
              }

              return (
                <div key={idx} className={rowClass}>
                  <span className="w-10 text-right pr-4 text-zinc-600 select-none shrink-0 font-mono text-[11px]">
                    {currentLineNumber}
                  </span>
                  <pre className="font-mono flex-1 whitespace-pre">{lineText || ' '}</pre>
                  {badge}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
