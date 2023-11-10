import { Popover, PopoverTrigger, Button, PopoverSurface, MenuGroupHeader, Checkbox, Divider, Input } from '@fluentui/react-components';
import * as React from 'react';
import { ToggleGroupColumnIcon, ToggleSelectColumnIcon } from '../icon-components/GridIcons';
import { useGridHeaderStyles } from './useGridHeaderStyles';
import { Table } from '@tanstack/react-table';
import {
    Search24Regular,
  } from "@fluentui/react-icons";

type GridHeaderProps<TItem extends object> = {
    table: Table<TItem>,
    gridTitle: JSX.Element | React.ReactNode,
    globalFilter: string,
    setGlobalFilter: (value: string) => void,
}

export const GridHeader = <TItem extends object>(props: GridHeaderProps<TItem>) => {
    const { table, gridTitle, globalFilter, setGlobalFilter } = props; 
    const styles = useGridHeaderStyles(); 

    const allLeafColumns = table.getAllLeafColumns() || []; 

    return (
        <div className={styles.tableTopHeaderContainer}>
            <div className={styles.tableTopHeaderLeft}>{gridTitle}</div>
            <div className={styles.tableTopHeaderRight}>
                <Popover withArrow>
                    <PopoverTrigger disableButtonEnhancement>
                        <Button icon={<ToggleGroupColumnIcon />} />
                    </PopoverTrigger>

                    <PopoverSurface>
                        <div className={styles.tableTopHeaderColumnTogglePopover}>
                            <MenuGroupHeader>Group Columns</MenuGroupHeader>
                            {allLeafColumns.map((column) => {
                                if (column.id === "select") return null;
                                if (column.id === "id") return null;
                                return (
                                    <Checkbox
                                        key={column.id}
                                        checked={column.getIsGrouped()}
                                        onChange={column.getToggleGroupingHandler()}
                                        disabled={!column.getCanGroup()}
                                        label={column.id}
                                    />
                                );
                            })}
                        </div>
                    </PopoverSurface>
                </Popover>
                <Popover withArrow>
                    <PopoverTrigger disableButtonEnhancement>
                        <Button icon={<ToggleSelectColumnIcon />} />
                    </PopoverTrigger>

                    <PopoverSurface>
                        <div className={styles.tableTopHeaderColumnTogglePopover}>
                            <MenuGroupHeader>Toggle Columns</MenuGroupHeader>
                            <Checkbox
                                checked={table.getIsAllColumnsVisible()}
                                onChange={table.getToggleAllColumnsVisibilityHandler()}
                                label={"Toggle All"}
                            />
                            <Divider />
                            {table.getAllLeafColumns().map((column) => {
                                if (column.id === "select") return null;
                                if (column.id === "id") return null;

                                return (
                                    <Checkbox
                                        key={column.id}
                                        checked={column.getIsVisible()}
                                        onChange={column.getToggleVisibilityHandler()}
                                        label={column.id}
                                        disabled={!column.getCanHide()}
                                    />
                                );
                            })}
                        </div>
                    </PopoverSurface>
                </Popover>
                <DebouncedInput
                    value={globalFilter ?? ""}
                    onChange={(value) => setGlobalFilter(String(value))}
                    className="p-2 font-lg shadow border border-block"
                    placeholder="Search all columns..."
                />
            </div>
        </div>
    );
}

// A debounced input react component
function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = 500,
}: {
    value: string | number;
    onChange: (value: string | number) => void;
    debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
    const [value, setValue] = React.useState<string | number>("");

    React.useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value);
        }, debounce);

        return () => clearTimeout(timeout);
    }, [value, onChange, debounce]);

    return (
        <Input
            placeholder="Search Keyword"
            value={value as string}
            onChange={(_, data) => setValue(data.value)}
            type="search"
            autoComplete="off"
            contentBefore={<Search24Regular />}
            style={{ width: "300px" }}
        />
    );
}
