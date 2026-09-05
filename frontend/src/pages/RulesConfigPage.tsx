import React from 'react';

export const RulesConfigPage: React.FC = () => {
  const rules = [
    {
      id: 'LG001',
      name: 'Unclosed File Descriptor',
      target: 'open(), io.open(), pathlib.Path.open()',
      description: 'Flags file descriptors allocated without deterministic close() or with-statement guarantee.',
      severity: 'HIGH',
      cleanup: 'with open(...) as f: or f.close()'
    },
    {
      id: 'LG002',
      name: 'Unclosed Network Socket',
      target: 'socket.socket(), socket.create_connection()',
      description: 'Flags network sockets that remain open on exception paths or missing close().',
      severity: 'HIGH',
      cleanup: 'try...finally: s.close()'
    },
    {
      id: 'LG003',
      name: 'Database Connection Pool Leak',
      target: 'sqlite3.connect(), psycopg2.connect()',
      description: 'Flags unclosed database connections and unreleased connection cursors.',
      severity: 'MEDIUM',
      cleanup: 'with sqlite3.connect(...) as conn:'
    },
    {
      id: 'LG004',
      name: 'Unreleased Thread Lock',
      target: 'threading.Lock(), threading.RLock()',
      description: 'Flags synchronization mutexes acquired without with-lock block.',
      severity: 'MEDIUM',
      cleanup: 'with lock:'
    }
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="pb-2 border-b border-slate-100 dark:border-slate-800/60">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Detection Rules
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Resource lifecycle rules evaluated by the LeakGuard static engine.
        </p>
      </div>

      <div className="space-y-3">
        {rules.map(rule => (
          <div
            key={rule.id}
            className="p-4 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-800/80 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">
                  {rule.id}
                </span>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                  {rule.name}
                </h3>
              </div>
              <span className="font-mono text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                {rule.severity}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {rule.description}
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Target: {rule.target}</span>
              <span className="text-teal-600 dark:text-teal-400">Fix: {rule.cleanup}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
