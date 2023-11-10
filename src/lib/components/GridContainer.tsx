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
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
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
  Filter24Filled,
} from "@fluentui/react-icons";
import { useStaticStyles, useTableStaticStyles } from "./table/useTableStaticStyles";
import { Pagination } from "./pagination/Pagination";
import { GridHeader } from "./grid-header";
import { Loading } from "./loading";
import { NoItemGrid } from "./no-item";
const SortAscIcon = bundleIcon(ArrowSortDown20Filled, ArrowSortDown20Regular);
const SortDescIcon = bundleIcon(ArrowSortUp20Filled, ArrowSortUp20Regular);

export function AdvancedTable<TItem extends object>(
  props: TableProps<TItem>,
  ref: React.ForwardedRef<TableRef<TItem>>
) {
  const { columns, data, rowSelectionMode } = props;

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [grouping, setGrouping] = React.useState<GroupingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = React.useState({});

  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(
    columns.map((column) => column.id as string)
  );

  const table = useReactTable<TItem>({
    columns: columns,
    data,
    initialState: {

    },
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
    enableRowSelection: rowSelectionMode !== undefined,
    enableMultiRowSelection: rowSelectionMode === "multiple",
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
        <table className={styles.table}>
          <thead className={styles.tHead}>
            {headerGroups?.map((headerGroup) => (
              <tr key={headerGroup.id}>
                {rowSelectionMode === "multiple" && (
                  <td style={{ width: "1rem" }}>
                    {headerGroup.depth === headerGroups?.length - 1 && (<Checkbox
                      checked={
                        table.getIsSomeRowsSelected()
                          ? "mixed"
                          : table.getIsAllRowsSelected()
                      }
                      onChange={table.getToggleAllRowsSelectedHandler()}
                    />)}
                  </td>
                )}
                {rowSelectionMode === "single" && (
                  <td style={{ width: "1rem" }}> </td>
                )}
                {headerGroup.headers.map((header) => {
                  return (
                    <HeaderCell
                      key={header.id}
                      header={header as unknown as Header<object, unknown>}
                      table={table as unknown as Table<object>}
                      hideMenu={headerGroup.depth !== headerGroups?.length - 1}
                    />
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className={styles.tBody}>
            {/* placeholder for virtualization */}
            {paddingTop > 0 && (
              <tr className={styles.tBodyRow}>
                <td style={{ height: `${paddingTop}px` }} />
              </tr>
            )}
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <tr
                  key={row.id}
                  className={
                    row.getIsSelected()
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
                      />
                    </td>
                  )}
                  {rowSelectionMode == "single" && (
                    <td className={styles.tBodyCell}>
                      <Radio
                        checked={row.getIsSelected()}
                        disabled={!row.getCanSelect()}
                        onChange={row.getToggleSelectedHandler()}
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
                    >
                      {cell.getIsGrouped() ? (
                        // If it's a grouped cell, add an expander and row count
                        <>
                          {/* <button
                            {...{
                              onClick: row.getToggleExpandedHandler(),
                              style: {
                                cursor: row.getCanExpand()
                                  ? "pointer"
                                  : "normal",
                              },
                            }}
                          > */}
                          {/* {row.getIsExpanded() ? "👇" : "👉"}{" "} */}
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}{" "}
                          ({row.subRows.length})
                          {/* </button> */}
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
              );
            })}

            {/* placeholder for virtualization */}
            {paddingBottom > 0 && (
              <tr>
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
        {noSearchResult && <NoItemGrid message={props.noFilterMatchPage} />}
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
}> = ({ header, table, hideMenu }) => {
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
        alignItems: "left",
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
                {...{
                  onClick: header.column.getToggleSortingHandler(),
                  onDoubleClick: () => {
                    if (!header.column.getCanGroup()) return;
                    header.column.getToggleGroupingHandler()();
                  },
                  style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "left",
                    flex: 1,
                  },
                }}
                appearance="transparent"
                tabIndex={-1}
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
                    <Filter24Filled />
                  </strong>
                )}

                {/* {header.column.columnDef.id && header.column.getCanResize() && <button ref={dragRef}>🟰</button>} */}
              </Button>
            )}
          </div>
          {!header.isPlaceholder && !hideMenu && (<div>
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <MenuButton appearance="transparent"></MenuButton>
              </MenuTrigger>

              <MenuPopover>
                <MenuList>
                  <MenuGroup>
                    <MenuGroupHeader>Section header</MenuGroupHeader>
                    <MenuItem>Cut</MenuItem>
                    <MenuItem>Paste</MenuItem>
                    <MenuItem>Edit</MenuItem>
                  </MenuGroup>
                  {!header.column.getIsGrouped() && (
                    <MenuItem
                      onSelect={() =>
                        header.column.getToggleGroupingHandler()()
                      }
                    >
                      Group Column
                    </MenuItem>
                  )}
                  {header.column.getIsGrouped() && (
                    <MenuItem
                      onSelect={() =>
                        header.column.getToggleGroupingHandler()()
                      }
                    >
                      Remove Group
                    </MenuItem>
                  )}
                  <MenuDivider />
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
