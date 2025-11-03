import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export interface DateRangeState {
  start: string | null;
  end: string | null;
}

export interface DateRangePayload {
  start: string | null;
  end: string | null;
}

const initialState: DateRangeState = {
  start: null,
  end: null,
};

const dateRangeSlice = createSlice({
  name: "dateRange",
  initialState,
  reducers: {
    setDateRange: (state, action: PayloadAction<DateRangePayload>) => {
      state.start = action.payload.start;
      state.end = action.payload.end;
    },
    clearDateRange: (state) => {
      state.start = null;
      state.end = null;
    },
  },
});

export const { setDateRange, clearDateRange } = dateRangeSlice.actions;
export const selectDateRange = (state: RootState) => state.dateRange;
export default dateRangeSlice.reducer;