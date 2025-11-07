/**
 * APPROACH 3: Compact Grid with Expandable Details
 * 
 * This approach shows only essential columns in the main grid and allows
 * users to expand each row to see all product-specific attributes.
 * 
 * Features:
 * - Clean, compact main view with essential columns only
 * - Click to expand row and see all attributes for that product
 * - Attributes organized in groups within expanded view
 * - Perfect for products with many varying attributes
 * - Reduces horizontal scrolling
 */

import { useState } from "react";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import { 
  Eye, Edit, ChevronRight, ChevronDown, Package, 
  Tag, DollarSign, Info, Settings, Sparkles 
} from "lucide-react";

// Sample data
const dynamicProducts = [
  {
    id: 1,
    sku: "PROD-001",
    name: "Smart Watch Pro",
    category: "Electronics",
    brand: "TechBrand",
    price: 299.99,
    status: "Active",
    attributes: {
      Technical: {
        batteryLife: "48 hours",
        waterResistance: "IP68",
        screenSize: "1.4 inches",
        connectivity: "Bluetooth 5.0, WiFi",
        sensors: "Heart Rate, GPS, Gyroscope"
      },
      Physical: {
        color: "Black",
        weight: "45g",
        dimensions: "44mm x 38mm x 10.7mm"
      },
      Marketing: {
        warranty: "2 years",
        releaseDate: "2024-01-15",
        targetAudience: "Fitness Enthusiasts"
      }
    }
  },
  {
    id: 2,
    sku: "PROD-002",
    name: "Cotton T-Shirt",
    category: "Apparel",
    brand: "FashionCo",
    price: 29.99,
    status: "Active",
    attributes: {
      Product_Details: {
        material: "100% Cotton",
        size: "M",
        fabricWeight: "180 GSM",
        fit: "Regular Fit"
      },
      Care: {
        careInstructions: "Machine wash cold",
        dryClean: false,
        ironTemp: "Medium"
      },
      Style: {
        color: "Blue",
        pattern: "Solid",
        neckline: "Crew Neck",
        sleeveLength: "Short"
      },
      Marketing: {
        warranty: "30 days",
        collection: "Summer 2024",
        sustainabilityCert: "GOTS Certified"
      }
    }
  },
  {
    id: 3,
    sku: "PROD-003",
    name: "Organic Honey",
    category: "Food & Beverage",
    brand: "NatureFoods",
    price: 12.99,
    status: "Active",
    attributes: {
      Product_Info: {
        weight: "500g",
        origin: "New Zealand",
        organicCertified: true,
        harvestDate: "2024-03-20"
      },
      Nutrition: {
        calories: "64 per tbsp",
        sugars: "17g per tbsp",
        allergens: "None"
      },
      Storage: {
        expiryDate: "2026-12-31",
        storageTemp: "Room temperature",
        openedShelfLife: "12 months"
      },
      Compliance: {
        certifications: "USDA Organic, Non-GMO",
        ingredients: "Pure Organic Honey",
        countryOfOrigin: "New Zealand"
      }
    }
  },
  {
    id: 4,
    sku: "PROD-004",
    name: "Ergonomic Office Chair",
    category: "Furniture",
    brand: "OfficePro",
    price: 449.99,
    status: "Active",
    attributes: {
      Specifications: {
        dimensions: "24 x 24 x 45 inches",
        weightCapacity: "300 lbs",
        material: "Mesh & Steel",
        adjustableHeight: true,
        armrestType: "4D Adjustable"
      },
      Features: {
        lumbarSupport: true,
        recline: "135 degrees",
        tiltLock: true,
        swivel: "360 degrees",
        wheels: "Smooth-rolling casters"
      },
      Aesthetics: {
        color: "Gray",
        style: "Modern",
        finish: "Matte"
      },
      Warranty: {
        warranty: "5 years",
        assemblyRequired: true,
        returnPolicy: "60 days"
      }
    }
  }
];

// Icon mapping for attribute groups
const groupIcons = {
  Technical: Settings,
  Physical: Package,
  Marketing: Sparkles,
  Product_Details: Info,
  Care: Settings,
  Style: Tag,
  Product_Info: Info,
  Nutrition: Package,
  Storage: Package,
  Compliance: Info,
  Specifications: Settings,
  Features: Sparkles,
  Aesthetics: Tag,
  Warranty: Info
};

const ProductCatalog_DynamicColumns_Approach3 = () => {
  const [products] = useState(dynamicProducts);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRowExpansion = (productId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedRows(newExpanded);
  };

  // Format attribute values
  const formatValue = (value: any) => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toLocaleString();
    return String(value);
  };

  // Expandable row detail component
  const ExpandedRowContent = ({ product }: any) => {
    const attributeGroups = Object.entries(product.attributes);
    
    return (
      <div className="bg-gray-50 border-t border-gray-200 p-6">
        <div className="max-w-6xl mx-auto">
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            Complete Product Attributes
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attributeGroups.map(([groupName, attributes]: any) => {
              const IconComponent = groupIcons[groupName] || Tag;
              
              return (
                <div 
                  key={groupName}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                    <div className="p-1.5 bg-blue-50 rounded">
                      <IconComponent className="h-4 w-4 text-blue-600" />
                    </div>
                    <h5 className="text-sm font-semibold text-gray-900">
                      {groupName.replace(/_/g, ' ')}
                    </h5>
                    <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {Object.keys(attributes).length} attrs
                    </span>
                  </div>
                  
                  <dl className="space-y-2">
                    {Object.entries(attributes).map(([key, value]: any) => (
                      <div key={key} className="flex justify-between text-sm py-1">
                        <dt className="text-gray-600 font-medium">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </dt>
                        <dd className="text-gray-900 font-medium text-right ml-4">
                          {formatValue(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Custom row render with expansion
  const CustomRowRender = (
    tr: React.ReactElement<any>,
    dataItem: any
  ) => {
    const isExpanded = expandedRows.has(dataItem.id);
    
    return (
      <>
        {tr}
        {isExpanded && (
          <tr>
            <td colSpan={100}>
              <ExpandedRowContent product={dataItem} />
            </td>
          </tr>
        )}
      </>
    );
  };

  // Expand/Collapse cell
  const ExpandCell = (props: any) => {
    const isExpanded = expandedRows.has(props.dataItem.id);
    const totalAttributes = Object.values(props.dataItem.attributes)
      .reduce((sum: number, group: any) => sum + Object.keys(group).length, 0) as number;
    
    return (
      <td className="px-4 py-3">
        <button
          onClick={() => toggleRowExpansion(props.dataItem.id)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm group"
          aria-label={isExpanded ? "Collapse row" : "Expand row"}
          title={isExpanded ? "Collapse row" : "Expand row"}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 group-hover:transform group-hover:scale-110 transition-transform" />
          ) : (
            <ChevronRight className="h-4 w-4 group-hover:transform group-hover:scale-110 transition-transform" />
          )}
          <span className="text-xs bg-blue-50 px-2 py-0.5 rounded-full group-hover:bg-blue-100">
            {totalAttributes} attributes
          </span>
        </button>
      </td>
    );
  };

  // Status badge cell
  const StatusCell = (props: any) => {
    const status = props.dataItem.status;
    const colorMap = {
      Active: 'bg-green-100 text-green-800 border-green-200',
      Inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      Draft: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    
    return (
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${colorMap[status] || colorMap.Draft}`}>
          {status}
        </span>
      </td>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Approach 3: Compact Grid with Expandable Details
            </h1>
            <p className="text-gray-600 mt-2">
              Shows essential columns in the main view. Click the expand button to see 
              all product-specific attributes organized in groups.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <Package className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-900 font-medium">
              {products.length} Products
            </span>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: Eye, text: "Clean, focused main view", color: "blue" },
            { icon: ChevronDown, text: "Expand to see all details", color: "green" },
            { icon: Package, text: "Organized attribute groups", color: "purple" }
          ].map((benefit, i) => (
            <div key={i} className={`flex items-center gap-2 px-3 py-2 bg-${benefit.color}-50 border border-${benefit.color}-200 rounded-lg`}>
              <benefit.icon className={`h-4 w-4 text-${benefit.color}-600`} />
              <span className={`text-sm text-${benefit.color}-900`}>{benefit.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Product Catalog
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {expandedRows.size > 0 
                  ? `${expandedRows.size} row(s) expanded` 
                  : "Click the expand icon to view complete product details"}
              </p>
            </div>
            {expandedRows.size > 0 && (
              <button
                onClick={() => setExpandedRows(new Set())}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Collapse All
              </button>
            )}
          </div>
        </div>

        <Grid
          data={products}
          style={{ height: "auto", border: "none" }}
          className="border-none"
          rowRender={CustomRowRender}
        >
          {/* Expand column */}
          <Column
            field="expand"
            title=""
            width="140px"
            cell={ExpandCell}
          />

          {/* Essential columns */}
          <Column
            field="sku"
            title="SKU"
            width="120px"
            cell={(props) => (
              <td className="px-4 py-3">
                <span className="font-mono text-sm text-gray-700">
                  {props.dataItem.sku}
                </span>
              </td>
            )}
          />

          <Column
            field="name"
            title="Product Name"
            width="250px"
            cell={(props) => (
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium text-gray-900">
                    {props.dataItem.name}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {props.dataItem.category}
                  </div>
                </div>
              </td>
            )}
          />

          <Column
            field="brand"
            title="Brand"
            width="150px"
            cell={(props) => (
              <td className="px-4 py-3">
                <span className="text-sm text-gray-900">{props.dataItem.brand}</span>
              </td>
            )}
          />

          <Column
            field="price"
            title="Price"
            width="120px"
            cell={(props) => (
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-gray-500" />
                  <span className="font-semibold text-gray-900">
                    {props.dataItem.price.toFixed(2)}
                  </span>
                </div>
              </td>
            )}
          />

          <Column
            field="status"
            title="Status"
            width="120px"
            cell={StatusCell}
          />

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

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Usage Tips
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
          <li>Click the expand button to reveal all product attributes organized by category</li>
          <li>The main grid shows only essential information, reducing clutter</li>
          <li>Perfect for products with many varying attributes across different categories</li>
          <li>Attribute groups are color-coded and organized for easy scanning</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductCatalog_DynamicColumns_Approach3;
