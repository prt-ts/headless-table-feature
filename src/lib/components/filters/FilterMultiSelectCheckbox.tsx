import { Checkbox } from "@fluentui/react-components"
import { Column } from "@tanstack/react-table"
import * as React from "react"
import { useVirtual } from "react-virtual"

export const FilterMultiSelectCheckbox = <TItem extends object>({
    column
}: {
    column: Column<TItem, unknown>
}) => {
    const columnFilterValue = column.getFilterValue() as string[]; 
    const [filterOptions, setFilterOptions] = React.useState<string[]>([]);
    React.useEffect(() => {
        const uniqueSortedOptions = Array.from(column.getFacetedUniqueValues().keys()).sort()
        setFilterOptions(uniqueSortedOptions)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    [column.getFacetedUniqueValues()])

    const filterContainer = React.useRef<HTMLDivElement>(null);
    const rowVirtualizer = useVirtual({
        parentRef: filterContainer,
        size: filterOptions.length,
        overscan: 5,
    });
    const { virtualItems: virtualRows, totalSize } = rowVirtualizer;

    const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
    const paddingBottom = virtualRows.length > 0
        ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
        : 0;

    return (<div ref={filterContainer} style={{ display: "flex", flexDirection: "column", maxHeight: "300px", width: "100%", overflowY: "auto" }}>
        {paddingTop > 0 && <div style={{ height: `${paddingTop}px` }} />}
        {
            virtualRows.map(row => {
                const value = filterOptions[row.index];
                return (
                    <div style={{ height: "30px" }}>
                        <Checkbox
                            key={value}
                            checked={columnFilterValue?.includes(value) ?? false}
                            onChange={() => {
                                if (columnFilterValue?.includes(value)) {
                                    column.setFilterValue((old: string[]) => old?.filter(v => v !== value))
                                    return;
                                }
                                column.setFilterValue((old: string[]) => [...(old || []), value])
                            }}
                            label={value}
                        />
                    </div>)
            })
        }
        {paddingBottom > 0 && <div style={{ height: `${paddingBottom}px` }}></div>}
    </div>
    )
} 