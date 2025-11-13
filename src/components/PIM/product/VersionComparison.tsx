import { ArrowLeft } from "lucide-react";

const VersionComparison = ({ version1, version2, onClose }) => {
  const getFieldDifference = (field, val1, val2) => {
    if (val1 === val2) return "unchanged";
    if (val1 && !val2) return "removed";
    if (!val1 && val2) return "added";
    return "modified";
  };

  const renderFieldComparison = (fieldName, val1, val2) => {
    const difference = getFieldDifference(fieldName, val1, val2);
    return (
      <div
        key={fieldName}
        className={`grid grid-cols-3 gap-4 py-2 border-b ${
          difference === "removed"
            ? "bg-red-50"
            : difference === "added"
            ? "bg-green-50"
            : difference === "modified"
            ? "bg-brand-light"
            : "bg-white"
        }`}
      >
        <div className="font-medium text-gray-700 text-sm p-2">{fieldName}</div>
        <div
          className={`p-2 text-sm ${
            difference === "removed"
              ? "text-red-800"
              : difference === "unchanged"
              ? "text-gray-600"
              : "text-brand-primary"
          }`}
        >
          {val1 || <span className="text-gray-400">-</span>}
        </div>
        <div
          className={`p-2 text-sm ${
            difference === "added"
              ? "text-green-800"
              : difference === "unchanged"
              ? "text-gray-600"
              : "text-brand-primary"
          }`}
        >
          {val2 || <span className="text-gray-400">-</span>}
        </div>
      </div>
    );
  };

  // Mock field comparison data
  const fields = [
    { name: "Product Name", v1: version1.data.name, v2: version2.data.name },
    { name: "Price", v1: `$${version1.data.price}`, v2: `$${version2.data.price}` },
    { name: "SKU", v1: "WBH-001", v2: "WBH-001" },
    { name: "Description", v1: "Original description", v2: "Updated description with more details" },
    { name: "Category", v1: "Electronics", v2: "Electronics" },
  ];

  return (
    <div className="bg-white p-6 rounded-md border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 border border-gray-300"
            title="Back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <span className="font-semibold text-lg text-gray-800">Version Comparison</span>
        </div>
      </div>
      <div className="my-6 p-4 bg-gray-50 rounded border border-gray-200">
        <h4 className="font-medium mb-2 text-gray-800">Legend:</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-200"></div>
            <span className="text-green-800">Added</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-200"></div>
            <span className="text-red-800">Removed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-brand-light border border-brand-secondary"></div>
            <span className="text-brand-primary">Modified</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white border border-gray-300"></div>
            <span className="text-gray-600">Unchanged</span>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4 items-end border-b pb-4">
        <div className="font-medium text-gray-700">Field</div>
        <div className="text-center">
          <span className="inline-block px-2 py-1 border rounded text-xs bg-gray-50 border-gray-200 text-gray-700">v{version1.version}</span>
          <div className="text-xs text-gray-500 mt-1">{version1.timestamp}</div>
          <div className="text-xs text-gray-500">by {version1.author}</div>
        </div>
        <div className="text-center">
          <span className="inline-block px-2 py-1 border rounded text-xs bg-gray-50 border-gray-200 text-gray-700">v{version2.version}</span>
          <div className="text-xs text-gray-500 mt-1">{version2.timestamp}</div>
          <div className="text-xs text-gray-500">by {version2.author}</div>
        </div>
      </div>
      <div className="border border-gray-200 mb-6">
        {fields.map((field) => renderFieldComparison(field.name, field.v1, field.v2))}
      </div>
    </div>
  );
};

export default VersionComparison;