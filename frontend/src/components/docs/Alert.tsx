import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert } from '@/components/icons';

interface AlertProps {
  type?: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children
}) => {
  const styles = {
    info: {
      container: 'bg-teal-500/10 border-teal-500/30 text-teal-900 dark:text-teal-200',
      icon: <AlertCircle className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />,
      title: 'text-teal-900 dark:text-teal-100',
      defaultTitle: 'Note'
    },
    warning: {
      container: 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
      title: 'text-amber-900 dark:text-amber-100',
      defaultTitle: 'Warning'
    },
    success: {
      container: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
      title: 'text-emerald-900 dark:text-emerald-100',
      defaultTitle: 'Success'
    },
    error: {
      container: 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200',
      icon: <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />,
      title: 'text-rose-900 dark:text-rose-100',
      defaultTitle: 'Important'
    }
  }[type];

  return (
    <div className={`my-5 p-4 rounded-xl border flex items-start gap-3 text-sm leading-relaxed ${styles.container}`}>
      {styles.icon}
      <div className="flex-1 space-y-1">
        {title && <h5 className={`font-semibold ${styles.title}`}>{title}</h5>}
        <div className="text-[13px] opacity-90">{children}</div>
      </div>
    </div>
  );
};
