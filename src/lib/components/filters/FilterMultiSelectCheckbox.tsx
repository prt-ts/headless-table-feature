import { Checkbox } from "@fluentui/react-components"
import { Column, Table } from "@tanstack/react-table"
import * as React from "react"
import { useVirtual } from "react-virtual"

export const FilterMultiSelectCheckbox = <TItem extends object>({
    column,
    table
}: {
    column: Column<TItem, unknown>,
    table: Table<TItem>

}) => {
    const firstValue = table
        .getPreFilteredRowModel()
        .flatRows[0]?.getValue(column.id)
    const columnFilterValue = column.getFilterValue() as string[];
    const [filterOptions, setFilterOptions] = React.useState<string[]>([]);
    React.useEffect(() => {
        const uniqueSortedOptions = typeof firstValue === "number" || !isNaN(firstValue as number) ?
            Array.from(column.getFacetedUniqueValues().keys()).sort((a, b) => Number(a) - Number(b))
            : Array.from(column.getFacetedUniqueValues().keys()).sort()
        setFilterOptions(uniqueSortedOptions)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    [column.getFacetedUniqueValues()])

    const filterContainer = React.useRef<HTMLDivElement>(null);
    const rowVirtualizer = useVirtual({
        parentRef: filterContainer,
        size: filterOptions.length,
        overscan: 15,
    });
    const { virtualItems: virtualRows, totalSize } = rowVirtualizer;

    const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
    const paddingBottom = virtualRows.length > 0
        ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
        : 0;
 
    return (
        <div
            key={"filter-multi-select-checkbox"}
            ref={filterContainer}
            style={{
                display: "flex",
                flexDirection: "column",
                height: "300px",
                width: "100%",
                overflow: "auto"
            }}>
            {paddingTop > 0 && <span style={{ paddingTop: `${paddingTop}px` }} ></span>}
            {
                virtualRows.map((row) => {
                    const value = `${filterOptions[row.index]}`;
                    return (
                        <Checkbox
                            key={`${column.id}-${row.index}`}
                            checked={columnFilterValue?.includes(value) ?? false}
                            onChange={() => {
                                if (columnFilterValue?.includes(value)) {
                                    column.setFilterValue((old: string[]) => old?.filter(v => v !== value))
                                    return;
                                }
                                column.setFilterValue((old: string[]) => [...(old || []), value])
                            }}
                            label={value}
                        />)
                })
            }
            {paddingBottom > 0 && <span style={{ paddingBottom: `${paddingBottom}px` }}></span>}
        </div>
    )
} 