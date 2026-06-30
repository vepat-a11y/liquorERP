import React from 'react';

export interface Column {
  key: string;
  title: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  rows: any[];
  onRowClick?: (row: any) => void;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  onRowClick,
  isLoading = false,
  emptyState,
}) => {
  return (
    <div className="w-full overflow-x-auto relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-zinc-950/50 flex items-center justify-center z-10 py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-[#008060]"></div>
        </div>
      )}
      <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-3.5 px-4 font-semibold text-zinc-550 dark:text-zinc-400 select-none ${
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                }`}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 px-4 text-center">
                {emptyState || (
                  <span className="text-zinc-400 font-mono text-xs">No records available</span>
                )}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors duration-100 ${
                  onRowClick
                    ? 'hover:bg-zinc-50/60 dark:hover:bg-zinc-850/30 cursor-pointer'
                    : ''
                }`}
              >
                {columns.map((col) => {
                  const val = row[col.key];
                  return (
                    <td
                      key={col.key}
                      className={`py-3 px-4 font-sans text-zinc-700 dark:text-zinc-300 ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      }`}
                    >
                      {col.render ? col.render(val, row) : val !== undefined ? String(val) : '—'}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
