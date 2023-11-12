import * as React from "react";
import { TableProps, TableRef } from "../types";
import {
  Column,
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
  ExpandedState
} from "@tanstack/react-table";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useVirtual } from "react-virtual";
import {
  Button,
  Checkbox,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuGroupHeader,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Radio,
  mergeClasses,
} from "@fluentui/react-components";
import {
  bundleIcon,
  ArrowSortDown20Filled,
  ArrowSortDown20Regular,
  ArrowSortUp20Filled,
  ArrowSortUp20Regular,
  GroupListRegular,
  FilterFilled,
  TextSortAscendingFilled,
  TextSortDescendingFilled,
  GroupFilled,
  GroupDismissFilled

} from "@fluentui/react-icons";
import { useStaticStyles, useTableStaticStyles } from "./table/useTableStaticStyles";
import { Pagination } from "./pagination/Pagination";
import { GridHeader } from "./grid-header";
import { Loading } from "./loading";
import { NoItemGrid } from "./no-item";
import { NoSearchResult } from "./no-search-result";
import { Filter } from "./filters";
import { GroupCollapsedIcon, GroupExpandedIcon } from "./icon-components/GridIcons";
const SortAscIcon = bundleIcon(ArrowSortDown20Filled, ArrowSortDown20Regular);
const SortDescIcon = bundleIcon(ArrowSortUp20Filled, ArrowSortUp20Regular);

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

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [grouping, setGrouping] = React.useState<GroupingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = React.useState({}); 
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(
    columns.map((column) => column.id as string)
  );
  const [expanded, setExpanded] = React.useState<ExpandedState>({})
 
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
      arrIncludesSome
    },
    initialState: {
      expanded: true, 
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
      grouping,
      expanded,
      rowSelection,
      columnOrder,
      columnVisibility, 
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
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onGroupingChange: setGrouping,
    onColumnOrderChange: setColumnOrder,
    onExpandedChange: setExpanded,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  });

  React.useImperativeHandle(
    ref,
    () => {
      return {
        table,
      };
    },
    [table]
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

  React.useEffect(() => {
    const pageSize = props.pageSize;
    if (pageSize && table) {
      table.setPageSize(pageSize);
    }
  }, [props.pageSize, table]);

  const { defaultHiddenColumns } = props;
  React.useEffect(() => {
    if (defaultHiddenColumns && table.setColumnVisibility) {
      table.setColumnVisibility(() => {
        return defaultHiddenColumns.reduce((acc, columnId) => {
          acc[columnId] = false;
          return acc;
        }, {} as Record<string, boolean>);
      });
    }
  }, [defaultHiddenColumns, table]);

  const headerGroups = table.getHeaderGroups();

  // utilities 
  const isLoading = props.isLoading && virtualRows.length == 0;
  const noItems = !isLoading && props.data?.length == 0;
  const noSearchResult = !isLoading && props.data?.length > 0 && virtualRows.length == 0;

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
                      />)}
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
                            icon={row.getIsExpanded() ? <GroupExpandedIcon /> : <GroupCollapsedIcon />}
                          >
                          <strong>{flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}{" "}
                            ({row.subRows.length})</strong>
                          </Button>
                        </>
                      ) : cell.getIsAggregated() ? (
                        // If the cell is aggregated, use the Aggregated
                        // renderer for cell
                        <strong>{flexRender(
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
          {rowSelectionMode === "multiple" && !isLoading && !noItems && !noSearchResult && (
            <tfoot>
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
                  />
                </td>
                <td colSpan={20}>
                  {table.getIsAllPageRowsSelected() ? "Unselect" : "Select"} All
                  Current Page Rows ({table.getRowModel().rows.length})
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


const reorderColumn = (
  draggedColumnId: string,
  targetColumnId: string,
  columnOrder: string[]
): ColumnOrderState => {
  columnOrder.splice(
    columnOrder.indexOf(targetColumnId),
    0,
    columnOrder.splice(columnOrder.indexOf(draggedColumnId), 1)[0] as string
  );
  return [...columnOrder];
};

const HeaderCell: React.FC<{
  header: Header<object, unknown>;
  table: Table<object>;
  hideMenu?: boolean;
  headerDepth: number;
  totalNumberOfHeaderDepth: number;
}> = ({ header, table, hideMenu, headerDepth, totalNumberOfHeaderDepth }) => {
  const { getState, setColumnOrder } = table;
  const { columnOrder } = getState();
  const { column } = header;

  const [{ isOver }, dropRef] = useDrop({
    accept: "column",
    drop: (draggedColumn: Column<object>) => {
      const newColumnOrder = reorderColumn(
        draggedColumn.id,
        column.id,
        columnOrder
      );
      setColumnOrder(newColumnOrder);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    item: () => column,
    type: "column",
  });

  const styles = useTableStaticStyles();
 
  return (
    <th
      colSpan={header.colSpan}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? "drag" : "pointer",
        alignItems: headerDepth === totalNumberOfHeaderDepth ? "left" : "center",
        zIndex: 99,
        backgroundColor: isOver ? "#0000000d" : "transparent",
        border: isOver ? "1px dashed #0000000d" : "none",
      }}
      className={styles.tHeadCell}
    >
      <div ref={dragRef}>
        <div className={styles.tHeadCellContent} ref={dropRef}>
          <div ref={previewRef}>
            {header.isPlaceholder ? null : (
              <Button
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "left",
                  flex: 1,
                }}
                onClick={(e) => {
                  header.column.toggleSorting(
                    header.column.getIsSorted() === "asc",
                    e.ctrlKey
                  );
                }}
                onDoubleClick={() => {
                  if (!header.column.getCanGroup()) return;
                  header.column.getToggleGroupingHandler()();
                }}
                appearance="transparent" 
                className={styles.tHeadContentBtn}
                icon={
                  {
                    asc: (
                      <strong>
                        <SortAscIcon />
                      </strong>
                    ),
                    desc: (
                      <strong>
                        <SortDescIcon />
                      </strong>
                    ),
                  }[header.column.getIsSorted() as string] ?? undefined
                }
                iconPosition="after"
              >
                {/* {header.column.getCanGroup() && (
                <button
                  {...{
                    onClick: header.column.getToggleGroupingHandler(),
                    style: {
                      cursor: "pointer",
                    },
                  }}
                >
                  {header.column.getIsGrouped()
                    ? `🛑(${header.column.getGroupedIndex()}) `
                    : `👊 `}
                </button>
              )} */}

                <strong>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </strong>

                {/* indicator for grouping */}
                {header.column.getIsGrouped() && <GroupListRegular />}
                {/* indicator for filtering */}
                {header.column.getIsFiltered() && (
                  <strong>
                    <FilterFilled />
                  </strong>
                )}

                {/* {header.column.columnDef.id && header.column.getCanResize() && <button ref={dragRef}>🟰</button>} */}
              </Button>
            )}
          </div>
          {!header.isPlaceholder && !hideMenu && (<div>
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <MenuButton appearance="transparent" aria-label="View Column Actions"></MenuButton>
              </MenuTrigger>

              <MenuPopover className={styles.tHeadMenuPopover}>
                <MenuList>
                  {header.column.getCanSort() && (
                    <MenuGroup key={"sort-group"}>
                      <MenuGroupHeader>
                        Sort by {" "} {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </MenuGroupHeader>
                      {(<MenuItem
                        onClick={(e) => {
                          const isControlKeySelected = e.ctrlKey;
                          header.column?.toggleSorting(false, isControlKeySelected)
                        }}
                        icon={<TextSortAscendingFilled />}
                        disabled={header.column.getIsSorted() === "asc"}
                      >
                        Sort A to Z
                      </MenuItem>)}
                      <MenuItem
                         onClick={(e) => {
                          const isControlKeySelected = e.ctrlKey;
                          header.column?.toggleSorting(true, isControlKeySelected)
                        }}
                        icon={<TextSortDescendingFilled />}
                        disabled={header.column.getIsSorted() === "desc"}
                      >
                        Sort Z to A
                      </MenuItem>
                      <MenuDivider />
                    </MenuGroup>)}

                  {header.column.getCanGroup() && (<MenuGroup key={"grouping-group"}>
                    <MenuGroupHeader>
                      Group by{" "}{flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </MenuGroupHeader>
                    {!header.column.getIsGrouped() && (
                      <MenuItem
                        onClick={() =>
                          header.column.getToggleGroupingHandler()()
                        }
                        icon={<GroupFilled />}
                      >
                        Group by{" "}{flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </MenuItem>
                    )}
                    {header.column.getIsGrouped() && (
                      <MenuItem
                        onClick={() =>
                          header.column.getToggleGroupingHandler()()
                        }
                        icon={<GroupDismissFilled />}
                      >
                        Remove Grouping on{" "}{flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </MenuItem>
                    )}
                    <MenuDivider />
                  </MenuGroup>)}
                   
                  {header.column.getCanFilter() && (
                  <MenuGroup key={"filter-group"}>
                    <MenuGroupHeader>
                      Filter by{" "}{flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </MenuGroupHeader>
                    <Filter column={header.column} table={table} />
                  </MenuGroup>)} 
                                    
                </MenuList>
              </MenuPopover>
            </Menu>
          </div>)}
        </div>
      </div>

      {header.column.getCanResize() && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={mergeClasses(
            styles.resizer,
            column.getIsResizing() && styles.resizerActive
          )}
        />
      )}

    </th>
  );
};
