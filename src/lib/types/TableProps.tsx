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
     * Table default page size.
     */
    pageSize?: number;

    /**
     * Table page size options
     */
    pageSizeOptions?: number[];
};