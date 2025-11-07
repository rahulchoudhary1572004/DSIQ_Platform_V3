/**
 * APPROACH 2: Category-Based Column Sets with Toggle
 * 
 * This approach organizes products by category and shows only relevant
 * columns for each category. Users can toggle between "All Columns" mode
 * and "Category-Specific" mode.
 * 
 * Features:
 * - Smart column filtering based on product category
 * - Toggle between showing all columns vs category-specific columns
 * - Category templates define which columns are relevant
 * - Cleaner UI with fewer empty cells
 * - Quick category switcher
 */

import { useState, useMemo } from "react";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import { Eye, Edit, Filter, Layers, ChevronDown } from "lucide-react";

// Define column templates for each category
const categoryColumnTemplates = {
  Electronics: {
    color: 'blue',
    columns: ['brand', 'price', 'warranty', 'batteryLife', 'waterResistance', 'screenSize', 'color']
  },
  Apparel: {
    color: 'purple',
    columns: ['brand', 'price', 'material', 'size', 'fabricWeight', 'careInstructions', 'warranty', 'color']
  },
  'Food & Beverage': {
    color: 'green',
    columns: ['brand', 'price', 'weight', 'origin', 'organicCertified', 'expiryDate', 'ingredients']
  },
  Furniture: {
    color: 'amber',
    columns: ['brand', 'price', 'dimensions', 'weightCapacity', 'material', 'adjustableHeight', 'warranty', 'color']
  }
};

// Sample data
const dynamicProducts = [
  {
    id: 1,
    sku: "PROD-001",
    name: "Smart Watch Pro",
    category: "Electronics",
    attributes: {
      brand: "TechBrand",
      price: 299.99,
      batteryLife: "48 hours",
      waterResistance: "IP68",
      screenSize: "1.4 inches",
      warranty: "2 years",
      color: "Black"
    }
  },
  {
    id: 2,
    sku: "PROD-002",
    name: "Cotton T-Shirt",
    category: "Apparel",
    attributes: {
      brand: "FashionCo",
      price: 29.99,
      material: "100% Cotton",
      size: "M",
      fabricWeight: "180 GSM",
      careInstructions: "Machine wash cold",
      warranty: "30 days",
      color: "Blue"
    }
  },
  {
    id: 3,
    sku: "PROD-003",
    name: "Organic Honey",
    category: "Food & Beverage",
    attributes: {
      brand: "NatureFoods",
      price: 12.99,
      weight: "500g",
      origin: "New Zealand",
      organicCertified: true,
      expiryDate: "2026-12-31",
      ingredients: "Pure Organic Honey"
    }
  },
  {
    id: 4,
    sku: "PROD-004",
    name: "Ergonomic Office Chair",
    category: "Furniture",
    attributes: {
      brand: "OfficePro",
      price: 449.99,
      dimensions: "24 x 24 x 45 inches",
      weightCapacity: "300 lbs",
      material: "Mesh & Steel",
      adjustableHeight: true,
      warranty: "5 years",
      color: "Gray"
    }
  },
  {
    id: 5,
    sku: "PROD-005",
    name: "Wireless Headphones",
    category: "Electronics",
    attributes: {
      brand: "AudioTech",
      price: 149.99,
      batteryLife: "30 hours",
      waterResistance: "IPX4",
      warranty: "1 year",
      color: "White"
    }
  }
];

const ProductCatalog_DynamicColumns_Approach2 = () => {
  const [products] = useState(dynamicProducts);
  const [showAllColumns, setShowAllColumns] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category)));
  }, [products]);

  // Filter products by category if one is selected
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  // Determine which columns to show
  const visibleColumns = useMemo(() => {
    if (showAllColumns) {
      // Show all unique attribute keys
      const allKeys = new Set<string>();
      products.forEach(p => {
        Object.keys(p.attributes).forEach(key => allKeys.add(key));
      });
      return Array.from(allKeys).sort();
    } else if (selectedCategory !== "All") {
      // Show category-specific columns
      return categoryColumnTemplates[selectedCategory]?.columns || [];
    } else {
      // Show common columns across all categories
      return ['brand', 'price', 'warranty', 'color'];
    }
  }, [showAllColumns, selectedCategory, products]);

  // Format attribute values
  const formatAttributeValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toLocaleString();
    return String(value);
  };

  // Custom cell renderer
  const AttributeCell = ({ dataItem, field }: any) => {
    const value = dataItem.attributes[field];
    const formattedValue = formatAttributeValue(value);

    return (
      <td className="px-4 py-3">
        <span className={`text-sm ${formattedValue === '-' ? 'text-gray-400' : 'text-gray-900'}`}>
          {formattedValue}
        </span>
      </td>
    );
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    return categoryColumnTemplates[category]?.color || 'gray';
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Approach 2: Category-Based Column Sets
            </h1>
            <p className="text-gray-600 mt-2">
              Columns adapt based on product category. Toggle between category-specific 
              columns and all columns view.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Category:</span>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                aria-label="Select category"
                title="Select category"
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Column Mode Toggle */}
          <div className="flex items-center gap-2 ml-auto">
            <Layers className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Columns:</span>
            <button
              onClick={() => setShowAllColumns(!showAllColumns)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showAllColumns
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showAllColumns ? 'All Columns' : 'Category-Specific'}
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">
            <div className="text-sm">
              <span className="text-gray-600">Products: </span>
              <span className="font-semibold text-gray-900">{filteredProducts.length}</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="text-sm">
              <span className="text-gray-600">Columns: </span>
              <span className="font-semibold text-gray-900">{visibleColumns.length}</span>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
          {categories.map(cat => {
            const template = categoryColumnTemplates[cat];
            const count = products.filter(p => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? `bg-${template.color}-100 border-${template.color}-300 text-${template.color}-900`
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {selectedCategory === "All" ? "All Products" : `${selectedCategory} Products`}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Showing {visibleColumns.length} columns
            {!showAllColumns && selectedCategory !== "All" && 
              ` optimized for ${selectedCategory}`}
          </p>
        </div>

        <Grid
          data={filteredProducts}
          style={{ height: "500px", border: "none" }}
          className="border-none"
        >
          {/* Fixed columns */}
          <Column
            field="sku"
            title="SKU"
            width="120px"
            locked
            cell={(props) => (
              <td className="px-4 py-3 bg-gray-50 font-mono text-sm text-gray-700 border-r-2 border-gray-200">
                {props.dataItem.sku}
              </td>
            )}
          />
          <Column
            field="name"
            title="Product Name"
            width="200px"
            locked
            cell={(props) => (
              <td className="px-4 py-3 bg-gray-50 border-r-2 border-gray-200">
                <div className="font-medium text-gray-900">{props.dataItem.name}</div>
                <div className={`text-xs mt-0.5 inline-flex px-2 py-0.5 rounded-full bg-${getCategoryColor(props.dataItem.category)}-100 text-${getCategoryColor(props.dataItem.category)}-800`}>
                  {props.dataItem.category}
                </div>
              </td>
            )}
          />

          {/* Dynamic attribute columns */}
          {visibleColumns.map(attr => (
            <Column
              key={attr}
              field={attr}
              title={attr.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}
              width="150px"
              cell={(props) => <AttributeCell dataItem={props.dataItem} field={attr} />}
            />
          ))}

          {/* Actions column */}
          <Column
            field="actions"
            title="Actions"
            width="120px"
            locked
            cell={(props) => (
              <td className="px-4 py-3 bg-gray-50 border-l-2 border-gray-200">
                <div className="flex gap-2 justify-center">
                  <button
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    title="View"
                    aria-label="View product"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                    title="Edit"
                    aria-label="Edit product"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </td>
            )}
          />
        </Grid>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(categoryColumnTemplates).map(([category, template]) => (
          <div key={category} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className={`inline-flex items-center px-2 py-1 rounded bg-${template.color}-100 text-${template.color}-900 text-xs font-medium mb-2`}>
              {category}
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              {template.columns.length} Specific Columns
            </h4>
            <div className="flex flex-wrap gap-1">
              {template.columns.slice(0, 5).map(col => (
                <span key={col} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                  {col}
                </span>
              ))}
              {template.columns.length > 5 && (
                <span className="text-xs text-gray-500 px-2 py-0.5">
                  +{template.columns.length - 5} more
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCatalog_DynamicColumns_Approach2;
