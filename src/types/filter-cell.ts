import { GridFilterCellProps } from "@progress/kendo-react-grid";
import { SyntheticEvent } from "react";

export interface FilterProps {
  value: any;
  onChange: (event: { value: any; operator?: string | Function; syntheticEvent?: SyntheticEvent }) => void;
  operator?: string;
}