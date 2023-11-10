import { Column, Table } from "@tanstack/react-table"
import { FilterMultiselect } from "./FilterMultiSelect"
import { Input } from "@fluentui/react-components"

export const Filter = <TItem extends object>({
    column,
}: {
    column: Column<TItem, unknown>
    table: Table<TItem>
}) => {
    const columnFilterValue = column.getFilterValue();


    const sortFunctionName = column.getFilterFn()?.name || "arrIncludesSome";

    switch (sortFunctionName) {

        case "arrIncludesSome":
            return (
                <FilterMultiselect column={column} />
            )
        case "arrIncludesEvery":
            return (
                <FilterMultiselect column={column} />
            )
        case "arrIncludes":
            return (
                <FilterMultiselect column={column} />
            )
    }

    return (
        <div>
            <Input
                type="search"
                value={(columnFilterValue || "") as string}
                onChange={(_, data) => {
                    column.setFilterValue(data.value)
                }}
                placeholder="Search..."
            />
        </div>
    )
} 