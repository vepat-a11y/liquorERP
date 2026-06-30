import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageAction {
  content: string;
  onAction?: () => void;
  primary?: boolean;
  disabled?: boolean;
  destructive?: boolean;
}

interface PageProps {
  title: string;
  backUrl?: string;
  onBack?: () => void;
  titleMetadata?: React.ReactNode;
  primaryAction?: PageAction;
  secondaryActions?: PageAction[];
  children: React.ReactNode;
}

export const Page: React.FC<PageProps> = ({
  title,
  backUrl,
  onBack,
  titleMetadata,
  primaryAction,
  secondaryActions,
  children,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      navigate(backUrl);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {(backUrl || onBack) && (
            <button
              onClick={handleBack}
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-350 transition cursor-pointer"
              title="Go back"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
          )}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{title}</h1>
              {titleMetadata && <div className="flex items-center">{titleMetadata}</div>}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {secondaryActions?.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onAction}
              disabled={action.disabled}
              className={`px-3 py-1.5 border border-zinc-250 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-xs font-semibold text-zinc-700 dark:text-zinc-200 rounded-md shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                action.destructive ? 'text-rose-600 dark:text-rose-400 border-rose-200 hover:bg-rose-50' : ''
              }`}
            >
              {action.content}
            </button>
          ))}
          {primaryAction && (
            <button
              onClick={primaryAction.onAction}
              disabled={primaryAction.disabled}
              className="px-3 py-1.5 bg-[#008060] hover:bg-[#006e52] text-xs font-semibold text-white rounded-md shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {primaryAction.content}
            </button>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

export const LayoutGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {children}
    </div>
  );
};

export const LayoutSection: React.FC<{ children: React.ReactNode; secondary?: boolean }> = ({
  children,
  secondary = false,
}) => {
  return (
    <div className={secondary ? 'lg:col-span-4 space-y-5' : 'lg:col-span-8 space-y-5'}>
      {children}
    </div>
  );
};
