/**
 * APPROACH 4: Tabbed Category View with Smart Columns
 * 
 * This approach separates products into tabs by category, showing only
 * relevant columns for each category. Each tab has its own optimized column set.
 * 
 * Features:
 * - Products grouped by category in separate tabs
 * - Each tab shows category-optimized columns only
 * - No empty/N/A cells - only relevant data shown
 * - Quick category switching
 * - Category-specific actions and bulk operations
 */

import { useState, useMemo } from "react";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import { Eye, Edit, Smartphone, Shirt, Coffee, Armchair, CheckCircle } from "lucide-react";

// Category definitions with their specific columns
const categoryDefinitions = {
  Electronics: {
    icon: Smartphone,
    color: 'blue',
    columns: [
      { field: 'batteryLife', title: 'Battery Life', width: '130px' },
      { field: 'waterResistance', title: 'Water Resistant', width: '140px' },
      { field: 'screenSize', title: 'Screen Size', width: '120px' },
      { field: 'connectivity', title: 'Connectivity', width: '180px' },
      { field: 'warranty', title: 'Warranty', width: '100px' },
      { field: 'color', title: 'Color', width: '100px' }
    ]
  },
  Apparel: {
    icon: Shirt,
    color: 'purple',
    columns: [
      { field: 'material', title: 'Material', width: '150px' },
      { field: 'size', title: 'Size', width: '80px' },
      { field: 'fabricWeight', title: 'Fabric Weight', width: '130px' },
      { field: 'careInstructions', title: 'Care Instructions', width: '200px' },
      { field: 'fit', title: 'Fit', width: '100px' },
      { field: 'color', title: 'Color', width: '100px' }
    ]
  },
  'Food & Beverage': {
    icon: Coffee,
    color: 'green',
    columns: [
      { field: 'weight', title: 'Weight/Volume', width: '130px' },
      { field: 'origin', title: 'Origin', width: '120px' },
      { field: 'organicCertified', title: 'Organic', width: '100px' },
      { field: 'expiryDate', title: 'Expiry Date', width: '120px' },
      { field: 'allergens', title: 'Allergens', width: '150px' },
      { field: 'certifications', title: 'Certifications', width: '200px' }
    ]
  },
  Furniture: {
    icon: Armchair,
    color: 'amber',
    columns: [
      { field: 'dimensions', title: 'Dimensions', width: '180px' },
      { field: 'weightCapacity', title: 'Weight Capacity', width: '140px' },
      { field: 'material', title: 'Material', width: '150px' },
      { field: 'assemblyRequired', title: 'Assembly', width: '110px' },
      { field: 'warranty', title: 'Warranty', width: '100px' },
      { field: 'color', title: 'Color', width: '100px' }
    ]
  }
};

// Sample data
const dynamicProducts = [
  {
    id: 1,
    sku: "PROD-001",
    name: "Smart Watch Pro",
    category: "Electronics",
    brand: "TechBrand",
    price: 299.99,
    batteryLife: "48 hours",
    waterResistance: "IP68",
    screenSize: "1.4 inches",
    connectivity: "Bluetooth 5.0, WiFi",
    warranty: "2 years",
    color: "Black"
  },
  {
    id: 2,
    sku: "PROD-005",
    name: "Wireless Headphones",
    category: "Electronics",
    brand: "AudioTech",
    price: 149.99,
    batteryLife: "30 hours",
    waterResistance: "IPX4",
    screenSize: "N/A",
    connectivity: "Bluetooth 5.2",
    warranty: "1 year",
    color: "White"
  },
  {
    id: 3,
    sku: "PROD-002",
    name: "Cotton T-Shirt",
    category: "Apparel",
    brand: "FashionCo",
    price: 29.99,
    material: "100% Cotton",
    size: "M",
    fabricWeight: "180 GSM",
    careInstructions: "Machine wash cold",
    fit: "Regular Fit",
    color: "Blue"
  },
  {
    id: 4,
    sku: "PROD-006",
    name: "Denim Jeans",
    category: "Apparel",
    brand: "FashionCo",
    price: 59.99,
    material: "98% Cotton, 2% Elastane",
    size: "32",
    fabricWeight: "12 oz",
    careInstructions: "Wash inside out",
    fit: "Slim Fit",
    color: "Dark Blue"
  },
  {
    id: 5,
    sku: "PROD-003",
    name: "Organic Honey",
    category: "Food & Beverage",
    brand: "NatureFoods",
    price: 12.99,
    weight: "500g",
    origin: "New Zealand",
    organicCertified: true,
    expiryDate: "2026-12-31",
    allergens: "None",
    certifications: "USDA Organic, Non-GMO"
  },
  {
    id: 6,
    sku: "PROD-007",
    name: "Green Tea",
    category: "Food & Beverage",
    brand: "TeaTime",
    price: 8.99,
    weight: "100g (50 bags)",
    origin: "Japan",
    organicCertified: true,
    expiryDate: "2025-06-30",
    allergens: "None",
    certifications: "Organic, Fair Trade"
  },
  {
    id: 7,
    sku: "PROD-004",
    name: "Ergonomic Office Chair",
    category: "Furniture",
    brand: "OfficePro",
    price: 449.99,
    dimensions: "24 x 24 x 45 inches",
    weightCapacity: "300 lbs",
    material: "Mesh & Steel",
    assemblyRequired: true,
    warranty: "5 years",
    color: "Gray"
  },
  {
    id: 8,
    sku: "PROD-008",
    name: "Standing Desk",
    category: "Furniture",
    brand: "OfficePro",
    price: 599.99,
    dimensions: "60 x 30 x 28-48 inches",
    weightCapacity: "200 lbs",
    material: "Wood & Steel",
    assemblyRequired: true,
    warranty: "3 years",
    color: "Walnut"
  }
];

const ProductCatalog_DynamicColumns_Approach4 = () => {
  const [products] = useState(dynamicProducts);
  const [activeTab, setActiveTab] = useState<string>("Electronics");

  // Group products by category
  const productsByCategory = useMemo(() => {
    return products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {} as Record<string, typeof products>);
  }, [products]);

  // Get current category products
  const currentProducts = productsByCategory[activeTab] || [];
  const currentDefinition = categoryDefinitions[activeTab];

  // Format values
  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === "N/A") return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toLocaleString();
    return String(value);
  };

  // Generic attribute cell
  const AttributeCell = (field: string) => (props: any) => {
    const value = props.dataItem[field];
    const formatted = formatValue(value);

    return (
      <td className="px-4 py-3">
        <span className={`text-sm ${formatted === '-' ? 'text-gray-400' : 'text-gray-900'}`}>
          {formatted}
        </span>
      </td>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Approach 4: Tabbed Category View
            </h1>
            <p className="text-gray-600 mt-2">
              Products organized by category with optimized column sets per category.
              Each tab shows only relevant columns - no empty cells or N/A values.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-900 font-medium">
              {products.length} Products
            </span>
          </div>
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {Object.entries(productsByCategory).map(([category, items]) => {
            const def = categoryDefinitions[category];
            const IconComponent = def?.icon || Smartphone;
            const color = def?.color || 'gray';
            
            return (
              <div 
                key={category}
                className={`p-3 rounded-lg border ${
                  activeTab === category 
                    ? `bg-${color}-50 border-${color}-300` 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <IconComponent className={`h-4 w-4 text-${color}-600`} />
                  <span className="text-xs font-medium text-gray-700">{category}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{items.length}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {def?.columns.length || 0} columns
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {Object.keys(productsByCategory).map((category) => {
              const def = categoryDefinitions[category];
              const IconComponent = def?.icon || Smartphone;
              const color = def?.color || 'gray';
              const count = productsByCategory[category].length;
              
              return (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === category
                      ? `border-${color}-600 text-${color}-700 bg-${color}-50`
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{category}</span>
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === category 
                      ? `bg-${color}-100 text-${color}-800` 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {activeTab} Products
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Showing {currentDefinition?.columns.length || 0} category-specific columns
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Export
              </button>
              <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Add {activeTab.replace(' & ', ' ')} Product
              </button>
            </div>
          </div>

          {/* Grid */}
          <Grid
            data={currentProducts}
            style={{ height: "450px", border: "none" }}
            className="border-none rounded-lg overflow-hidden"
          >
            {/* Fixed columns */}
            <Column
              field="sku"
              title="SKU"
              width="120px"
              locked
              cell={(props) => (
                <td className="px-4 py-3 bg-gray-50 font-mono text-sm text-gray-700 border-r border-gray-200">
                  {props.dataItem.sku}
                </td>
              )}
            />
            <Column
              field="name"
              title="Product Name"
              width="220px"
              locked
              cell={(props) => (
                <td className="px-4 py-3 bg-gray-50 border-r border-gray-200">
                  <div className="font-medium text-gray-900">{props.dataItem.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{props.dataItem.brand}</div>
                </td>
              )}
            />
            <Column
              field="price"
              title="Price"
              width="120px"
              cell={(props) => (
                <td className="px-4 py-3">
                  <span className="font-semibold text-gray-900">
                    ${props.dataItem.price.toFixed(2)}
                  </span>
                </td>
              )}
            />

            {/* Category-specific columns */}
            {currentDefinition?.columns.map((col) => (
              <Column
                key={col.field}
                field={col.field}
                title={col.title}
                width={col.width}
                cell={AttributeCell(col.field)}
              />
            ))}

            {/* Actions */}
            <Column
              field="actions"
              title="Actions"
              width="120px"
              cell={(props) => (
                <td className="px-4 py-3">
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
      </div>

      {/* Benefits Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">✨ Clean Organization</h4>
          <p className="text-sm text-gray-600">
            Products grouped by category with no irrelevant columns or empty cells
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">🎯 Optimized Columns</h4>
          <p className="text-sm text-gray-600">
            Each category shows only its relevant attributes for faster browsing
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">⚡ Quick Switching</h4>
          <p className="text-sm text-gray-600">
            Easily switch between categories with visual tabs and product counts
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog_DynamicColumns_Approach4;
