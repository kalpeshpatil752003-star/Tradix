import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import React, { useState } from "react";
import { useNavigate, createSearchParams } from 'react-router-dom';
import { DataTablePagination } from "./data-table-pagination";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import { useSelector } from "react-redux";
import { useDeleteTradeMutation } from "state/api/trade/tradeApi";

const TradeTable = (props) => {

    const { data, columns, pagination, isEdit } = props;

    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [isDeleting, setIsDeleting] = useState(false);

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        state: { sorting, columnFilters, rowSelection }
    });

    const navigate = useNavigate();
    const useNavigateSearch = () => {
        return (pathname, params) =>
            navigate(`${pathname}?${createSearchParams(params)}`);
    };
    const navigateSearch = useNavigateSearch();

    const id = useSelector((state) => state.account?.selectedAccount?.AccountId);
    const [deleteTrade, { isLoading: isLoadingDelete }] = useDeleteTradeMutation();

    // Single delete
    const handleDeleteClick = async (TradeId) => {
        try {
            await deleteTrade({ AccountId: id, TradeId }).unwrap();
        } catch (error) {
            return;
        }
    };

    // Bulk delete
    const handleBulkDelete = async () => {
        const selectedRows = table.getSelectedRowModel().rows;
        if (selectedRows.length === 0) return;

        const confirm = window.confirm(`Are you sure you want to delete ${selectedRows.length} trade(s)?`);
        if (!confirm) return;

        setIsDeleting(true);
        try {
            for (const row of selectedRows) {
                await deleteTrade({ AccountId: id, TradeId: row.original.TradeId }).unwrap();
            }
            setRowSelection({});
        } catch (error) {
            return;
        } finally {
            setIsDeleting(false);
        }
    };

    const selectedCount = table.getSelectedRowModel().rows.length;

    return (
        <>
            {/* ── Bulk Delete Bar ── */}
            {selectedCount > 0 && (
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "#1e1b4b", borderRadius: 8, padding: "10px 16px", marginBottom: 12,
                    border: "1px solid #4f46e5"
                }}>
                    <span style={{ color: "#a5b4fc", fontSize: 14, fontWeight: 500 }}>
                        {selectedCount} trade{selectedCount > 1 ? "s" : ""} selected
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            onClick={() => setRowSelection({})}
                            style={{
                                padding: "6px 14px", borderRadius: 6, fontSize: 13,
                                background: "transparent", border: "1px solid #4f46e5",
                                color: "#a5b4fc", cursor: "pointer", fontWeight: 500
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            style={{
                                padding: "6px 14px", borderRadius: 6, fontSize: 13,
                                background: isDeleting ? "#991b1b" : "#ef4444",
                                border: "none", color: "white",
                                cursor: isDeleting ? "not-allowed" : "pointer",
                                fontWeight: 600, display: "flex", alignItems: "center", gap: 6
                            }}
                        >
                            <MdDeleteOutline size={16} />
                            {isDeleting ? "Deleting..." : `Delete ${selectedCount} Trade${selectedCount > 1 ? "s" : ""}`}
                        </button>
                    </div>
                </div>
            )}

            <div className="relative overflow-x-auto no-scrollbar shadow-md dark:shadow-2xl sm:rounded-md">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-md text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="capitalize px-6 py-3 whitespace-nowrap">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                                {isEdit && <th scope="col" className="capitalize px-6 py-3 text-center whitespace-nowrap"></th>}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row, i) => (
                                <tr
                                    key={row.id}
                                    onClick={() => navigateSearch('/tracking', { id: row?.original?.TradeId })}
                                    className={`border-b dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer ${i % 2 === 0 ? "bg-white dark:bg-main-dark" : "bg-gray-100 dark:bg-primary-dark"}`}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                    {isEdit &&
                                        <td className="py-4 px-4 w-24 flex items-center justify-between whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                            <button className="font-medium text-gray-900 dark:text-white hover:underline" onClick={() => navigateSearch('/add-Trade', { id: row?.original?.TradeId })}>
                                                <MdEdit className="w-5 h-5" />
                                            </button>
                                            <button className="font-medium text-red-600 dark:text-red-500 hover:underline" onClick={() => handleDeleteClick(row?.original?.TradeId)}>
                                                <MdDeleteOutline className="w-5 h-5" />
                                            </button>
                                        </td>
                                    }
                                </tr>
                            ))
                        ) : (
                            <tr className="text-center h-32">
                                <td colSpan={12}>No Record Found!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && <DataTablePagination table={table} />}
        </>
    );
};

export default TradeTable;