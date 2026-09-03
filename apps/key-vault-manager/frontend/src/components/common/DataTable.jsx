// src/components/common/DataTable.jsx

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useState } from "react";
import { Filter, Plus, ShieldCheck, Lock } from "lucide-react";

export function DataTable({
  data = [],
  columns = [],

  // Section Header Controls
  title,
  showToolbar = false,

  // Filter Button Config
  showFilter = false,
  filterLabel = "Filter",
  onFilter,

  // Primary Action Button Config
  showActionButton = false,
  actionButtonLabel = "Action",
  actionButtonIcon: ActionIcon = Plus,
  onAction,

  // Custom Empty State Configuration
  emptyTitle = "No active records found",
  emptyDescription = "All secrets written to this namespace are encrypted via hardware-grade AES-256-GCM AEAD.",

  // Pagination Control
  showPagination = true,
  pageSize = 10,
}) {
  const [sorting, setSorting] = useState([]);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table uses interior mutability by design
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  const renderToolbar = showToolbar || title || showFilter || showActionButton;

  return (
    <section className="data-table-section">
      {/* Dynamic Section Header & Toolbar Controls */}
      {renderToolbar && (
        <div className="data-table-toolbar">
          {title ? <h3 className="data-table-title">{title}</h3> : <div />}

          <div className="data-table-toolbar-actions">
            {showFilter && (
              <button
                type="button"
                onClick={onFilter}
                className="data-table-filter-button"
              >
                <Filter className="data-table-filter-icon" />
                <span>{filterLabel}</span>
              </button>
            )}

            {showActionButton && (
              <button
                type="button"
                onClick={onAction}
                className="data-table-action-button"
              >
                {ActionIcon && (
                  <ActionIcon className="data-table-action-icon" />
                )}
                <span>{actionButtonLabel}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="data-table-card">
        <div className="data-table-scroll-wrapper">
          <table className="data-table-element">
            <thead className="data-table-thead">
              {headerGroups.map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="data-table-th">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="data-table-tbody">
              {rows.length ? (
                rows.map((row) => (
                  <tr key={row.id} className="data-table-tr">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="data-table-td">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="data-table-empty-td">
                    <div className="data-table-empty-wrapper">
                      {/* Shield / Lock Hologram Icon */}
                      <div className="data-table-empty-icon-box">
                        <Lock className="data-table-empty-icon" />
                      </div>

                      {/* Heading & Security Assurance */}
                      <p className="data-table-empty-title">{emptyTitle}</p>
                      <p className="data-table-empty-desc">
                        {emptyDescription}
                      </p>

                      {/* Security Verification Tag */}
                      <div className="data-table-empty-badge">
                        <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
                        <span>AES-256-GCM Quorum Ready</span>
                      </div>

                      {/* Direct In-Table Action Trigger */}
                      {onAction && (
                        <button
                          type="button"
                          onClick={onAction}
                          className="data-table-empty-action-btn"
                        >
                          {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
                          <span>{actionButtonLabel}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Controls */}
        {showPagination && rows.length > 0 && (
          <div className="data-table-pagination">
            <span className="data-table-pagination-info">
              PAGE {pageIndex + 1} OF {pageCount || 1}
            </span>
            <div className="data-table-pagination-actions">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="data-table-pagination-button"
              >
                Previous
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="data-table-pagination-button"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
