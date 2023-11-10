import { Column, Table } from "@tanstack/react-table"
import { FilterMultiSelectCheckbox } from "./FilterMultiSelectCheckbox"
import { Input } from "@fluentui/react-components"
import { FilterMultiSelectRadio } from "./FilterMultiSelectRadio"

export const Filter = <TItem extends object>({
    column,
}: {
    column: Column<TItem, unknown>
    table: Table<TItem>
}) => {
    const sortFunctionName = column.getFilterFn()?.name || "arrIncludesSome";

    switch (sortFunctionName) {

        case "arrIncludesSome":
            return (
                <FilterMultiSelectCheckbox column={column} />
            )
        case "arrIncludesEvery":
            return (
                <FilterMultiSelectRadio column={column} />
            )
        case "arrIncludes":
            return (
                <FilterMultiSelectRadio column={column} />
            )
    }

    return (
        <div>
            <Input
                type="search"
                value={(column.getFilterValue() || "") as string}
                onChange={(_, data) => {
                    column.setFilterValue(data.value)
                }}
                placeholder="Search..."
            />
        </div>
    )
} 