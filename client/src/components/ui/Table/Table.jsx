import React from 'react';
import './Table.css';

/**
 * A flexible Table component that can handle any number of columns and rows
 * @param {Object} props - Component props
 * @param {Array} props.headers - Array of header labels
 * @param {Array} props.data - Array of row data objects
 * @param {string} props.className - Optional CSS class name for styling
 * @param {Function} props.onRowClick - Optional callback when a row is clicked
 * @param {string} props.keyField - Field to use as unique key for rows (defaults to 'id')
 * @param {boolean} props.striped - Whether to apply striped styling
 * @param {boolean} props.bordered - Whether to apply borders
 * @param {boolean} props.hover - Whether to apply hover effect
 * @param {boolean} props.compact - Whether to use compact styling
 * @returns {JSX.Element} Table component
 */
const Table = ({
  headers = [],
  data = [],
  className = '',
  onRowClick,
  keyField = 'id',
  striped = false,
  bordered = false,
  hover = false,
  compact = false,
}) => {
  // Build class names based on props
  const tableClasses = [
    'bb-table',
    striped ? 'bb-table-striped' : '',
    bordered ? 'bb-table-bordered' : '',
    hover ? 'bb-table-hover' : '',
    compact ? 'bb-table-compact' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="bb-table-container">
      <table className={tableClasses}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{typeof header === 'object' ? header.label : header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="bb-table-empty">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row[keyField] || rowIndex}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'bb-table-clickable' : ''}
              >
                {headers.map((header, colIndex) => {
                  // Get the field name from the header if it's an object with a field property
                  const fieldName = typeof header === 'object' && header.field ? header.field : header;
                  return (
                    <td key={colIndex}>
                      {row[fieldName] !== undefined ? row[fieldName] : ''}
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

export default Table;
