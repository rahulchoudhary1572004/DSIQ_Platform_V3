import React, { useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { Download } from 'lucide-react';
import { CSVLink } from 'react-csv';
import type { GridColumnProps } from '@progress/kendo-react-grid';
import type { GridPDFExport } from '@progress/kendo-react-pdf';

interface CsvLinkHandle {
  link?: HTMLAnchorElement | null;
}

type ExportRow = Record<string, unknown>;

interface ExportColumn extends Pick<GridColumnProps, 'field' | 'title'> {
  [key: string]: unknown;
}

export interface ExportButtonProps {
  data: ExportRow[];
  columns: ExportColumn[];
  gridRef?: RefObject<unknown> | null;
  fileName?: string;
  pdfExportComponent?: RefObject<GridPDFExport | null>;
}

const safeStringify = (value: unknown): string => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.warn('Failed to stringify value for CSV export:', error);
    return '';
  }
};

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  columns,
  gridRef: _gridRef,
  fileName = 'export',
  pdfExportComponent,
}) => {
  const [open, setOpen] = useState(false);
  const csvLinkRef = useRef<CsvLinkHandle | null>(null);

  // Prepare CSV headers from columns
  const csvHeaders = useMemo(() => (
    columns
      .filter((col) => col.field && col.title && col.field !== 'actions')
      .map((col) => ({ label: col.title as string, key: col.field as string }))
  ), [columns]);

  // Prepare CSV data (flatten if needed)
  const csvData = useMemo(() => (
    data.map((row) => {
      return csvHeaders.reduce<Record<string, unknown>>((acc, header) => {
        const rawValue = (row as Record<string, unknown>)[header.key];
        let value: unknown = rawValue;
        if (typeof rawValue === 'object' && rawValue !== null) {
          value = safeStringify(rawValue);
        }
        acc[header.key] = value ?? '';
        return acc;
      }, {});
    })
  ), [data, csvHeaders]);

  // PDF Export handler
  const handlePdfExport = () => {
    setOpen(false);
    const exporter = pdfExportComponent?.current;
    if (exporter && typeof exporter.save === 'function') {
      exporter.save();
    }
  };

  // CSV Export handler
  const handleCsvExport = () => {
    setOpen(false);
    window.setTimeout(() => {
      csvLinkRef.current?.link?.click();
    }, 0);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(o => !o)}
        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2"
        type="button"
      >
        <Download className="h-4 w-4" /> Export
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <button
              onClick={handlePdfExport}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Export as PDF
            </button>
            <button
              onClick={handleCsvExport}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Export as CSV
            </button>
            {/* Hidden CSVLink for triggering download */}
            <CSVLink
              data={csvData}
              headers={csvHeaders}
              filename={`${fileName}.csv`}
              ref={(instance) => {
                csvLinkRef.current = instance as unknown as CsvLinkHandle | null;
              }}
              style={{ display: 'none' }}
              target="_blank"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
