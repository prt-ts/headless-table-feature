import { createRef, useEffect, useState } from 'react'
import './App.css'
import { ColumnDef, Table, createColumnHelper } from './lib'
import { Person, makeData } from './data/data'
import { TableRef } from './lib/types'
import { Button, Field, Radio, RadioGroup } from '@fluentui/react-components'
import {
  EditRegular,
  DeleteRegular,
} from "@fluentui/react-icons";

function App() {

  const columnHelper = createColumnHelper<Person>()

  const columns = [
    columnHelper.accessor('id', {
      id: 'id',
      header: () => 'ID',
      cell: ({ row }) => {
        return <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <strong>{row.getValue("id")}</strong>
          <TableAction />
        </div>
      },
      aggregatedCell: () => null,
      filterFn: "arrIncludesSome",
      enableGrouping: false, 
      enablePinning: true,
    }),
    columnHelper.accessor('firstName', {
      id: 'firstName',
      header: () => 'First Name',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor(row => row.lastName, {
      id: 'lastName',
      cell: info => <i>{info.getValue()}</i>,
      header: () => <span>Last Name</span>,
      aggregatedCell: () => null,
    }),
    columnHelper.accessor('age', {
      id: 'age',
      header: () => 'Age (Additional text for Long header)',
      cell: info => info.renderValue(),
      aggregationFn: "mean",
      size: 400,
      enableGrouping: false,
    }),
    columnHelper.accessor('visits', {
      id: 'visits',
      header: () => <span>Visits</span>,
      enableHiding: false,
    }),
    columnHelper.accessor('progress', {
      id: 'progress',
      header: 'Profile Progress',
      aggregatedCell: () => null,
    }),
    columnHelper.group({
      id: 'address',
      header: 'Address',
      columns: [
        columnHelper.accessor('address.street', {
          id: 'street',
          header: 'Street',
          aggregatedCell: () => null,
        }),
        columnHelper.accessor('address.city', {
          id: 'city',
          header: 'City',
          aggregatedCell: () => null,
        }),
        columnHelper.accessor('address.state', {
          id: 'state',
          header: 'State',
          aggregatedCell: () => null,
          filterFn: "arrIncludesSome",
        }),
        columnHelper.accessor('address.zipCode', {
          id: 'zipCode',
          header: 'Zip Code',
          aggregatedCell: () => null,
          enableColumnFilter: false,
        }),
        columnHelper.accessor('address.country', {
          id: 'country',
          header: 'Country',
          aggregatedCell: () => null,
          filterFn: "arrIncludes",
        }),
      ]
    }),
    columnHelper.group({
      id: 'additionalInfo',
      header: 'Additional Info',
      columns: [
        columnHelper.accessor('status', {
          id: 'status',
          header: 'Status',
          aggregatedCell: () => null,
          filterFn: "arrIncludesSome",
        }),
        columnHelper.accessor('createdAt', {
          id: 'createdAt',
          header: 'Created At',
          cell: info => info.renderValue() ? new Date(info.renderValue() as Date)?.toLocaleDateString() : "",
          aggregatedCell: () => null,
          filterFn: (row, filterValue) => {
            const value = row.getValue("createdAt") as string;
            console.log(value)
            if (!value) return false;
            return value ? new Date(value as string)?.toLocaleDateString().includes(filterValue as string) : false
          },
          enableColumnFilter: false,
        }),
      ]
    }),
  ] as ColumnDef<Person>[]

  const [data, setData] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setData(() => makeData(1000))
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [])

  const tableRef = createRef<TableRef<Person>>()

  const logSelectedRows = () => {
    const table = tableRef.current?.table;
    const selectedRow = table?.getSelectedRowModel().flatRows.map(row => row.original);
    console.log(selectedRow)
  }

  const logTableState = () => {
    const tableState = tableRef.current?.getTableState();
    console.log(tableState)
  }

  const [selectionMode, setSelectionMode] = useState<"single" | "multiple" | undefined>("multiple")


  return (
    <div>
      <button onClick={logSelectedRows}>Log Selected Rows</button>
      <button onClick={logTableState}>Get Table State</button>
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
        // sortingState={[
        //   { id: "id", desc: false },
        //   { id: "age", desc: true },
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

export default App

export const TableAction = () => {


  return (
    <><Button icon={<EditRegular />} aria-label="Edit" />
      <Button icon={<DeleteRegular />} aria-label="Delete" /></>
  );
};