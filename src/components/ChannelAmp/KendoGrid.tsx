import { Grid, GridColumn, GridColumnMenuFilter, GridColumnMenuCheckboxFilter } from "@progress/kendo-react-grid";
import { process } from "@progress/kendo-data-query";
import { filterIcon } from "@progress/kendo-svg-icons";
import { setGroupIds } from "@progress/kendo-react-data-tools";
import React, { useCallback } from "react";
import ExportUtils from "../ExportUtils";
import ColumnManager from "./ColumnManager";
import showToast from "../../../utils/toast";

const KendoGrid = ({
  data,
  columns,
  setColumns,
  allColumnsState,
  setAllColumnsState,
  gridDataState,
  setGridDataState,
  selectedRows = [],
  setSelectedRows = (rows?: any[]) => { },
  nonRemovableColumns,
  onRowClick,
  aggregates = [],
  showCheckboxColumn = true,
}) => {
  const ColumnMenu = (props) => {
    return (
      <div>
        <GridColumnMenuFilter {...props} expanded={true} />
      </div>
    );
  };

  const ColumnMenuCheckboxFilter = (props) => {
    return (
      <div>
        <GridColumnMenuCheckboxFilter {...props} data={data} expanded={true} />
      </div>
    );
  };

  const FooterCell = (props: any) => {
    const { field } = props;
    if (!data || data.length === 0 || columns.find((col: any) => col.field === field)?.filter !== "numeric") {
      return <td></td>;
    }
    const total = data.reduce((sum: number, item: any) => sum + (Number(item[field]) || 0), 0);
    return (
      <td className="text-right font-bold">
        {columns.find((col) => col.field === field)?.format
          ? columns.find((col) => col.field === field).format.replace("{0:n0}", total.toLocaleString())
          : total.toLocaleString()}
      </td>
    );
  };

  const TotalsFooterCell = () => {
    return (
      <td className="font-bold">
        Totals
      </td>
    );
  };

  const GroupFooterCell = (props) => {
  const { field, dataItem } = props;

  // Check if this is the innermost group
  const isInnermostGroup =
    dataItem.items &&
    dataItem.items.length > 0 &&
    !dataItem.items[0].field;

  // If not the innermost group, it's the checkbox column, or no aggregates, return an empty cell
  if (!isInnermostGroup || field === "selection" || !dataItem.aggregates || !dataItem.aggregates[field]) {
    return <td {...props.tdProps} colSpan={1}></td>;
  }

  // Render aggregate for the innermost group
  let cellContent = "";
  if (aggregates && dataItem.aggregates && dataItem.aggregates[field]) {
    const agg = aggregates.find((a) => a.field === field);
    if (agg && agg.aggregate === "sum") {
      cellContent = `Sum: ${dataItem.aggregates[field].sum.toLocaleString()}`;
    } else if (agg && agg.aggregate === "average") {
      cellContent = `Avg: ${dataItem.aggregates[field].average.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  }
  return <td {...props.tdProps} colSpan={1}>{cellContent}</td>;
};

  const processWithGroups = (data, dataState) => {
    const newDataState = process(data, dataState);
    if (dataState.group && aggregates && aggregates.length > 0) {
      dataState.group.forEach((group) => {
        group.aggregates = aggregates;
      });
      setGroupIds({
        data: newDataState.data,
        group: dataState.group,
      });
    }
    return newDataState;
  };

  const handleDataStateChange = (event) => {
    const newDataState = processWithGroups(data, event.dataState);
    setGridDataState(event.dataState);
  };

  const handleSelectionChange = (event: any) => {
    if (!showCheckboxColumn) return;
    const newSelectedRows = event.selectedRows.map((row: any) => row.dataItem.id);
    setSelectedRows(newSelectedRows);
  };

  const CheckboxCell = (props: any) => {
    const { dataItem } = props;
    const isChecked = selectedRows.includes(dataItem.id);
    return (
      <td>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => {
            const newSelectedRows = isChecked
              ? selectedRows.filter((id: any) => id !== dataItem.id)
              : [...selectedRows, dataItem.id];
            setSelectedRows(newSelectedRows);
          }}
        />
      </td>
    );
  };

  const CheckboxHeaderCell = () => {
    const allSelected = data.length > 0 && data.every((item) => selectedRows.includes(item.id));
    return (
      <input
        type="checkbox"
        checked={allSelected}
        onChange={() => {
          if (allSelected) {
            setSelectedRows([]);
          } else {
            setSelectedRows(data.map((item: any) => item.id));
          }
        }}
      />
    );
  };

  const processedData = processWithGroups(data, gridDataState);

  const rowRender = (trElement: any, props: any) => {
    if (!showCheckboxColumn) return trElement;
    const isSelected = selectedRows.includes(props.dataItem.id);
    const trProps = {
      ...trElement.props,
      className: `${trElement.props.className} ${isSelected ? "k-selected" : ""}`,
    };
    return React.cloneElement(trElement, trProps, trElement.props.children);
  };

  const handleRemoveColumn = useCallback(
    (field) => {
      if (nonRemovableColumns.includes(field)) return;
      setAllColumnsState((prev) => {
        const columnToRemove = prev.visible.find((col) => col.field === field);
        if (!columnToRemove) return prev;
        showToast.success(`Column "${field}" removed successfully. You can get this back from Manage Columns.`);
        return {
          visible: prev.visible.filter((col) => col.field !== field),
          available: [...prev.available, columnToRemove],
        };
      });
      setColumns((prev) => (Array.isArray(prev) ? prev.filter((col) => col.field !== field) : []));
    },
    [setAllColumnsState, setColumns, nonRemovableColumns]
  );

  const hasNumericColumns = columns.some((column) => column.filter === "numeric");

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex justify-end mb-1 items-center">
        <ColumnManager
          columns={columns}
          setColumns={setColumns}
          data={data}
          setData={() => {}}
          nonRemovableColumns={nonRemovableColumns}
          allColumnsState={allColumnsState}
          setAllColumnsState={setAllColumnsState}
        />
        <ExportUtils
          enableExport={true}
          columns={columns}
          processedData={processedData}
          currentData={data}
          sort={gridDataState.sort}
          page={gridDataState}
          aggregates={aggregates}
        />
      </div>
      <Grid
        data={processedData}
        {...gridDataState}
        onDataStateChange={handleDataStateChange}
        sortable={true}
        resizable={true}
        reorderable={true}
        lockable={true}
        pageable={{
          buttonCount: 4,
          pageSizes: [5, 10, 15, "All"],
        }}
        selectable={{
          enabled: showCheckboxColumn,
          mode: "multiple",
          drag: false,
          cell: false,
        }}
        groupable={{
          footer: hasNumericColumns ? "visible" : "none",
          enabled: true,
        }}
        onSelectionChange={handleSelectionChange}
        onRowClick={onRowClick}
        total={data.length}
        columnMenuIcon={filterIcon}
        rowRender={rowRender}
        style={{ maxWidth: "100%" }}
        cells={{
          groupFooter: hasNumericColumns ? GroupFooterCell : undefined,
        }}
      >
        {showCheckboxColumn && (
          <GridColumn
            field="selection"
            title=""
            filter="text"
            width="40px"
            cell={CheckboxCell}
            headerCell={CheckboxHeaderCell}
            resizable={false}
            reorderable={false}
            groupable={false}
          />
        )}
        {Array.isArray(columns) &&
          columns.map((column: any, index: number) => (
            <GridColumn
              key={index}
              field={column.field}
              title={
                (<div className="flex items-center justify-between">
                  <span className="font-medium mr-3">{column.title}</span>
                  {!nonRemovableColumns.includes(column.field) && (
                    <span
                      onClick={() => handleRemoveColumn(column.field)}
                      title="Remove Column"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 311 299"
                        fill="#D32F2F"
                      >
                        <path d="M 42,37 L 40,45 L 47,57 L 128,151 L 92,206 L 86,220 L 87,230 L 92,234 L 104,231 L 152,178 L 216,251 L 227,256 L 235,255 L 241,247 L 237,227 L 182,142 L 236,80 L 241,67 L 234,63 L 214,62 L 200,65 L 158,112 L 114,57 L 94,37 L 81,33 L 50,34 Z" />
                      </svg>
                    </span>
                  )}
                </div>) as any
              }
              filter={column.filter}
              columnMenu={column.filter === "text" ? ColumnMenuCheckboxFilter : column.filter === "date" ? null : ColumnMenu}
              cell={column.cell}
              locked={column.locked}
              className={column.className}
              footerCell={
                hasNumericColumns
                  ? column.filter === "numeric"
                    ? FooterCell
                    : index === 0
                      ? TotalsFooterCell
                      : undefined
                  : undefined
              }
              width={column.width || "190px"}
              minResizableWidth={100}
            />
          ))}
      </Grid>
    </div>
  );
};

export default KendoGrid;