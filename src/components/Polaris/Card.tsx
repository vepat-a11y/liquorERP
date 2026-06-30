import React from 'react';

interface CardProps {
  title?: string;
  titleAction?: React.ReactNode;
  children: React.ReactNode;
  sectioned?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  titleAction,
  children,
  sectioned = true,
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-[8px] shadow-xs overflow-hidden ${className}`}>
      {(title || titleAction) && (
        <div className="px-5 py-4 border-b border-zinc-150 dark:border-zinc-850 flex items-center justify-between">
          {title && <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-sans tracking-tight">{title}</h2>}
          {titleAction && <div className="text-xs text-[#008060] font-medium hover:underline">{titleAction}</div>}
        </div>
      )}
      <div className={sectioned ? 'p-5 space-y-4' : ''}>
        {children}
      </div>
    </div>
  );
};

export const CardSection: React.FC<{ children: React.ReactNode; title?: string; className?: string }> = ({
  children,
  title,
  className = '',
}) => {
  return (
    <div className={`border-b border-zinc-100 dark:border-zinc-850 last:border-0 pb-4 last:pb-0 ${className}`}>
      {title && <h3 className="text-xs font-semibold text-zinc-550 dark:text-zinc-400 mb-3 uppercase tracking-wider">{title}</h3>}
      {children}
    </div>
  );
};
