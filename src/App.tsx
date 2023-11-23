import { createRef, useEffect, useState } from "react";
import { Person, makeData } from "./data/data";
import { Button, Field, Radio, RadioGroup } from "@fluentui/react-components";
import { EditRegular, DeleteRegular } from "@fluentui/react-icons";
import {
  ColumnDef,
  Table,
  TableRef,
  createColumnHelper,
} from "@prt-ts/fluent-react-table-v2"; 
import { tableViews } from "./data/tableViews";

export default function App() { 
  const columnHelper = createColumnHelper<Person>();
  const tableRef = createRef<TableRef<Person>>();
  const [data, setData] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState<
    "single" | "multiple" | undefined
  >("multiple");

  const logSelectedRows = () => {
    const table = tableRef.current?.table;
    const selectedRow = table
      ?.getSelectedRowModel()
      .flatRows.map((row) => row.original);
    console.log(selectedRow);
  };

  const logTableState = () => {
    const tableState = tableRef.current?.getTableState();
    console.log(tableState);
  };

  const saveCurrentTableState = () => {
     const tableState = tableRef.current?.getTableState();
     localStorage.setItem("view1", JSON.stringify(tableState));
      console.log(tableState);
  };

  const applyLastSavedTableState = () => {
    const tableState = localStorage.getItem("view1");
    if(!tableState) return;

    tableRef.current?.applyTableState(JSON.parse(tableState));
  };

  const applyBeforeEditState = () => {
    const tableState = localStorage.getItem("table1_edit_temp");
    if(!tableState) return;

    tableRef.current?.applyTableState(JSON.parse(tableState));
  };

  const columns = [
    columnHelper.accessor("id", {
      id: "id",
      header: () => "ID",
      cell: ({ row }) => {
        return (
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Button
              icon={<EditRegular />}
              aria-label="Edit"
              size="small"
              onClick={async () => {

                const tableState = tableRef.current?.getTableState();
                localStorage.setItem("table1_edit_temp", JSON.stringify(tableState));
                 
              }}
            />
            <Button
              icon={<DeleteRegular />}
              aria-label="Delete"
              size="small"
              onClick={() => {
                const confirm = window.confirm(
                  "Are you sure you want to delete this row?"
                );
                if (confirm) {
                  alert("Deleted");
                }
              }}
            />
            <strong>{row.getValue("id")}</strong>
          </div>
        );
      },
      aggregatedCell: () => null,
      filterFn: "arrIncludes",
      enableGrouping: false,
      enablePinning: true 
    }),
    columnHelper.accessor("firstName", {
      id: "firstName",
      header: () => "First Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor((row) => row.lastName, {
      id: "lastName",
      cell: (info) => <i>{info.getValue()}</i>,
      header: () => <span>Last Name</span>,
      aggregatedCell: () => null,
    }),
    columnHelper.accessor("age", {
      id: "age",
      header: () => "Age (Additional text for Long header)",
      cell: (info) => info.renderValue(),
      aggregationFn: "mean",
      size: 400,
      enableGrouping: false,
    }),
    columnHelper.accessor("visits", {
      id: "visits",
      header: () => <span>Visits</span>,
      enableHiding: false,
    }),
    columnHelper.accessor("progress", {
      id: "progress",
      header: "Profile Progress",
      aggregatedCell: () => null,
    }),
    columnHelper.group({
      id: "address",
      header: "Address",
      columns: [
        columnHelper.accessor("address.street", {
          id: "street",
          header: "Street",
          aggregatedCell: () => null,
        }),
        columnHelper.accessor("address.city", {
          id: "city",
          header: "City",
          aggregatedCell: () => null, 
        }),
        columnHelper.accessor("address.state", {
          id: "state",
          header: "State",
          aggregatedCell: () => null,
          filterFn: "arrIncludesSome",
        }),
        columnHelper.accessor("address.zipCode", {
          id: "zipCode",
          header: "Zip Code",
          aggregatedCell: () => null, 
        }),
        columnHelper.accessor("address.country", {
          id: "country",
          header: "Country",
          aggregatedCell: () => null,
          filterFn: "arrIncludes",
        }),
      ],
    }),
    columnHelper.group({
      id: "additionalInfo",
      header: "Additional Info",
      columns: [
        columnHelper.accessor("status", {
          id: "status",
          header: "Status",
          aggregatedCell: () => null,
          filterFn: "arrIncludesSome",
        }),
        columnHelper.accessor("createdAt", {
          id: "createdAt",
          header: "Created At",
          cell: (info) =>
            info.renderValue()
              ? new Date(info.renderValue() as Date)?.toLocaleDateString()
              : "",
          aggregatedCell: () => null,
          filterFn: "dateRange"
        }),
      ],
    }),
  ] as ColumnDef<Person>[];

  // get data from server
  useEffect(
    () => {
      const timeout = setTimeout(() => {
        setData(() => makeData(1000));
        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(timeout);
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    []
  );

  // apply before edit state so that the table state is applied after the data is loaded
  useEffect(
    () => {
      applyBeforeEditState();

      if(data.length > 0) {
        localStorage.removeItem("table1_edit_temp");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  return (
    <div>
      <button onClick={logSelectedRows}>Log Selected Rows</button>
      <button onClick={logTableState}>Get Table State</button>
      <button onClick={saveCurrentTableState}>Save Current Table State</button>
      <button onClick={applyLastSavedTableState}>
        Apply Last Saved Table State
      </button>
      <Field label="Selection Mode">
        <RadioGroup
          value={selectionMode}
          onChange={(_, data) =>
            setSelectionMode(data.value as unknown as "single" | "multiple")
          }
          layout="horizontal"
        >
          <Radio value={undefined} label="None" />
          <Radio value={"single"} label="Single" />
          <Radio value={"multiple"} label="Multiple" />
        </RadioGroup>
      </Field>
      <Table
        ref={tableRef}
        data={data}
        columns={columns}
        pageSize={100}
        pageSizeOptions={[10, 20, 100, 1000, 10000]}
        isLoading={isLoading}
        gridTitle={<strong>Grid Header</strong>}
        rowSelectionMode={selectionMode}
        columnVisibility={{
          progress: false,
          firstName: false,
        }}
        views={tableViews}
        // sortingState={[
        //   { id: "id", desc: false }
        // ]}
        // columnPinningState={
        //   {
        //     left: ["state"],
        //   }
        // }
        // groupingState={["status"]}
        // expandedState={{
        //   "status:complicated": true
        // }}
        // noItemPage={<div>No Item</div>}
        // noFilterMatchPage={<div>No Filter Match</div>}
      />
    </div>
  );
}
