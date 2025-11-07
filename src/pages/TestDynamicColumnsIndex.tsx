import { useNavigate } from "react-router-dom";
import { 
  Table, ArrowRight, Eye, Filter, ChevronDown, Layout,
  CheckCircle, XCircle, AlertCircle, Info
} from "lucide-react";

const TestDynamicColumnsIndex = () => {
  const navigate = useNavigate();

  const approaches = [
    {
      id: 1,
      title: "Approach 1: All Columns View",
      description: "Shows ALL attributes from ALL products as columns. Empty cells display 'N/A'.",
      icon: Table,
      color: "blue",
      path: "/test-dynamic-columns/approach1",
      pros: [
        "Complete visibility of all data",
        "Easy comparison across products",
        "Good for data analysis",
        "No need to expand or navigate"
      ],
      cons: [
        "Very wide grid with horizontal scrolling",
        "Many empty cells (N/A values)",
        "Can be overwhelming"
      ],
      bestFor: "Small catalogs, similar products, data analysis"
    },
    {
      id: 2,
      title: "Approach 2: Category Filter View",
      description: "Filter by category to show relevant columns. Toggle between all columns and category-specific modes.",
      icon: Filter,
      color: "purple",
      path: "/test-dynamic-columns/approach2",
      pros: [
        "Cleaner UI with fewer empty cells",
        "Category-optimized viewing",
        "Quick category switching",
        "Flexible mode toggling"
      ],
      cons: [
        "Need to switch to see different categories",
        "Requires predefined templates",
        "Can't compare across categories easily"
      ],
      bestFor: "Large catalogs, distinct categories, category-focused workflows"
    },
    {
      id: 3,
      title: "Approach 3: Expandable Details ⭐",
      description: "Clean compact view with essential columns. Click to expand rows for complete details organized in groups.",
      icon: ChevronDown,
      color: "green",
      path: "/test-dynamic-columns/approach3",
      pros: [
        "Very clean, compact main view",
        "No horizontal scrolling",
        "Organized attribute groups",
        "Perfect for mobile",
        "Reduces visual clutter"
      ],
      cons: [
        "Need to expand to see details",
        "Can't compare multiple products at once",
        "More clicks required"
      ],
      bestFor: "MANY varying attributes, mobile responsive, quick browsing",
      recommended: true
    },
    {
      id: 4,
      title: "Approach 4: Tabbed Categories",
      description: "Separate tabs for each category with optimized columns per tab. Zero empty cells.",
      icon: Layout,
      color: "amber",
      path: "/test-dynamic-columns/approach4",
      pros: [
        "Cleanest possible view",
        "Zero empty/N/A cells",
        "Fast category switching",
        "Category-specific actions",
        "Optimal column count"
      ],
      cons: [
        "Can't see all products at once",
        "Need to switch tabs",
        "Cross-category comparison difficult"
      ],
      bestFor: "Clear category separation, cleanest UI, category-based workflows"
    }
  ];

  const getColorClasses = (color: string) => ({
    bg: `bg-${color}-50`,
    border: `border-${color}-200`,
    text: `text-${color}-900`,
    iconBg: `bg-${color}-100`,
    iconText: `text-${color}-600`,
    button: `bg-${color}-600 hover:bg-${color}-700`,
    badge: `bg-${color}-100 text-${color}-800 border-${color}-200`
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dynamic Product Columns - Test Approaches
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Explore 4 different UI approaches to handle products with varying column structures
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Info className="h-4 w-4" />
                <span>Click on any approach card to view the live demo</span>
              </div>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Approaches Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {approaches.map((approach) => {
            const colors = getColorClasses(approach.color);
            const IconComponent = approach.icon;

            return (
              <div
                key={approach.id}
                className={`bg-white rounded-lg border-2 ${
                  approach.recommended ? 'border-green-400 shadow-lg' : 'border-gray-200'
                } overflow-hidden hover:shadow-xl transition-shadow`}
              >
                {approach.recommended && (
                  <div className="bg-green-50 border-b border-green-200 px-4 py-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-900">
                        Recommended Choice
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-lg ${colors.iconBg}`}>
                      <IconComponent className={`h-6 w-6 ${colors.iconText}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {approach.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {approach.description}
                      </p>
                    </div>
                  </div>

                  {/* Pros */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Pros
                    </h4>
                    <ul className="space-y-1">
                      {approach.pros.map((pro, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cons */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Cons
                    </h4>
                    <ul className="space-y-1">
                      {approach.cons.map((con, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-red-500 mt-1">✗</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Best For */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      Best For
                    </h4>
                    <p className="text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      {approach.bestFor}
                    </p>
                  </div>

                  {/* View Button */}
                  <button
                    onClick={() => navigate(approach.path)}
                    className={`w-full ${colors.button} text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors`}
                  >
                    <Eye className="h-4 w-4" />
                    View Live Demo
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Comparison */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Approach 1</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Approach 2</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Approach 3</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Approach 4</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Horizontal Scrolling", values: ["High", "Medium", "None", "Low"] },
                  { feature: "Empty Cells", values: ["Many", "Some", "None", "None"] },
                  { feature: "Clicks to View Details", values: ["None", "None", "1-2", "None"] },
                  { feature: "Mobile Friendly", values: ["Poor", "Fair", "Excellent", "Good"] },
                  { feature: "Compare Products", values: ["Easy", "Medium", "Hard", "Medium"] },
                  { feature: "UI Cleanliness", values: ["Fair", "Good", "Excellent", "Excellent"] }
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-700">{row.feature}</td>
                    {row.values.map((value, vIdx) => (
                      <td key={vIdx} className="text-center py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          value === "None" || value === "Excellent" || value === "Easy"
                            ? "bg-green-100 text-green-800"
                            : value === "Low" || value === "Good" || value === "Fair"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {value}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Documentation Link */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                Need More Details?
              </h4>
              <p className="text-sm text-blue-800 mb-3">
                Check out the complete documentation with code examples, visual diagrams, 
                and integration instructions in <code className="bg-blue-100 px-2 py-0.5 rounded">DYNAMIC_COLUMNS_APPROACHES.md</code>
              </p>
              <p className="text-xs text-blue-700">
                All test files are located in: <code className="bg-blue-100 px-2 py-0.5 rounded">/src/components/PIM/product/</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDynamicColumnsIndex;
