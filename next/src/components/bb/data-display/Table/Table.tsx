'use client';

import { HTMLAttributes, forwardRef, ReactNode, useState, useCallback } from 'react';

export interface TableColumn<T = Record<string, unknown>> {
  field: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface TableProps<T = Record<string, unknown>> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  columns: TableColumn<T>[];
  data: T[];
  keyField?: string;
  striped?: boolean;
  bordered?: boolean;
  hover?: boolean;
  compact?: boolean;
  onRowClick?: (row: T, index: number) => void;
  emptyMessage?: string;
  sortable?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  field: string | null;
  direction: SortDirection;
}

function TableInner<T extends Record<string, unknown>>(
  {
    columns,
    data,
    keyField = 'id',
    striped = false,
    bordered = false,
    hover = true,
    compact = false,
    onRowClick,
    emptyMessage = 'No data available',
    sortable = false,
    className = '',
    ...props
  }: TableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const [sort, setSort] = useState<SortState>({ field: null, direction: null });

  const handleSort = useCallback((field: string) => {
    setSort((prev) => {
      if (prev.field !== field) {
        return { field, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { field, direction: 'desc' };
      }
      return { field: null, direction: null };
    });
  }, []);

  const sortedData = sort.field
    ? [...data].sort((a, b) => {
        const aVal = a[sort.field!];
        const bVal = b[sort.field!];
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        const comparison = aVal < bVal ? -1 : 1;
        return sort.direction === 'desc' ? -comparison : comparison;
      })
    : data;

  const containerClasses = `overflow-x-auto rounded-lg border border-border ${className}`;

  const tableClasses = `w-full text-left ${compact ? 'text-sm' : 'text-base'}`;

  const headerCellClasses = `
    px-4 py-3 font-semibold text-text bg-surface-hover
    ${bordered ? 'border-b border-r border-border last:border-r-0' : 'border-b border-border'}
  `;

  const bodyCellClasses = `
    px-4 ${compact ? 'py-2' : 'py-3'} text-text-secondary
    ${bordered ? 'border-b border-r border-border last:border-r-0' : 'border-b border-border'}
  `;

  return (
    <div ref={ref} className={containerClasses} {...props}>
      <table className={tableClasses}>
        <thead>
          <tr>
            {columns.map((col) => {
              const isColumnSortable = sortable && col.sortable !== false;
              const isSorted = sort.field === col.field;
              return (
                <th
                  key={col.field}
                  className={`
                    ${headerCellClasses}
                    ${isColumnSortable ? 'cursor-pointer select-none hover:bg-surface' : ''}
                    ${col.headerClassName || ''}
                  `}
                  onClick={isColumnSortable ? () => handleSort(col.field) : undefined}
                >
                  <span className="flex items-center gap-2">
                    {col.label}
                    {isColumnSortable && (
                      <span className="text-text-muted">
                        {isSorted && sort.direction === 'asc' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        )}
                        {isSorted && sort.direction === 'desc' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                        {!isSorted && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4M16 15l-4 4-4-4" />
                          </svg>
                        )}
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => (
              <tr
                key={String(row[keyField]) || rowIndex}
                onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                className={`
                  ${onRowClick ? 'cursor-pointer' : ''}
                  ${hover ? 'hover:bg-surface-hover' : ''}
                  ${striped && rowIndex % 2 === 1 ? 'bg-surface' : ''}
                  last:border-b-0
                `}
              >
                {columns.map((col) => (
                  <td
                    key={col.field}
                    className={`${bodyCellClasses} ${col.className || ''}`}
                  >
                    {col.render
                      ? col.render(row[col.field], row, rowIndex)
                      : (row[col.field] as ReactNode) ?? ''}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export const Table = forwardRef(TableInner) as <T extends Record<string, unknown>>(
  props: TableProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => ReturnType<typeof TableInner>;

(Table as React.FC).displayName = 'Table';
