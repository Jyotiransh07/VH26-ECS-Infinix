import React, { useState, useEffect } from 'react';
import { Search, X, ChevronRight, FileText } from '@/components/icons';
import { SearchResult } from '../../types/docs';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (sectionId: string) => void;
  searchIndex: SearchResult[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  searchIndex
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim() === ''
    ? searchIndex.slice(0, 6)
    : searchIndex.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        item.snippet.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documentation, guides, and APIs..."
            autoFocus
            className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 custom-scrollbar space-y-1">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">
              No documentation found matching "{query}"
            </p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.sectionId + item.title}
                onClick={() => {
                  onSelect(item.sectionId);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 font-mono">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {item.snippet}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
