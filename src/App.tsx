import { createRef, useEffect, useState } from 'react'
import './App.css'
import { ColumnDef, Table, createColumnHelper } from './lib'
import { Person, makeData } from './data/data'
import { TableRef } from './lib/types'
import { Field, Radio, RadioGroup } from '@fluentui/react-components'

function App() {

  const columnHelper = createColumnHelper<Person>()

  const columns = [
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
      aggregatedCell: () => null,
      size: 400,
      enableGrouping: false,
    }),
    columnHelper.accessor('visits', {
      id: 'visits',
      header: () => <span>Visits</span>,
      aggregatedCell: () => null,
      enableHiding: false,

       
    }),
    columnHelper.accessor('status', {
      id: 'status',
      header: 'Status',
      aggregatedCell: () => null,
    }),
    columnHelper.accessor('progress', {
      id: 'progress',
      header: 'Profile Progress',
      aggregatedCell: () => null,
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
  ] as ColumnDef<Person>[]

  const [data, setData] = useState<Person[]>([])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setData(() => makeData(100000))
    }, 1000)

    return () => clearTimeout(timeout)
  }, [])

  const tableRef = createRef<TableRef<Person>>()

  const logSelectedRows = () => {
    const table = tableRef.current?.table;
    const selectedRow = table?.getSelectedRowModel().flatRows.map(row => row.original);
    console.log(selectedRow)
  }

  const [selectionMode, setSelectionMode] = useState<"single" | "multiple" | undefined>("multiple")

  return (
    <>
      <button onClick={logSelectedRows}>Log Selected Rows</button>
      <Field label="Selection Mode">
        <RadioGroup
          value={selectionMode}
          onChange={(_, data) => setSelectionMode(data.value as unknown as "single" | "multiple")}
          layout='horizontal'
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
        isLoading={true}
        gridTitle={<h2>Grid Header</h2>}
        rowSelectionMode={selectionMode}
      />
    </>
  );
}

export default App
