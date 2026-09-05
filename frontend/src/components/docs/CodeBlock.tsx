import React, { useState } from 'react';
import { Copy, Check, Terminal } from '@/components/icons';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'bash',
  filename,
  showLineNumbers = false
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split('\n');

  return (
    <div className="my-5 rounded-xl border border-slate-700/60 bg-[#111827] text-slate-200 overflow-hidden shadow-sm">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1f293d] border-b border-slate-700/60 text-xs">
        <div className="flex items-center gap-2">
          {language === 'bash' || language === 'shell' ? (
            <Terminal className="w-3.5 h-3.5 text-teal-400" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-teal-400" />
          )}
          <span className="font-mono font-medium text-slate-300">
            {filename || language.toUpperCase()}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-teal-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed custom-scrollbar">
        {showLineNumbers ? (
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="pr-4 text-right select-none text-slate-600 w-8">
                    {idx + 1}
                  </td>
                  <td className="whitespace-pre text-slate-200">{line || ' '}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <pre className="whitespace-pre text-slate-200">{code.trim()}</pre>
        )}
      </div>
    </div>
  );
};
