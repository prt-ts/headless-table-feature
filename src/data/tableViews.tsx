import { TableView } from "@prt-ts/fluent-react-table-v2";

export const tableViews : TableView[] = [
    {
        id: 1,
        viewName: "Table View 1",
        tableState: {"pagination":{"pageSize":100,"pageIndex":0},"sorting":[],"columnFilters":[],"globalFilter":"","grouping":[],"expanded":{},"rowSelection":{},"columnOrder":["id","firstName","lastName","age","visits","progress","street","city","state","zipCode","country","status","createdAt"],"columnVisibility":{"progress":false,"firstName":false},"columnPinning":{},"columnSizing":{}}
    },
    {
        id: 2,
        viewName: "Table View 2",
        tableState: {"pagination":{"pageSize":100,"pageIndex":0},"sorting":[],"columnFilters":[],"globalFilter":"","grouping":[],"expanded":{},"rowSelection":{},"columnOrder":["id","firstName","lastName","age","visits","progress","street","city","state","zipCode","country","status","createdAt"],"columnVisibility":{"progress":false,"firstName":false,"createdAt":false,"status":false,"country":false,"zipCode":false,"state":false,"city":false,"street":false},"columnPinning":{},"columnSizing":{"age":188}}
    }
];