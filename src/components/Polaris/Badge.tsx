import React from 'react';

export type BadgeTone = 'success' | 'info' | 'warning' | 'attention' | 'critical' | 'default';

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
}

export const Badge: React.FC<BadgeProps> = ({ children, tone = 'default' }) => {
  const baseClasses = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border font-sans select-none tracking-tight";
  
  const toneClasses: Record<BadgeTone, string> = {
    success: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
    info: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
    warning: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
    attention: "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-900/30",
    critical: "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/30",
    default: "bg-zinc-50 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
  };

  return (
    <span className={`${baseClasses} ${toneClasses[tone]}`}>
      {children}
    </span>
  );
};
