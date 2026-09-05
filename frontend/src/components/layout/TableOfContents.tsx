import React from 'react';
import { TocItem } from '../../types/docs';

interface TableOfContentsProps {
  toc: TocItem[];
  activeId?: string;
  onSelectHeading?: (id: string) => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  toc,
  activeId,
  onSelectHeading
}) => {
  if (!toc || toc.length === 0) return null;

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (onSelectHeading) onSelectHeading(id);
  };

  return (
    <div className="hidden xl:block w-60 shrink-0 sticky top-24 self-start pl-6 border-l border-slate-200 dark:border-slate-800 text-xs">
      <h5 className="font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono text-[11px] mb-3">
        On This Page
      </h5>
      <ul className="space-y-2">
        {toc.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id} style={{ marginLeft: `${((item.level || 2) - 2) * 12}px` }}>
              <button
                onClick={() => handleScroll(item.id)}
                className={`text-left transition-colors hover:text-teal-600 dark:hover:text-teal-400 leading-snug ${
                  isActive
                    ? 'text-teal-600 dark:text-teal-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {item.title}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
