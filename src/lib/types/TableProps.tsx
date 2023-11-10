import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";

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
     * Hidden columns
     */
    defaultHiddenColumns?: string[];

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