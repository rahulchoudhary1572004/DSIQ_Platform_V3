import React, { forwardRef, memo, useCallback } from "react";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import type {
  GridColumnProps,
  GridFilterChangeEvent,
  GridGroupChangeEvent,
  GridPageChangeEvent,
  GridSortChangeEvent,
  GridProps,
} from "@progress/kendo-react-grid";
import { Slider, NumericTextBox } from "@progress/kendo-react-inputs";
import type {
  CompositeFilterDescriptor,
  GroupDescriptor,
  SortDescriptor,
  DataResult,
} from "@progress/kendo-data-query";
import type { SliderChangeEvent, NumericTextBoxChangeEvent } from "@progress/kendo-react-inputs";
import type { BasePageChangeEvent } from "@progress/kendo-react-data-tools";
import type { CSSProperties, ReactNode, ComponentRef, ComponentType } from "react";

declare module "@progress/kendo-react-grid" {
  interface GridProps {
    groupHeaderCell?: ComponentType<any>;
    groupPanel?: {
      className?: string;
      placeholder?: string;
    };
  }

}

interface PagerProps extends Record<string, unknown> {
  skip: number;
  take: number;
  total: number;
  syntheticEvent?: React.SyntheticEvent;
  nativeEvent?: Event;
  onPageChange?: (event: BasePageChangeEvent) => void;
}

export interface PageState {
  skip: number;
  take: number;
}

export interface KendoDataGridProps<T extends Record<string, unknown>> {
  data: T[];
  processedData: DataResult;
  columns: Array<GridColumnProps & Record<string, unknown>>;
  filter: CompositeFilterDescriptor;
  sort: SortDescriptor[];
  group: GroupDescriptor[];
  page: PageState;
  onFilterChange: (filter: CompositeFilterDescriptor) => void;
  onSortChange: (sort: SortDescriptor[]) => void;
  onGroupChange: (group: GroupDescriptor[]) => void;
  onPageChange: (page: PageState) => void;
  loading?: boolean;
  emptyStateComponent?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

interface GroupHeaderCellProps {
  colSpan?: number;
  field?: string;
  value?: ReactNode;
  rowType?: string;
  rowIndex?: number;
}

// Reusable Pager Component
const MyPager: React.FC<PagerProps> = (props) => {
  const { skip, take, total, onPageChange } = props;
  const currentPage = Math.floor(skip / take) + 1;
  const totalPages = Math.max(Math.ceil(total / take) || 1, 1);

  const handleChange = (event: SliderChangeEvent | NumericTextBoxChangeEvent) => {
    const value = event.value ?? 1;
    onPageChange?.({
      skip: (Math.max(value, 1) - 1) * take,
      take,
      syntheticEvent: (event as SliderChangeEvent).syntheticEvent,
      nativeEvent: event.nativeEvent as Event | undefined,
      targetEvent: { value },
    } as BasePageChangeEvent);
  };

  return (
    <div className="k-pager k-pager-md k-grid-pager border-t border-gray-200">
      <div className="flex flex-col md:flex-row items-center justify-between p-2 gap-2">
        <div className="w-full md:w-1/3">
          <Slider buttons step={1} value={currentPage} min={1} max={totalPages} onChange={handleChange} />
        </div>
        <div className="w-full md:w-1/3 flex justify-center">
          <NumericTextBox value={currentPage} onChange={handleChange} min={1} max={totalPages} width={60} />
        </div>
        <div className="w-full md:w-1/3 text-center md:text-right text-gray-600">{`Page ${currentPage} of ${totalPages}`}</div>
      </div>
    </div>
  );
};

// Reusable Group Header Cell
const GroupHeaderCell = memo<GroupHeaderCellProps>((props) => {
  if (props.rowIndex === 0 || props.rowType !== "groupHeader") {
    return (
      <td colSpan={props.colSpan} className="bg-peach">
        <div className="flex items-center p-2">
          <span className="text-table text-dark-gray">
            {props.field ?? ""}: {props.value ?? "N/A"}
          </span>
        </div>
      </td>
    );
  }
  return null;
});

GroupHeaderCell.displayName = "GroupHeaderCell";

// Main Data Grid Component
const KendoDataGrid = forwardRef<ComponentRef<typeof Grid>, KendoDataGridProps<Record<string, unknown>>>(
  (
    {
      data,
      processedData,
      columns,
      filter,
      sort,
      group,
      page,
      onFilterChange,
      onSortChange,
      onGroupChange,
      onPageChange,
      loading = false,
      emptyStateComponent,
      className = "",
      style = {},
    },
    ref
  ) => {
    const handleFilterChange = useCallback(
      (event: GridFilterChangeEvent) => {
        onFilterChange(event.filter ?? filter);
      },
      [filter, onFilterChange]
    );

    const handleSortChange = useCallback(
      (event: GridSortChangeEvent) => {
        onSortChange(event.sort ?? sort);
      },
      [onSortChange, sort]
    );

    const handleGroupChange = useCallback(
      (event: GridGroupChangeEvent) => {
        onGroupChange(event.group ?? group);
      },
      [group, onGroupChange]
    );

    const handlePageChange = useCallback(
      (event: GridPageChangeEvent) => {
        if (event.page) {
          onPageChange(event.page as PageState);
        }
      },
      [onPageChange]
    );

    const hasData = Array.isArray(processedData?.data) && processedData.data.length > 0;

    return (
      <div className={`overflow-x-auto ${className}`} style={style}>
        {loading ? (
          <div className="flex justify-center items-center h-64">Loading...</div>
        ) : !hasData ? (
          emptyStateComponent ?? null
        ) : (
          <Grid
            ref={ref}
            style={{ height: "100%", border: "none", minWidth: "600px" }}
            data={processedData}
            filterable
            sortable
            groupable
            filter={filter}
            sort={sort}
            group={group}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            onGroupChange={handleGroupChange}
            pageable
            skip={page.skip}
            take={page.take}
            total={data.length || 0}
            onPageChange={handlePageChange}
            pager={MyPager as GridProps["pager"]}
            className="border-none"
            groupHeaderCell={GroupHeaderCell as GridProps["groupHeaderCell"]}
            groupPanel={{
              className: "bg-white p-3 mb-2 border border-light-gray rounded",
              placeholder: "Drag a column header and drop it here to group by that column",
            }}
          >
            {columns.map((column, index) => (
              <Column
                key={(typeof column.field === "string" && column.field.length > 0 ? column.field : column.title) ?? index}
                {...column}
                cell={(cellProps) => {
                  const { field } = cellProps;
                  const rawValue = field ? (cellProps.dataItem as Record<string, unknown>)[field] : undefined;
                  const baseClass = "whitespace-normal break-words p-2 text-sm text-gray-800";

                  if (React.isValidElement(rawValue)) {
                    return <td className={baseClass}>{rawValue}</td>;
                  }

                  if (typeof rawValue === "string" || typeof rawValue === "number") {
                    return <td className={baseClass}>{rawValue}</td>;
                  }

                  if (Array.isArray(rawValue)) {
                    const textValue = rawValue
                      .map((value) => (typeof value === "string" || typeof value === "number" ? value : "[object]"))
                      .join(", ");
                    return <td className={baseClass}>{textValue}</td>;
                  }

                  if (typeof rawValue === "object" && rawValue !== null) {
                    return <td className={baseClass}>[object]</td>;
                  }

                  return <td className={baseClass}></td>;
                }}
              />
            ))}
          </Grid>
        )}
      </div>
    );
  }
);

KendoDataGrid.displayName = "KendoDataGrid";

export default KendoDataGrid;
