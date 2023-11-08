
import * as React from 'react';
import { TableProps, TableRef } from '../../types';
import {
    Column,
    ColumnDef,
    ColumnFiltersState,
    ColumnOrderState,
    GroupingState,
    Header,
    SortingState,
    Table,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getGroupedRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useVirtual } from 'react-virtual';

const reorderColumn = (
    draggedColumnId: string,
    targetColumnId: string,
    columnOrder: string[]
): ColumnOrderState => {
    columnOrder.splice(
        columnOrder.indexOf(targetColumnId),
        0,
        columnOrder.splice(columnOrder.indexOf(draggedColumnId), 1)[0] as string
    )
    console.log("columnOrder = ", columnOrder);
    return [...columnOrder]
}

const DraggableColumnHeader: React.FC<{
    header: Header<object, unknown>
    table: Table<object>
}> = ({ header, table }) => {
    const { getState, setColumnOrder } = table
    const { columnOrder } = getState()
    const { column } = header

    const [, dropRef] = useDrop({
        accept: 'column',
        drop: (draggedColumn: Column<object>) => {
            const newColumnOrder = reorderColumn(
                draggedColumn.id,
                column.id,
                columnOrder
            )
            setColumnOrder(newColumnOrder)
        },
    })

    const [{ isDragging }, dragRef, previewRef] = useDrag({
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
        item: () => column,
        type: 'column',
    })

    return (
        <th
            ref={dropRef}
            colSpan={header.colSpan}
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <div ref={previewRef}>
                {header.isPlaceholder ? null : (
                    <div
                        {...{
                            className: header.column.getCanSort()
                                ? 'cursor-pointer select-none'
                                : '',
                            onClick: header.column.getToggleSortingHandler(),
                        }}
                    >
                        <div>
                            {header.column.getCanGroup() ? (
                                // If the header can be grouped, let's add a toggle
                                <button
                                    {...{
                                        onClick: header.column.getToggleGroupingHandler(),
                                        style: {
                                            cursor: 'pointer',
                                        },
                                    }}
                                >
                                    {header.column.getIsGrouped()
                                        ? `🛑(${header.column.getGroupedIndex()}) `
                                        : `👊 `}
                                </button>
                            ) : null}{' '}
                        </div>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                            asc: ' 🔼',
                            desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                        {header.column.columnDef.id && <button ref={dragRef}>🟰</button>}
                        <div
                            {...{
                                onMouseDown: header.getResizeHandler(),
                                onTouchStart: header.getResizeHandler(),
                                className: `resizer ${header.column.getIsResizing() ? 'isResizing' : ''
                                    }`,
                            }}
                        />
                    </div>
                )}

            </div>
        </th>
    )
}


export function AdvancedTable<TItem extends object>(props: TableProps<TItem>, ref: React.ForwardedRef<TableRef<TItem>>) {
 
    const { columns, data } = props;

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [globalFilter, setGlobalFilter] = React.useState('')
    const [grouping, setGrouping] = React.useState<GroupingState>([]);
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] = React.useState({});

    const tableColumns: ColumnDef<TItem>[] = React.useMemo(() => {
        return [{
            id: 'select',
            size: 30,
            header: ({ table }) => (
                <IndeterminateCheckbox
                    {...{
                        checked: table.getIsAllRowsSelected(),
                        indeterminate: table.getIsSomeRowsSelected(),
                        onChange: table.getToggleAllRowsSelectedHandler(),
                    }}
                />
            ),
            cell: ({ row }) => (
                <div className="px-1">
                    <IndeterminateCheckbox
                        {...{
                            checked: row.getIsSelected(),
                            disabled: !row.getCanSelect(),
                            indeterminate: row.getIsSomeSelected(),
                            onChange: row.getToggleSelectedHandler(),
                        }}
                    />
                </div>
            ),
            aggregatedCell: () => null,
        },
        ...columns]
    }, [columns]);

    const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(
        tableColumns.map(column => column.id as string)
        //must start out with populated columnOrder so we can splice
    )

    const table = useReactTable<TItem>({
        columns: tableColumns,
        data,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            grouping,
            expanded: true,
            rowSelection,
            columnOrder,
            columnVisibility,
        },
        columnResizeMode: "onChange",
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onGroupingChange: setGrouping,
        onColumnOrderChange: setColumnOrder,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    });

    React.useImperativeHandle(ref, () => {
        return {
            table,
        }
    }, [table]);

    const tableContainerRef = React.useRef<HTMLDivElement>(null)

    const { rows } = table.getRowModel()
    const rowVirtualizer = useVirtual({
        parentRef: tableContainerRef,
        size: rows.length,
        overscan: 10,
    })
    const { virtualItems: virtualRows, totalSize } = rowVirtualizer

    const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0
    const paddingBottom =
        virtualRows.length > 0
            ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
            : 0;


    React.useEffect(() => {
        const pageSize = props.pageSize;
        if (pageSize && table) {
            table.setPageSize(pageSize);
        }
    }, [props.pageSize]);


    return (
        <DndProvider backend={HTML5Backend}>
            <div className="inline-block border border-black shadow rounded">
                <div className="px-1 border-b border-black">
                    <label>
                        <input
                            {...{
                                type: 'checkbox',
                                checked: table.getIsAllColumnsVisible(),
                                onChange: table.getToggleAllColumnsVisibilityHandler(),
                            }}
                        />{' '}
                        Toggle All
                    </label>
                </div>
                {table.getAllLeafColumns().map(column => {
                    return (
                        <div key={column.id} className="px-1">
                            <label>
                                <input
                                    {...{
                                        type: 'checkbox',
                                        checked: column.getIsVisible(),
                                        onChange: column.getToggleVisibilityHandler(),
                                    }}
                                />{' '}
                                {column.id}
                            </label>
                        </div>
                    )
                })}
            </div>
            <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(String(value))}
                className="p-2 font-lg shadow border border-block"
                placeholder="Search all columns..."
            />
            <div ref={tableContainerRef} className="container">
                <table style={{ width: "100%" }}>
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => {
                                    return (
                                        <DraggableColumnHeader
                                            key={header.id}
                                            header={header as unknown as Header<object, unknown>}
                                            table={table as unknown as Table<object>}
                                        />
                                    )
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody style={{ maxHeight: "600px", overflow: "auto" }}>
                        {paddingTop > 0 && (
                            <tr>
                                <td style={{ height: `${paddingTop}px` }} />
                            </tr>
                        )}
                        {virtualRows.map(virtualRow => {
                            const row = rows[virtualRow.index];
                            return (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <td {...{
                                            key: cell.id,
                                            style: {
                                                background: cell.getIsGrouped()
                                                    ? '#0aff0082'
                                                    : cell.getIsAggregated()
                                                        ? '#ffa50078'
                                                        : cell.getIsPlaceholder()
                                                            ? '#ff000042'
                                                            : 'white',

                                                width: cell.column.getSize(),
                                            },
                                        }}>
                                            {cell.getIsGrouped() ? (
                                                // If it's a grouped cell, add an expander and row count
                                                <>
                                                    <button
                                                        {...{
                                                            onClick: row.getToggleExpandedHandler(),
                                                            style: {
                                                                cursor: row.getCanExpand()
                                                                    ? 'pointer'
                                                                    : 'normal',
                                                            },
                                                        }}
                                                    >
                                                        {row.getIsExpanded() ? '👇' : '👉'}{' '}
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}{' '}
                                                        ({row.subRows.length})
                                                    </button>
                                                </>
                                            ) : cell.getIsAggregated() ? (
                                                // If the cell is aggregated, use the Aggregated
                                                // renderer for cell
                                                flexRender(
                                                    cell.column.columnDef.aggregatedCell ??
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )
                                            ) : cell.getIsPlaceholder() ? null : ( // For cells with repeated values, render null
                                                // Otherwise, just render the regular cell
                                                flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            )
                        })}
                        {/* {table.getRowModel().rows.map(row => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <td {...{
                                        key: cell.id,
                                        style: {
                                            background: cell.getIsGrouped()
                                                ? '#0aff0082'
                                                : cell.getIsAggregated()
                                                    ? '#ffa50078'
                                                    : cell.getIsPlaceholder()
                                                        ? '#ff000042'
                                                        : 'white',

                                            width: cell.column.getSize(),
                                        },
                                    }}>
                                        {cell.getIsGrouped() ? (
                                            // If it's a grouped cell, add an expander and row count
                                            <>
                                                <button
                                                    {...{
                                                        onClick: row.getToggleExpandedHandler(),
                                                        style: {
                                                            cursor: row.getCanExpand()
                                                                ? 'pointer'
                                                                : 'normal',
                                                        },
                                                    }}
                                                >
                                                    {row.getIsExpanded() ? '👇' : '👉'}{' '}
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}{' '}
                                                    ({row.subRows.length})
                                                </button>
                                            </>
                                        ) : cell.getIsAggregated() ? (
                                            // If the cell is aggregated, use the Aggregated
                                            // renderer for cell
                                            flexRender(
                                                cell.column.columnDef.aggregatedCell ??
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )
                                        ) : cell.getIsPlaceholder() ? null : ( // For cells with repeated values, render null
                                            // Otherwise, just render the regular cell
                                            flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))} */}
                        {paddingBottom > 0 && (
                            <tr>
                                <td style={{ height: `${paddingBottom}px` }} />
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td className="p-1">
                                <IndeterminateCheckbox
                                    {...{
                                        checked: table.getIsAllPageRowsSelected(),
                                        indeterminate: table.getIsSomePageRowsSelected(),
                                        onChange: table.getToggleAllPageRowsSelectedHandler(),
                                    }}
                                />
                            </td>
                            <td colSpan={20}>Page Rows ({table.getRowModel().rows.length})</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div className="flex items-center gap-2">
                <button
                    className="border rounded p-1"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                >
                    {'<<'}
                </button>
                <button
                    className="border rounded p-1"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    {'<'}
                </button>
                <button
                    className="border rounded p-1"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    {'>'}
                </button>
                <button
                    className="border rounded p-1"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                >
                    {'>>'}
                </button>
                <span className="flex items-center gap-1">
                    <span>
                        Page
                        <strong>
                            {table.getState().pagination.pageIndex + 1} of{' '}
                            {table.getPageCount()}
                        </strong>
                    </span>
                </span>
                <span className="flex items-center gap-1">
                    | Go to page:
                    <input
                        type="number"
                        defaultValue={table.getState().pagination.pageIndex + 1}
                        onChange={e => {
                            const page = e.target.value ? Number(e.target.value) - 1 : 0
                            table.setPageIndex(page)
                        }}
                        className="border p-1 rounded w-16"
                    />
                </span>
                <select
                    value={table.getState().pagination.pageSize}
                    onChange={e => {
                        table.setPageSize(Number(e.target.value))
                    }}
                >
                    {(props.pageSizeOptions || [10, 20, 50, 100, 1000]).map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            {pageSize}
                        </option>
                    ))}
                </select>
            </div>
        </DndProvider>
    )
}

export const ForwardedAdvancedTable = React.forwardRef(AdvancedTable) as <TItem extends object>(props: TableProps<TItem> & { ref?: React.ForwardedRef<TableRef<TItem>> }) => React.ReactElement<TableProps<TItem> & { ref?: React.ForwardedRef<TableRef<TItem>> }>

// A debounced input react component
function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = 500,
    ...props
}: {
    value: string | number
    onChange: (value: string | number) => void
    debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
    const [value, setValue] = React.useState<string | number>('')

    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value)
        }, debounce)

        return () => clearTimeout(timeout)
    }, [value, onChange, debounce])

    return (
        <input {...props} value={value} onChange={e => setValue(e.target.value)} />
    )
}

function IndeterminateCheckbox({
    indeterminate,
    className = '',
    ...rest
}: { indeterminate?: boolean } & React.HTMLProps<HTMLInputElement>) {
    const ref = React.useRef<HTMLInputElement>(null!)

    React.useEffect(() => {
        if (typeof indeterminate === 'boolean') {
            ref.current.indeterminate = !rest.checked && indeterminate
        }
    }, [ref, indeterminate, rest.checked])

    return (
        <input
            type="checkbox"
            ref={ref}
            className={className + ' cursor-pointer'}
            {...rest}
        />
    )
}

