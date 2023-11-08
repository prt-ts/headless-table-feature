import { Table } from "@tanstack/react-table";

export type TableRef<TItem extends object> = {
    table: Table<TItem>;
};