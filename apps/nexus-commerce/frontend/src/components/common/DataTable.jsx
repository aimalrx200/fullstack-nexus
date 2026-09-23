// apps/nexus-commerce/frontend/src/components/common/DataTable.jsx

import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "./Button";

export function DataTable({
  data = [],
  columns = [],
  isLoading = false,
  pageSize = 10,
  pagination,
  onPaginationChange,
}) {
  const [sorting, setSorting] = useState([]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize },
    },
  });

  return (
    <div className="w-full space-y-3">
      {/* Table Shell */}
      <div className="w-full overflow-x-auto rounded-2xl border border-border-main bg-surface-card shadow-xs custom-scrollbar">
        <table className="w-full text-left text-xs text-text-main border-collapse">
          {/* Table Header */}
          <thead className="bg-surface-elevated border-b border-border-main font-mono text-[11px] uppercase tracking-wider text-text-muted select-none">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={`px-4 py-3.5 font-semibold ${
                        canSort ? "cursor-pointer hover:text-text-main" : ""
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {canSort && (
                          <span className="text-text-faint">
                            {sortDirection === "asc" ? (
                              <ChevronUp className="w-3.5 h-3.5 text-brand-primary" />
                            ) : sortDirection === "desc" ? (
                              <ChevronDown className="w-3.5 h-3.5 text-brand-primary" />
                            ) : (
                              <ChevronsUpDown className="w-3.5 h-3.5" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-border-subtle">
            {isLoading ? (
              // Column-Matched Skeleton Loading Rows
              Array.from({ length: 6 }).map((_, rowIdx) => (
                <tr key={rowIdx} className="animate-pulse">
                  {columns.map((_, colIdx) => (
                    <td key={colIdx} className="px-4 py-3.5">
                      <div
                        className="h-4 rounded-md bg-surface-elevated/70"
                        style={{
                          width: `${Math.max(45, ((colIdx * 17 + rowIdx * 13) % 85) + 20)}%`,
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-text-muted font-mono"
                >
                  No records found in database.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-surface-elevated/60 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 text-xs text-text-muted">
        <span className="font-mono text-[11px]">
          Showing {table.getRowModel().rows.length} records
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              pagination
                ? onPaginationChange?.(pagination.page - 1)
                : table.previousPage()
            }
            disabled={
              pagination ? pagination.page <= 1 : !table.getCanPreviousPage()
            }
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </Button>

          <span className="px-2 font-mono font-semibold text-text-main">
            Page{" "}
            {pagination
              ? pagination.page
              : table.getState().pagination.pageIndex + 1}
          </span>

          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              pagination
                ? onPaginationChange?.(pagination.page + 1)
                : table.nextPage()
            }
            disabled={
              pagination ? !pagination.hasMore : !table.getCanNextPage()
            }
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
