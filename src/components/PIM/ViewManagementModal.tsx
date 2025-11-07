import { X } from "lucide-react";
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface Column {
  field: string;
  title: string;
  visible: boolean;
  required?: boolean;
}

interface View {
  name: string;
  columns: Column[];
}

interface ViewManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  views: View[];
  onViewChange: (viewName: string) => void;
  onViewsUpdate: (updatedViews: View[]) => void;
}

const ViewManagementModal = ({
  isOpen,
  onClose,
  currentView,
  views,
  onViewChange,
  onViewsUpdate,
}: ViewManagementModalProps) => {
  const [tempViews, setTempViews] = useState(views);
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const currentViewData = tempViews.find((v) => v.name === currentView);
  const columnsExceptActions = currentViewData?.columns.filter(
    (col) => col.field !== "actions"
  ) || [];
  const actionsColumn = currentViewData?.columns.find(
    (col) => col.field === "actions"
  );

  const allColumns = Array.from(
    new Set(
      views.flatMap((v) =>
        v.columns
          .filter((c) => c.field !== "actions")
          .map((c) => ({
            field: c.field,
            title: c.title,
            required: c.required,
          }))
      )
    )
  );
  const currentFields = columnsExceptActions.map((col) => col.field);
  const availableColumns = allColumns.filter(
    (col) => !currentFields.includes(col.field)
  );
  const filteredAvailableColumns = availableColumns.filter((col) =>
    col.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddColumn = (field: string) => {
    const colToAdd = allColumns.find((col) => col.field === field);
    setTempViews((prev) =>
      prev.map((view) => {
        if (view.name === currentView) {
          const newCols = [
            ...columnsExceptActions,
            { ...(colToAdd as Column), visible: true },
          ];
          if (actionsColumn) newCols.push(actionsColumn);
          return { ...view, columns: newCols };
        }
        return view;
      })
    );
    setSearch("");
  };

  const handleRemoveColumn = (field: string) => {
    setTempViews((prev) =>
      prev.map((view) => {
        if (view.name === currentView) {
          const newCols = view.columns.filter((col) => col.field !== field);
          const colsNoActions = newCols.filter(
            (col) => col.field !== "actions"
          );
          const actionsCol = newCols.find((col) => col.field === "actions");
          if (actionsCol) colsNoActions.push(actionsCol);
          return { ...view, columns: colsNoActions };
        }
        return view;
      })
    );
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    setTempViews((prev) =>
      prev.map((view) => {
        if (view.name === currentView) {
          const requiredCols = columnsExceptActions.filter(
            (col) => col.required
          );
          const optionalCols = columnsExceptActions.filter(
            (col) => !col.required
          );
          const reordered = Array.from(optionalCols);
          const [removed] = reordered.splice(result.source.index, 1);
          reordered.splice(result.destination.index, 0, removed);
          let newCols = [...requiredCols, ...reordered];
          if (actionsColumn) newCols.push(actionsColumn);
          return { ...view, columns: newCols };
        }
        return view;
      })
    );
  };

  const saveChanges = () => {
    onViewsUpdate(tempViews);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Customize Columns
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
            title="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Add columns
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search a column"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {search && filteredAvailableColumns.length > 0 && (
              <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 z-10 max-h-40 overflow-y-auto">
                {filteredAvailableColumns.map((col) => (
                  <div
                    key={col.field}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleAddColumn(col.field)}
                  >
                    {col.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Manage and reorder columns
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {columnsExceptActions
              .filter((col) => col.required)
              .map((col) => (
                <span
                  key={col.field}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded flex items-center text-sm font-medium cursor-default"
                >
                  {col.title}
                </span>
              ))}
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="columns-droppable" direction="horizontal">
              {(provided) => (
                <div
                  className="flex flex-wrap gap-2 min-h-[40px]"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {columnsExceptActions
                    .filter((col) => !col.required)
                    .map((col, idx) => (
                      <Draggable
                        key={col.field}
                        draggableId={col.field}
                        index={idx}
                      >
                        {(provided) => (
                          <span
                            className="px-3 py-1 bg-gray-100 text-gray-800 rounded flex items-center text-sm font-medium cursor-move"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            {col.title}
                            <button
                              className="ml-2 text-gray-400 hover:text-red-600"
                              onClick={() => handleRemoveColumn(col.field)}
                              title="Remove column"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </span>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          {actionsColumn && (
            <div className="mt-4 flex gap-2 items-center">
              <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded flex items-center text-sm font-medium cursor-not-allowed opacity-80">
                {actionsColumn.title} (Always last)
              </span>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={saveChanges}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewManagementModal;
