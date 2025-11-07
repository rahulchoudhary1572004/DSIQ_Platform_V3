/**
 * APPROACH 1: Dynamic Column Rendering with Attribute-Based System
 * 
 * This approach treats all product data as attributes that can be dynamically
 * configured per product. Each product can have different attributes.
 * 
 * Features:
 * - Products can have completely different attribute sets
 * - Smart column merging (shows all unique attributes across products)
 * - Cell renderer handles missing attributes gracefully
 * - Visual indicators for empty/null values
 * - Grouped attributes by category (Basic, Technical, Marketing, etc.)
 */

import { useState, useMemo } from "react";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import { Eye, Edit, AlertCircle, Minus } from "lucide-react";

// Sample data structure where products have different attributes
const dynamicProducts = [
  {
    id: 1,
    sku: "PROD-001",
    name: "Smart Watch Pro",
    attributes: {
      // Basic
      brand: "TechBrand",
      category: "Electronics",
      price: 299.99,
      // Technical (only this product has these)
      batteryLife: "48 hours",
      waterResistance: "IP68",
      screenSize: "1.4 inches",
      // Marketing
      warranty: "2 years",
      color: "Black"
    }
  },
  {
    id: 2,
    sku: "PROD-002", 
    name: "Cotton T-Shirt",
    attributes: {
      // Basic
      brand: "FashionCo",
      category: "Apparel",
      price: 29.99,
      // Apparel specific (different from product 1)
      material: "100% Cotton",
      size: "M",
      fabricWeight: "180 GSM",
      careInstructions: "Machine wash cold",
      // Marketing
      warranty: "30 days",
      color: "Blue"
    }
  },
  {
    id: 3,
    sku: "PROD-003",
    name: "Organic Honey",
    attributes: {
      // Basic
      brand: "NatureFoods",
      category: "Food & Beverage",
      price: 12.99,
      // Food specific
      weight: "500g",
      origin: "New Zealand",
      organicCertified: true,
      expiryDate: "2026-12-31",
      // Marketing
      ingredients: "Pure Organic Honey"
    }
  },
  {
    id: 4,
    sku: "PROD-004",
    name: "Ergonomic Office Chair",
    attributes: {
      // Basic
      brand: "OfficePro",
      category: "Furniture",
      price: 449.99,
      // Furniture specific
      dimensions: "24 x 24 x 45 inches",
      weightCapacity: "300 lbs",
      material: "Mesh & Steel",
      adjustableHeight: true,
      // Marketing
      warranty: "5 years",
      color: "Gray"
    }
  }
];

const ProductCatalog_DynamicColumns_Approach1 = () => {
  const [products] = useState(dynamicProducts);

  // Extract all unique attribute keys across all products
  const allAttributeKeys = useMemo(() => {
    const keysSet = new Set<string>();
    products.forEach(product => {
      Object.keys(product.attributes).forEach(key => keysSet.add(key));
    });
    return Array.from(keysSet).sort();
  }, [products]);

  // Categorize attributes for better organization
  const categorizedAttributes = useMemo(() => {
    const categories: Record<string, string[]> = {
      Basic: ['brand', 'category', 'price', 'color'],
      Technical: ['batteryLife', 'waterResistance', 'screenSize', 'weightCapacity', 'adjustableHeight'],
      Product_Specific: ['material', 'size', 'fabricWeight', 'careInstructions', 'weight', 'origin', 
                         'organicCertified', 'expiryDate', 'ingredients', 'dimensions'],
      Marketing: ['warranty']
    };

    const result: Record<string, string[]> = {};
    
    Object.entries(categories).forEach(([category, keys]) => {
      const existing = keys.filter(key => allAttributeKeys.includes(key));
      if (existing.length > 0) {
        result[category] = existing;
      }
    });

    return result;
  }, [allAttributeKeys]);

  // Format attribute values for display
  const formatAttributeValue = (value: any) => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toLocaleString();
    return String(value);
  };

  // Custom cell renderer for dynamic attributes
  const AttributeCell = ({ dataItem, field }: any) => {
    const value = dataItem.attributes[field];
    const formattedValue = formatAttributeValue(value);

    if (formattedValue === null) {
      return (
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center gap-1 text-gray-400 text-xs">
            <Minus className="h-3 w-3" />
            N/A
          </span>
        </td>
      );
    }

    return (
      <td className="px-4 py-3">
        <span className="text-sm text-gray-900">{formattedValue}</span>
      </td>
    );
  };

  // Fixed columns (always present)
  const FixedColumnsSection = () => (
    <>
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
            <div className="text-xs text-gray-500 mt-0.5">
              {Object.keys(props.dataItem.attributes).length} attributes
            </div>
          </td>
        )}
      />
    </>
  );

  // Dynamic attribute columns grouped by category
  const DynamicAttributeColumns = () => (
    <>
      {Object.entries(categorizedAttributes).map(([category, attributes]) => (
        <div key={category}>
          {/* Category header could be rendered differently if needed */}
          {attributes.map(attr => (
            <Column
              key={attr}
              field={attr}
              title={attr.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}
              width="150px"
              cell={(props) => <AttributeCell dataItem={props.dataItem} field={attr} />}
            />
          ))}
        </div>
      ))}
    </>
  );

  // Actions column
  const ActionsColumn = () => (
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
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Approach 1: Dynamic Attribute-Based Columns
            </h1>
            <p className="text-gray-600 mt-2">
              All unique attributes from all products are shown as columns. 
              Empty cells show "N/A" for attributes not present in a product.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-900 font-medium">
              {allAttributeKeys.length} Total Attributes
            </span>
          </div>
        </div>

        {/* Attribute Categories Summary */}
        <div className="mt-4 flex flex-wrap gap-3">
          {Object.entries(categorizedAttributes).map(([category, attrs]) => (
            <div key={category} className="px-3 py-1.5 bg-gray-100 rounded-lg border border-gray-200">
              <span className="text-xs font-medium text-gray-700">
                {category.replace(/_/g, ' ')}: 
              </span>
              <span className="text-xs text-gray-900 ml-1 font-semibold">
                {attrs.length} columns
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Products with Dynamic Attributes
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Scroll horizontally to see all attributes. Gray cells indicate the attribute is not present for that product.
          </p>
        </div>

        <Grid
          data={products}
          style={{ height: "500px", border: "none" }}
          className="border-none"
        >
          <FixedColumnsSection />
          <DynamicAttributeColumns />
          <ActionsColumn />
        </Grid>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
            <span className="text-gray-700">Locked columns (always visible)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 flex items-center gap-1">
              <Minus className="h-3 w-3" /> N/A
            </span>
            <span className="text-gray-700">Attribute not present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
            <span className="text-gray-700">Dynamic attribute value</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog_DynamicColumns_Approach1;
