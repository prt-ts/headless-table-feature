import { Radio, RadioGroup } from "@fluentui/react-components"
import { Column } from "@tanstack/react-table"
import * as React from "react"
import { useVirtual } from "react-virtual"

export const FilterMultiSelectRadio = <TItem extends object>({
    column
}: {
    column: Column<TItem, unknown>
}) => {
    const columnFilterValue = column.getFilterValue() as string[] 
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

    return (
        <div ref={filterContainer} style={{ display: "flex", flexDirection: "column", maxHeight: "300px", width: "100%", overflowY: "auto" }}>
            {paddingTop > 0 && <div style={{ height: `${paddingTop}px` }} />}
            <RadioGroup
                layout="vertical"
                value={(columnFilterValue?.[0]) || ""}
                onChange={(_, data) => {
                    if(data.value === "") {
                        column.setFilterValue([])
                        return;
                    }
                    column.setFilterValue([data.value])
                }}
            >
                <Radio value={""} label={"None"} />
                {
                    virtualRows.map(row => {
                        const value = filterOptions[row.index];
                        return (<Radio
                            key={value}
                            value={value}
                            label={value}
                        />)
                    })
                }
            </RadioGroup>
            {paddingBottom > 0 && <div style={{ height: `${paddingBottom}px` }}></div>}
        </div>
    )
} 