import * as React from "react";
import { TableProps, TableRef } from "../types";
import {
  ColumnFiltersState,
  ColumnOrderState,
  GroupingState,
  Header,
  RowSelectionState,
  SortingState,
  Table,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  FilterFn,
  ExpandedState,
  PaginationState
} from "@tanstack/react-table";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useVirtual } from "react-virtual";
import {
  Button,
  Checkbox,
  Radio,
} from "@fluentui/react-components"; 
import { useStaticStyles, useTableStaticStyles } from "./table/useTableStaticStyles";
import { Pagination } from "./pagination/Pagination";
import { GridHeader } from "./grid-header";
import { Loading } from "./loading";
import { NoItemGrid } from "./no-item";
import { NoSearchResult } from "./no-search-result";
import { GroupCollapsedIcon, GroupExpandedIcon } from "./icon-components/GridIcons";
import { HeaderCell } from "./thead";

const arrIncludesSome: FilterFn<unknown> = (row, columnId, value) => {
  // Rank the item
  const rowValue = row.getValue(columnId); 
  const passed = Array.isArray(value) && (value?.length === 0 || value.includes(`${rowValue}`)); 

  // console.log("rowValue", rowValue, "value", value, "passed", passed, "columnId", columnId)
   
  // Return if the item should be filtered in/out
  return passed;
}

export function AdvancedTable<TItem extends object>(
  props: TableProps<TItem>,
  ref: React.ForwardedRef<TableRef<TItem>>
) {
  const { columns, data, rowSelectionMode } = props;

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageSize: props.pageSize || 10,
    pageIndex: 0,
  });

  const [sorting, setSorting] = React.useState<SortingState>(
    props.sortingState ?? []
  );
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    props.columnFilterState ?? []
  );
  const [globalFilter, setGlobalFilter] = React.useState(
    props.defaultGlobalFilter ?? ""
  );
  const [grouping, setGrouping] = React.useState<GroupingState>(
    props.groupingState ?? []
  );
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
    props.rowSelectionState ?? {}
  );
  const [columnVisibility, setColumnVisibility] = React.useState(
    props.columnVisibility ?? {}
  );
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(
    () => props.columnOrderState ?? columns.map((column) => column.id as string)
  );
  const [expanded, setExpanded] = React.useState<ExpandedState>(
    props.expandedState ?? {}
  );
  const [columnPinning, setColumnPinning] = React.useState(
    props.columnPinningState ?? {}
  );
  // const [rowPinning, setRowPinning] = React.useState<RowPinningState>({
  //   top: [],
  //   bottom: [],
  // });

  // React.useEffect(() => {
  //   const expandedState : Record<string, boolean> = {};

  //   columns.forEach((column) => {
  //     if (column.id) {
  //       expandedState[column.id] = true;
  //     }
  //   });

  //   setExpanded(expandedState);

  // }, [columns]);

  const table = useReactTable<TItem>({
    columns: columns,
    data,
    filterFns: {
      arrIncludesSome,
    },
    initialState: {
      expanded: true,
      pagination: {
        pageSize: props.pageSize,
      },
    },
    state: {
      pagination,
      sorting,
      columnFilters,
      globalFilter,
      grouping,
      expanded,
      rowSelection,
      columnOrder,
      columnVisibility,
      columnPinning,
    },
    columnResizeMode: "onChange",
    enableRowSelection: rowSelectionMode !== undefined,
    enableMultiRowSelection: rowSelectionMode === "multiple",
    enableFilters: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    filterFromLeafRows: true,
    autoResetExpanded: false,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onGroupingChange: setGrouping,
    onColumnOrderChange: setColumnOrder,
    onExpandedChange: setExpanded,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  });

  const getTableState = React.useCallback(() => {
    return {
      pagination,
      sorting,
      columnFilters,
      globalFilter,
      grouping,
      expanded,
      rowSelection,
      columnOrder,
      columnVisibility,
      columnPinning,
    };
  }, [
    pagination,
    sorting,
    columnFilters,
    globalFilter,
    grouping,
    expanded,
    rowSelection,
    columnOrder,
    columnVisibility,
    columnPinning,
  ]);

  React.useImperativeHandle(
    ref,
    () => {
      return {
        table,
        getTableState: getTableState,
        saveCurrentTableState: (viewName: string) => {
          const tableState = getTableState();
          const tableStateString = JSON.stringify(tableState);
          localStorage.setItem(viewName, tableStateString);
          return true;
        },
        applySavedView: (viewName: string) => {
          const tableStateString = localStorage.getItem(viewName);
          if (tableStateString) {
            const tableState = JSON.parse(tableStateString); 
            setSorting(tableState.sorting);
            setColumnFilters(tableState.columnFilters);
            setGlobalFilter(tableState.globalFilter);
            setGrouping(tableState.grouping);
            setExpanded(tableState.expanded);
            setRowSelection(tableState.rowSelection);
            setColumnOrder(tableState.columnOrder);
            setColumnVisibility(tableState.columnVisibility);
            setColumnPinning(tableState.columnPinning);
            setTimeout(() => {
              setPagination(tableState.pagination);
            }, 10);
            return true;
          }
          return false;
        },
      };
    },
    [table, getTableState]
  );

  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtual({
    parentRef: tableContainerRef,
    size: rows.length,
    overscan: 10,
  });
  const { virtualItems: virtualRows, totalSize } = rowVirtualizer;

  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  const headerGroups = table.getHeaderGroups();

  // utilities
  const isLoading = props.isLoading && virtualRows.length == 0;
  const noItems = !isLoading && props.data?.length == 0;
  const noSearchResult =
    !isLoading && props.data?.length > 0 && virtualRows.length == 0;

  useStaticStyles();
  const styles = useTableStaticStyles();

  return (
    <DndProvider backend={HTML5Backend}>
      <GridHeader
        table={table}
        gridTitle={props.gridTitle}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />

      <div ref={tableContainerRef} className={styles.tableContainer}>
        <table className={styles.table} aria-label="Data Grid">
          <thead className={styles.tHead}>
            {headerGroups?.map((headerGroup) => (
              <tr key={headerGroup.id}>
                {rowSelectionMode === "multiple" && (
                  <th style={{ width: "1rem" }}>
                    {headerGroup.depth === headerGroups?.length - 1 && (
                      <Checkbox
                        checked={
                          table.getIsSomeRowsSelected()
                            ? "mixed"
                            : table.getIsAllRowsSelected()
                        }
                        onChange={table.getToggleAllRowsSelectedHandler()}
                        aria-label="Select All Rows"
                        title={"Select All Rows"}
                      />
                    )}
                  </th>
                )}
                {rowSelectionMode === "single" && (
                  <th style={{ width: "1rem" }}> </th>
                )}
                {headerGroup.headers.map((header) => {
                  return (
                    <HeaderCell
                      key={header.id}
                      header={header as unknown as Header<object, unknown>}
                      table={table as unknown as Table<object>}
                      hideMenu={headerGroup.depth !== headerGroups?.length - 1}
                      headerDepth={headerGroup.depth}
                      totalNumberOfHeaderDepth={headerGroups?.length - 1}
                    />
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className={styles.tBody}>
            {/* placeholder for virtualization */}
            {paddingTop > 0 && (
              <tr className={styles.tBodyRow} aria-hidden={true}>
                <td style={{ height: `${paddingTop}px` }} />
              </tr>
            )}
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <tr
                  key={row.id}
                  className={
                    row.getIsSelected() || row.getIsAllSubRowsSelected()
                      ? styles.tBodySelectedRow
                      : styles.tBodyRow
                  }
                >
                  {rowSelectionMode == "multiple" && (
                    <td className={styles.tBodyCell}>
                      <Checkbox
                        checked={
                          row.getIsSomeSelected()
                            ? "mixed"
                            : row.getIsSelected() ||
                              row.getIsAllSubRowsSelected()
                        }
                        disabled={!row.getCanSelect()}
                        onChange={row.getToggleSelectedHandler()}
                        aria-label="Select Row"
                      />
                    </td>
                  )}
                  {rowSelectionMode == "single" && (
                    <td className={styles.tBodyCell}>
                      <Radio
                        checked={row.getIsSelected()}
                        disabled={!row.getCanSelect()}
                        onChange={row.getToggleSelectedHandler()}
                        aria-label="Select Row"
                      />
                    </td>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <td
                      {...{
                        key: cell.id,
                        style: {
                          // background: cell.getIsGrouped()
                          //   ? "#0aff0082"
                          //   : cell.getIsAggregated()
                          //   ? "#ffa50078"
                          //   : cell.getIsPlaceholder()
                          //   ? "#ff000042"
                          //   : "white",

                          width: cell.column.getSize(),
                        },
                      }}
                      className={styles.tBodyCell}
                      // rowSpan={cell.getIsGrouped() ? row.subRows.length : undefined}
                    >
                      {cell.getIsGrouped() ? (
                        // If it's a grouped cell, add an expander and row count
                        <>
                          <Button
                            {...{
                              onClick: row.getToggleExpandedHandler(),
                              style: {
                                cursor: row.getCanExpand()
                                  ? "pointer"
                                  : "normal",
                              },
                            }}
                            appearance="transparent"
                            icon={
                              row.getIsExpanded() ? (
                                <GroupExpandedIcon />
                              ) : (
                                <GroupCollapsedIcon />
                              )
                            }
                          >
                            <strong>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}{" "}
                              ({row.subRows.length})
                            </strong>
                          </Button>
                        </>
                      ) : cell.getIsAggregated() ? (
                        // If the cell is aggregated, use the Aggregated
                        // renderer for cell
                        <strong>
                          {flexRender(
                            cell.column.columnDef.aggregatedCell ??
                              cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </strong>
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
              );
            })}

            {/* placeholder for virtualization */}
            {paddingBottom > 0 && (
              <tr className={styles.tBodyRow} aria-hidden={true}>
                <td style={{ height: `${paddingBottom}px` }} />
              </tr>
            )}
          </tbody>
          {rowSelectionMode === "multiple" &&
            !isLoading &&
            !noItems &&
            !noSearchResult && (
              <tfoot className={styles.tFoot}>
                <tr>
                  <td className="p-1">
                    <Checkbox
                      checked={
                        table.getIsSomePageRowsSelected()
                          ? "mixed"
                          : table.getIsAllPageRowsSelected()
                      }
                      onChange={table.getToggleAllPageRowsSelectedHandler()}
                      aria-label="Select All Current Page Rows"
                      title={"Select All Current Page Rows"}
                    />
                  </td>
                  <td colSpan={20}>
                    {table.getIsAllPageRowsSelected() ? "Unselect" : "Select"}{" "}
                    All Current Page Rows ({table.getRowModel().rows.length})
                  </td>
                </tr>
              </tfoot>
            )}
        </table>
        {isLoading && <Loading />}
        {noItems && <NoItemGrid message={props.noItemPage} />}
        {noSearchResult && <NoSearchResult message={props.noFilterMatchPage} />}
      </div>

      <Pagination table={table} pageSizeOptions={props.pageSizeOptions} />
    </DndProvider>
  );
}

export const ForwardedAdvancedTable = React.forwardRef(AdvancedTable) as <
  TItem extends object
>(
  props: TableProps<TItem> & { ref?: React.ForwardedRef<TableRef<TItem>> }
) => React.ReactElement<
  TableProps<TItem> & { ref?: React.ForwardedRef<TableRef<TItem>> }
>;