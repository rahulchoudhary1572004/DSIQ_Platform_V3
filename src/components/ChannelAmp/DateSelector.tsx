import { Button } from "@progress/kendo-react-buttons";
import { DateRangePicker } from "@progress/kendo-react-dateinputs";
import { Dialog } from "@progress/kendo-react-dialogs";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setDateRange } from "../../redux/slices/dateRangeSlice";

const dateRangeOptions = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last Quarter", days: 90 },
  { label: "Last 180 Days", days: 180 },
  { label: "Last Year", days: 365 },
  { label: "Clear Selection", days: null },
];

const DateSelector = () => {
  const dispatch = useDispatch();
  const value = useSelector((state) => state.dateRange); // Changed from state.user.dateRange

  // ✅ Fix: Function to safely parse date strings
  const parseStringToDate = (date) => (date ? new Date(date) : null);

  // ✅ Fix: Ensure only ISO strings are sent to Redux
  const calculateRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    return { start: start.toISOString(), end: end.toISOString() };
  };

  const handleRangeSelection = (days) => {
    if (days) {
      dispatch(setDateRange(calculateRange(days)));
    } else {
      dispatch(setDateRange({ start: null, end: null })); // Clear selection
    }
  };

  const [selectedRange, setSelectedRange] = useState({
    start: value?.start || null,
    end: value?.end || null,
  });
  const handleCustomDateChange = (e) => {
    const newRange = {
      start: e.value.start ? e.value.start.toISOString() : selectedRange.start,
      end: e.value.end ? e.value.end.toISOString() : selectedRange.end,
    };

    setSelectedRange(newRange);

    if (newRange.start && newRange.end) {
      dispatch(setDateRange(newRange));
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{ width: "300px" }}>
      <div className="d-inline">
        <span>Date Range - </span>
        <span>{value?.start && "Showing Data from:"}</span>
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          look="outline"
          style={{ width: "100%", marginTop: "12px" }}
        >
          {value?.start && value?.end
            ? `${parseStringToDate(value.start).toLocaleDateString("en-GB")} - 
               ${parseStringToDate(value.end).toLocaleDateString("en-GB")}`
            : "Select Date Range"}
        </Button>
        {isExpanded && (
          <Dialog
            title="Select Date Range"
            onClose={() => setIsExpanded(false)}
            width={800}
          >
            <div
              style={{
                display: "flex",
                gap: "24px",
                padding: "20px",
                height: "400px",
              }}
            >
              <div style={{ flex: "1" }}>
                <h3 className="k-card-title" style={{ marginBottom: "16px" }}>
                  Select Custom Range
                </h3>
                <DateRangePicker
                  value={{
                    start: value?.start ? parseStringToDate(value.start) : null,
                    end: value?.end ? parseStringToDate(value.end) : null,
                  }}
                  onChange={handleCustomDateChange}
                  format="dd/MM/yyyy"
                  style={{ width: "100%" }}
                  show={true}
                />
              </div>
              <div
                style={{
                  borderLeft: "1px solid #e0e0e0",
                  paddingLeft: "24px",
                  width: "240px",
                }}
              >
                <h3 className="k-card-title" style={{ marginBottom: "16px" }}>
                  Preset Ranges
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {dateRangeOptions.map((option) => (
                    <Button
                      key={option.label}
                      onClick={() => handleRangeSelection(option.days)}
                      look="flat"
                      style={{
                        justifyContent: "flex-start",
                        padding: "8px 16px",
                        width: "100%",
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default DateSelector;