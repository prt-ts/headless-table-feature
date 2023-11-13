import * as React from "react";
import { ColumnDef, ColumnFiltersState, GroupingState, SortingState, VisibilityState } from "@tanstack/react-table";

export type TableProps<TItem extends object> = {
    /**
     * Table Columns definitions.
     */
    columns: ColumnDef<TItem>[];

    /**
     * Table data.
     */
    data: TItem[];

    /**
     * Table loading state.
     */
    isLoading?: boolean;

    /**
     * Grid title
     */
    gridTitle?: JSX.Element | React.ReactNode;

    /**
     * Table default page size.
     */
    pageSize?: number;

    /**
     * Table page size options
     */
    pageSizeOptions?: number[];

    /**
     * Row selection mode.
     */
    rowSelectionMode?: "single" | "multiple";

    /**
     * Default global filter value.
     */
    defaultGlobalFilter?: string;

    /**
     * Column filter state
     */
    columnFilterState?: ColumnFiltersState;

    /** 
     * Column Visibility
     */
    columnVisibility?: VisibilityState;

    /**
     * Sorting state
     */
    sortingState?: SortingState;

    /**
     * Grouping state
     */
    groupingState?: GroupingState;

    /**
    * Component visible if the no item match the filter condition
    * @default defaultNoItemComponent
    */
    noFilterMatchPage?: React.ReactNode;

    /**
     * Component visible in the grid body if there is no items in the list
     * @default defaultNoItemComponent
     */
    noItemPage?: React.ReactNode;
};