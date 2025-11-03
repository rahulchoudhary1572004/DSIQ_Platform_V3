import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Dialog, DialogPanel, DialogTitle, Transition } from "@headlessui/react";
import { Lock, Columns, Eye, EyeOff, GripVertical, Move } from "lucide-react";

// Custom Button Component
const CustomButton = ({ children, onClick, variant = "default", className = "", disabled = false, size = "default", ...props }) => {
  const baseClasses = "relative inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-95 disabled:transform-none select-none";
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs rounded-md",
    default: "px-3 py-1.5 text-sm rounded-md",
    lg: "px-4 py-2 text-base rounded-md",
  };

  const variantClasses = {
    default: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow hover:shadow-md",
    outline: "border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-gray-50/80 hover:border-gray-300 focus:ring-blue-500 shadow-sm",
    secondary: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-gray-200 hover:to-gray-300 focus:ring-gray-500 shadow-sm",
    manage: "bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 focus:ring-purple-500 shadow hover:shadow-md",
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed hover:shadow-none" : "";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Column Icon Component
const ColumnIcon = ({ className = "" }) => (
  <svg
    className={`w-3.5 h-3.5 ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
    />
  </svg>
);

const ItemTypes = {
  COLUMN: "column",
};

const DraggableColumn = ({ column, index, moveColumn, isNonRemovable, listType }) => {
  const ref = React.useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.COLUMN,
    item: { index, listType, field: column.field },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !isNonRemovable,
  });

  const [, drop] = useDrop({
    accept: ItemTypes.COLUMN,
    hover(item: any, monitor) {
  if (!ref.current) return;

  const dragIndex = (item as any).index;
  const hoverIndex = index;

  // 👉 Allow cross-list drop (from available to visible)
  const isSameList = (item as any).listType === listType;

  if (isSameList && dragIndex === hoverIndex) return;

  const hoverBoundingRect = ref.current.getBoundingClientRect();
  const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
  const clientOffset = monitor.getClientOffset();
  const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top;

  if (isSameList) {
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
  }

  moveColumn(item, hoverIndex, listType);
  (item as any).index = hoverIndex;
  (item as any).listType = listType; // update the dragged item's list
}

  });

  drag(drop(ref));

  return (
    <div
      ref={ref as any}
      className={`group relative p-2 mb-2 border rounded-lg flex items-center justify-between transition-all duration-150 ${
        isNonRemovable
          ? "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 cursor-not-allowed"
          : "bg-gradient-to-r from-white to-blue-50/20 border-blue-100 hover:border-blue-200 hover:shadow-sm cursor-grab active:cursor-grabbing"
      } ${isDragging ? "opacity-50 scale-95 shadow-md" : ""}`}
    >
      <div className="flex items-center gap-2">
        {!isNonRemovable && (
          <GripVertical className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-500 transition-colors duration-150" />
        )}
        <div className="flex items-center gap-1.5">
          {listType === "visible" ? (
            <Eye className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <EyeOff className="h-3.5 w-3.5 text-gray-400" />
          )}
          <span className="font-medium text-sm text-gray-800">{column.title}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {isNonRemovable && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 rounded-full">
            <Lock className="h-3 w-3 text-amber-600" />
            <span className="text-xs text-amber-700 font-medium">Locked</span>
          </div>
        )}
        {!isNonRemovable && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <Move className="h-3.5 w-3.5 text-blue-500" />
          </div>
        )}
      </div>
    </div>
  );
};


const AvailableColumnsDropZone = ({ tempVisibleColumns, tempAvailableColumns, setTempVisibleColumns, setTempAvailableColumns, nonRemovableColumns, moveColumn, searchTerm }: any) => {
  const [, dropRef] = useDrop({
    accept: ItemTypes.COLUMN,
    drop: (item: any) => {
      if ((item as any).listType === "visible" && !nonRemovableColumns.includes((item as any).field)) {
        setTempVisibleColumns((prevVisible: any) => prevVisible.filter((col: any) => col.field !== (item as any).field));
        setTempAvailableColumns((prevAvailable: any) => [
          ...prevAvailable,
          tempVisibleColumns.find((col: any) => col.field === (item as any).field),
        ]);
      }
    },
  });

  const filteredColumns = searchTerm
    ? tempAvailableColumns.filter((column: any) =>
        column.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : tempAvailableColumns;

  return (
    <div
      ref={dropRef as any}
      className="border border-dashed border-gray-200 p-3 rounded-lg max-h-[400px] bg-gradient-to-b from-gray-50/10 to-white overflow-y-scroll"
    >
      {filteredColumns.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 py-6">
          <Columns className="h-10 w-10 mb-1 text-gray-300" />
          <p className="text-xs">{searchTerm ? "No matching columns" : "No available columns"}</p>
        </div>
      ) : (
        filteredColumns.map((column: any, index: number) => (
          <DraggableColumn
            key={column.field}
            column={column}
            index={index}
            moveColumn={moveColumn}
            isNonRemovable={false}
            listType="available"
          />
        ))
      )}
    </div>
  );
};

const VisibleColumnsDropZone = ({ tempVisibleColumns, setTempVisibleColumns, setTempAvailableColumns, nonRemovableColumns, moveColumn, searchTerm, tempAvailableColumns }: any) => {
  const [, dropRef] = useDrop({
    accept: ItemTypes.COLUMN,
    drop: (item: any) => {
      if ((item as any).listType === "available") {
        const newAvailableColumns = tempAvailableColumns.filter((col: any) => col.field !== (item as any).field);
        const movedColumn = tempAvailableColumns.find((col: any) => col.field === (item as any).field);
        setTempVisibleColumns((prev: any) => [...prev, movedColumn]);
        setTempAvailableColumns(newAvailableColumns);
      }
    },
  });

  const filteredColumns = searchTerm
    ? tempVisibleColumns.filter((column: any) =>
        column.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : tempVisibleColumns;

  return (
    <div
      ref={dropRef as any}
      className="border border-dashed border-gray-200 p-3 rounded-lg max-h-[400px] bg-gradient-to-b from-green-50/10 to-white overflow-y-scroll"
    >
      {filteredColumns.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 py-6">
          <EyeOff className="h-10 w-10 mb-1 text-gray-300" />
          <p className="text-xs">{searchTerm ? "No matching columns" : "No visible columns"}</p>
        </div>
      ) : (
        filteredColumns.map((column, index) => (
          <DraggableColumn
            key={column.field}
            column={column}
            index={index}
            moveColumn={moveColumn}
            isNonRemovable={nonRemovableColumns.includes(column.field)}
            listType="visible"
          />
        ))
      )}
    </div>
  );
};

const ColumnManager = ({ columns, setColumns, data, setData, nonRemovableColumns = [], allColumnsState, setAllColumnsState }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempVisibleColumns, setTempVisibleColumns] = useState(allColumnsState.visible);
  const [tempAvailableColumns, setTempAvailableColumns] = useState(allColumnsState.available);
  const [availableSearch, setAvailableSearch] = useState("");
  const [visibleSearch, setVisibleSearch] = useState("");

  // Sync temp state when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setTempVisibleColumns(allColumnsState.visible);
      setTempAvailableColumns(allColumnsState.available);
      setAvailableSearch("");
      setVisibleSearch("");
    }
  }, [isModalOpen, allColumnsState]);

  const moveColumn = (item, toIndex, toListType) => {
  const fromListType = item.listType;
  const fromIndex = item.index;

  const isLocked = (field) => nonRemovableColumns.includes(field);

  // Prevent inserting before locked columns in visible list
  const lockedCount = tempVisibleColumns.filter(col => isLocked(col.field)).length;
  const minIndex = lockedCount; // can’t insert before this

  if (fromListType === toListType) {
    const list = fromListType === "visible" ? [...tempVisibleColumns] : [...tempAvailableColumns];
    const [reorderedItem] = list.splice(fromIndex, 1);

    // ✅ Prevent inserting before locked columns
    const safeToIndex = toListType === "visible" ? Math.max(minIndex, toIndex) : toIndex;
    list.splice(safeToIndex, 0, reorderedItem);

    if (fromListType === "visible") {
      setTempVisibleColumns(list);
    } else {
      setTempAvailableColumns(list);
    }
  } else {
    if (fromListType === "visible" && !isLocked(tempVisibleColumns[fromIndex].field)) {
      const newVisible = [...tempVisibleColumns];
      const [moved] = newVisible.splice(fromIndex, 1);
      setTempVisibleColumns(newVisible);
      setTempAvailableColumns((prev) => [...prev, moved]);
    } else if (fromListType === "available") {
      const newAvailable = [...tempAvailableColumns];
      const [moved] = newAvailable.splice(fromIndex, 1);
      const newVisible = [...tempVisibleColumns];

      // ✅ Insert only after locked columns
      const safeToIndex = Math.max(minIndex, toIndex);
      newVisible.splice(safeToIndex, 0, moved);

      setTempVisibleColumns(newVisible);
      setTempAvailableColumns(newAvailable);
    }
  }
};


  const handleApplyChanges = () => {
    setColumns(tempVisibleColumns);
    setAllColumnsState({
      visible: tempVisibleColumns,
      available: tempAvailableColumns,
    });
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <CustomButton
        onClick={() => setIsModalOpen(true)}
        variant="manage"
        className="gap-1.5 h-7 mt-1  !px-1 font-semibold text-sm tracking-tight hover:scale-105 transition-all duration-150 shadow hover:shadow-md md:px-4 md:py-2 mr-2"
        size="sm"
      >
        <ColumnIcon className="transition-transform duration-150 group-hover:scale-110" />
        <span className="hidden sm:inline">Manage Columns</span>
        <span className="sm:hidden">Columns</span>
      </CustomButton>

      <Transition show={isModalOpen}>
        <Dialog className="relative z-10" onClose={handleCancel}>
          <Transition.Child
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500/75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto" style={{ backgroundColor: "rgba(60, 61, 61, 0.7)" }}>
            <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
              <Transition.Child
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-lg sm:max-w-2xl lg:max-w-4xl max-h-[90vh] transform overflow-hidden rounded-lg bg-white/95 backdrop-blur-lg p-4 sm:p-6 shadow-lg border border-white/20">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-md">
                      <Columns className="h-5 w-5 text-white" />
                    </div>
                    <DialogTitle as="h3" className="text-lg font-bold text-gray-900">
                      Manage Columns
                    </DialogTitle>
                  </div>

                  <div className="mb-4 p-2 bg-blue-50/50 rounded-md border border-blue-100">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Drag and drop</span> columns to show/hide.{" "}
                      <span className="font-medium">Reorder</span> within visible list.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="p-1 bg-gray-100 rounded-md">
                          <EyeOff className="h-3.5 w-3.5 text-gray-600" />
                        </div>
                        <h4 className="text-base font-semibold text-gray-900">Available Columns</h4>
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                          {tempAvailableColumns.length}
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="Search available columns..."
                        value={availableSearch}
                        onChange={(e) => setAvailableSearch(e.target.value)}
                        className="w-full p-2 mb-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <AvailableColumnsDropZone
                        tempVisibleColumns={tempVisibleColumns}
                        tempAvailableColumns={tempAvailableColumns}
                        setTempVisibleColumns={setTempVisibleColumns}
                        setTempAvailableColumns={setTempAvailableColumns}
                        nonRemovableColumns={nonRemovableColumns}
                        moveColumn={moveColumn}
                        searchTerm={availableSearch}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="p-1 bg-green-100 rounded-md">
                          <Eye className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        <h4 className="text-base font-semibold text-gray-900">Visible Columns</h4>
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          {tempVisibleColumns.length}
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="Search visible columns..."
                        value={visibleSearch}
                        onChange={(e) => setVisibleSearch(e.target.value)}
                        className="w-full p-2 mb-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <VisibleColumnsDropZone
                        tempVisibleColumns={tempVisibleColumns}
                        setTempVisibleColumns={setTempVisibleColumns}
                        setTempAvailableColumns={setTempAvailableColumns}
                        nonRemovableColumns={nonRemovableColumns}
                        moveColumn={moveColumn}
                        searchTerm={visibleSearch}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Lock className="h-3.5 w-3.5 text-amber-500" />
                      <span>Locked columns cannot be moved or hidden</span>
                    </div>
                    <div className="flex gap-2">
                      <CustomButton variant="outline" onClick={handleCancel} className="px-4 py-1.5">
                        Cancel
                      </CustomButton>
                      <CustomButton onClick={handleApplyChanges} className="px-4 py-1.5">
                        Apply Changes
                      </CustomButton>
                    </div>
                  </div>
                </DialogPanel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </DndProvider>
  );
};

export default ColumnManager;