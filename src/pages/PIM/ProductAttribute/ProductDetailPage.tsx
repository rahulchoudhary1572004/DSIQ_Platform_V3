import ConfigurationMode from "./ConfigurationMode";
import ProductViewMode from "./ProductViewMode";
import ViewsListPage from "./ViewsListPage";
import ProductDetailView from "./ProductDetailView";
import { useState } from "react";

export default function Page() {
  const [currentPage, setCurrentPage] = useState("product");
  const [viewTemplates, setViewTemplates] = useState([
    {
      id: "default",
      name: "Complete Product View",
      description:
        "Comprehensive view with all product details for internal management",
      isDefault: true,
      createdAt: "2024-01-15",
      lastModified: "2024-01-20",
      sections: [
        {
          id: "basic-info",
          title: "Basic Information",
          order: 0,
          attributes: [
            { id: 1, name: "Product Name", type: "String", required: true },
            { id: 2, name: "SKU", type: "String", required: true },
            { id: 3, name: "Brand", type: "Picklist", required: true },
            { id: 4, name: "Category", type: "Picklist", required: true },
            { id: 5, name: "Product Type", type: "Picklist", required: true },
            { id: 6, name: "Status", type: "Picklist", required: true },
            { id: 7, name: "Launch Date", type: "Date", required: false },
            { id: 8, name: "Discontinue Date", type: "Date", required: false },
          ],
        },
        {
          id: "pricing-inventory",
          title: "Pricing & Inventory",
          order: 1,
          attributes: [
            { id: 9, name: "Cost Price", type: "Number", required: true },
            { id: 10, name: "Selling Price", type: "Number", required: true },
            { id: 11, name: "MSRP", type: "Number", required: false },
            { id: 12, name: "Currency", type: "Picklist", required: true },
            { id: 13, name: "Stock Quantity", type: "Number", required: true },
            {
              id: 14,
              name: "Minimum Stock Level",
              type: "Number",
              required: false,
            },
            { id: 15, name: "Is Trackable", type: "Boolean", required: false },
            {
              id: 16,
              name: "Backorder Allowed",
              type: "Boolean",
              required: false,
            },
          ],
        },
        {
          id: "physical-specs",
          title: "Physical Specifications",
          order: 2,
          attributes: [
            { id: 17, name: "Weight (lbs)", type: "Number", required: false },
            {
              id: 18,
              name: "Length (inches)",
              type: "Number",
              required: false,
            },
            { id: 19, name: "Width (inches)", type: "Number", required: false },
            {
              id: 20,
              name: "Height (inches)",
              type: "Number",
              required: false,
            },
            { id: 21, name: "Color", type: "Picklist", required: false },
            { id: 22, name: "Material", type: "Picklist", required: false },
            { id: 23, name: "Package Type", type: "Picklist", required: false },
          ],
        },
        {
          id: "descriptions",
          title: "Descriptions & Content",
          order: 3,
          attributes: [
            { id: 24, name: "Short Description", type: "Text", required: true },
            {
              id: 25,
              name: "Long Description",
              type: "Rich Text",
              required: false,
            },
            { id: 26, name: "Features", type: "Rich Text", required: false },
            { id: 27, name: "Benefits", type: "Rich Text", required: false },
            {
              id: 28,
              name: "Usage Instructions",
              type: "Rich Text",
              required: false,
            },
            { id: 29, name: "Keywords", type: "Text", required: false },
          ],
        },
        {
          id: "media",
          title: "Media & Assets",
          order: 4,
          attributes: [
            {
              id: 30,
              name: "Primary Image URL",
              type: "String",
              required: true,
            },
            { id: 31, name: "Gallery Images", type: "Text", required: false },
            { id: 32, name: "Video URL", type: "String", required: false },
            { id: 33, name: "Brochure URL", type: "String", required: false },
            { id: 34, name: "Manual URL", type: "String", required: false },
          ],
        },
        {
          id: "warranty-support",
          title: "Warranty & Support",
          order: 5,
          attributes: [
            {
              id: 35,
              name: "Warranty Period (months)",
              type: "Number",
              required: false,
            },
            {
              id: 36,
              name: "Warranty Type",
              type: "Picklist",
              required: false,
            },
            {
              id: 37,
              name: "Warranty Coverage",
              type: "Rich Text",
              required: false,
            },
            {
              id: 38,
              name: "Support Contact",
              type: "String",
              required: false,
            },
            {
              id: 39,
              name: "Return Policy",
              type: "Rich Text",
              required: false,
            },
          ],
        },
      ],
    },
    {
      id: "customer-facing",
      name: "Customer View",
      description:
        "Simplified view optimized for customer-facing applications and e-commerce",
      isDefault: false,
      createdAt: "2024-01-16",
      lastModified: "2024-01-18",
      sections: [
        {
          id: "product-overview",
          title: "Product Overview",
          order: 0,
          attributes: [
            { id: 1, name: "Product Name", type: "String", required: true },
            { id: 3, name: "Brand", type: "Picklist", required: true },
            { id: 4, name: "Category", type: "Picklist", required: true },
            { id: 10, name: "Selling Price", type: "Number", required: true },
            { id: 12, name: "Currency", type: "Picklist", required: true },
            { id: 6, name: "Status", type: "Picklist", required: true },
          ],
        },
        {
          id: "customer-info",
          title: "Product Information",
          order: 1,
          attributes: [
            { id: 24, name: "Short Description", type: "Text", required: true },
            {
              id: 25,
              name: "Long Description",
              type: "Rich Text",
              required: false,
            },
            { id: 26, name: "Features", type: "Rich Text", required: false },
            { id: 21, name: "Color", type: "Picklist", required: false },
            { id: 22, name: "Material", type: "Picklist", required: false },
          ],
        },
        {
          id: "customer-media",
          title: "Product Media",
          order: 2,
          attributes: [
            {
              id: 30,
              name: "Primary Image URL",
              type: "String",
              required: true,
            },
            { id: 31, name: "Gallery Images", type: "Text", required: false },
            { id: 32, name: "Video URL", type: "String", required: false },
          ],
        },
      ],
    },
    {
      id: "inventory-warehouse",
      name: "Inventory & Warehouse View",
      description:
        "Focused on logistics, inventory management, and warehouse operations",
      isDefault: false,
      createdAt: "2024-01-17",
      lastModified: "2024-01-19",
      sections: [
        {
          id: "identification",
          title: "Product Identification",
          order: 0,
          attributes: [
            { id: 1, name: "Product Name", type: "String", required: true },
            { id: 2, name: "SKU", type: "String", required: true },
            { id: 40, name: "Barcode", type: "String", required: false },
            { id: 41, name: "UPC", type: "String", required: false },
            { id: 42, name: "Internal Code", type: "String", required: false },
          ],
        },
        {
          id: "inventory-details",
          title: "Inventory Management",
          order: 1,
          attributes: [
            { id: 13, name: "Stock Quantity", type: "Number", required: true },
            {
              id: 14,
              name: "Minimum Stock Level",
              type: "Number",
              required: false,
            },
            {
              id: 43,
              name: "Maximum Stock Level",
              type: "Number",
              required: false,
            },
            { id: 44, name: "Reorder Point", type: "Number", required: false },
            {
              id: 45,
              name: "Lead Time (days)",
              type: "Number",
              required: false,
            },
            { id: 15, name: "Is Trackable", type: "Boolean", required: false },
            {
              id: 16,
              name: "Backorder Allowed",
              type: "Boolean",
              required: false,
            },
          ],
        },
        {
          id: "warehouse-specs",
          title: "Warehouse Specifications",
          order: 2,
          attributes: [
            { id: 17, name: "Weight (lbs)", type: "Number", required: false },
            {
              id: 18,
              name: "Length (inches)",
              type: "Number",
              required: false,
            },
            { id: 19, name: "Width (inches)", type: "Number", required: false },
            {
              id: 20,
              name: "Height (inches)",
              type: "Number",
              required: false,
            },
            {
              id: 46,
              name: "Storage Location",
              type: "String",
              required: false,
            },
            {
              id: 47,
              name: "Storage Requirements",
              type: "Picklist",
              required: false,
            },
            { id: 48, name: "Fragile", type: "Boolean", required: false },
            { id: 49, name: "Hazardous", type: "Boolean", required: false },
          ],
        },
        {
          id: "supplier-info",
          title: "Supplier Information",
          order: 3,
          attributes: [
            {
              id: 50,
              name: "Primary Supplier",
              type: "String",
              required: false,
            },
            { id: 51, name: "Supplier SKU", type: "String", required: false },
            { id: 9, name: "Cost Price", type: "Number", required: true },
            { id: 52, name: "Last Order Date", type: "Date", required: false },
            { id: 53, name: "Next Order Date", type: "Date", required: false },
          ],
        },
      ],
    },
    {
      id: "marketing-content",
      name: "Marketing & Content View",
      description: "Optimized for marketing teams and content management",
      isDefault: false,
      createdAt: "2024-01-18",
      lastModified: "2024-01-20",
      sections: [
        {
          id: "marketing-basics",
          title: "Marketing Basics",
          order: 0,
          attributes: [
            { id: 1, name: "Product Name", type: "String", required: true },
            { id: 3, name: "Brand", type: "Picklist", required: true },
            { id: 4, name: "Category", type: "Picklist", required: true },
            {
              id: 54,
              name: "Target Audience",
              type: "Picklist",
              required: false,
            },
            {
              id: 55,
              name: "Marketing Campaign",
              type: "String",
              required: false,
            },
            {
              id: 56,
              name: "Promotion Type",
              type: "Picklist",
              required: false,
            },
          ],
        },
        {
          id: "content-marketing",
          title: "Marketing Content",
          order: 1,
          attributes: [
            { id: 24, name: "Short Description", type: "Text", required: true },
            {
              id: 25,
              name: "Long Description",
              type: "Rich Text",
              required: false,
            },
            {
              id: 57,
              name: "Marketing Headline",
              type: "String",
              required: false,
            },
            {
              id: 58,
              name: "Marketing Tagline",
              type: "String",
              required: false,
            },
            { id: 26, name: "Features", type: "Rich Text", required: false },
            { id: 27, name: "Benefits", type: "Rich Text", required: false },
            {
              id: 59,
              name: "Unique Selling Points",
              type: "Rich Text",
              required: false,
            },
          ],
        },
        {
          id: "seo-social",
          title: "SEO & Social Media",
          order: 2,
          attributes: [
            { id: 29, name: "Keywords", type: "Text", required: false },
            { id: 60, name: "Meta Title", type: "String", required: false },
            { id: 61, name: "Meta Description", type: "Text", required: false },
            {
              id: 62,
              name: "Social Media Caption",
              type: "Text",
              required: false,
            },
            { id: 63, name: "Hashtags", type: "Text", required: false },
          ],
        },
        {
          id: "marketing-media",
          title: "Marketing Media",
          order: 3,
          attributes: [
            {
              id: 30,
              name: "Primary Image URL",
              type: "String",
              required: true,
            },
            { id: 31, name: "Gallery Images", type: "Text", required: false },
            { id: 32, name: "Video URL", type: "String", required: false },
            {
              id: 64,
              name: "Social Media Images",
              type: "Text",
              required: false,
            },
            { id: 65, name: "Banner Images", type: "Text", required: false },
          ],
        },
      ],
    },
    {
      id: "technical-specs",
      name: "Technical Specifications",
      description:
        "Detailed technical view for engineering and product development teams",
      isDefault: false,
      createdAt: "2024-01-19",
      lastModified: "2024-01-21",
      sections: [
        {
          id: "tech-identification",
          title: "Technical Identification",
          order: 0,
          attributes: [
            { id: 1, name: "Product Name", type: "String", required: true },
            { id: 2, name: "SKU", type: "String", required: true },
            { id: 66, name: "Model Number", type: "String", required: false },
            { id: 67, name: "Part Number", type: "String", required: false },
            { id: 68, name: "Revision", type: "String", required: false },
          ],
        },
        {
          id: "technical-specs-detail",
          title: "Technical Specifications",
          order: 1,
          attributes: [
            { id: 17, name: "Weight (lbs)", type: "Number", required: false },
            {
              id: 18,
              name: "Length (inches)",
              type: "Number",
              required: false,
            },
            { id: 19, name: "Width (inches)", type: "Number", required: false },
            {
              id: 20,
              name: "Height (inches)",
              type: "Number",
              required: false,
            },
            { id: 22, name: "Material", type: "Picklist", required: false },
            {
              id: 69,
              name: "Operating Temperature (°F)",
              type: "String",
              required: false,
            },
            {
              id: 70,
              name: "Storage Temperature (°F)",
              type: "String",
              required: false,
            },
            {
              id: 71,
              name: "Humidity Range (%)",
              type: "String",
              required: false,
            },
          ],
        },
        {
          id: "performance-specs",
          title: "Performance Specifications",
          order: 2,
          attributes: [
            {
              id: 72,
              name: "Power Consumption (W)",
              type: "Number",
              required: false,
            },
            { id: 73, name: "Voltage (V)", type: "Number", required: false },
            { id: 74, name: "Current (A)", type: "Number", required: false },
            { id: 75, name: "Frequency (Hz)", type: "Number", required: false },
            { id: 76, name: "Efficiency (%)", type: "Number", required: false },
            { id: 77, name: "Capacity", type: "String", required: false },
            { id: 78, name: "Speed/Rate", type: "String", required: false },
          ],
        },
        {
          id: "compliance-standards",
          title: "Compliance & Standards",
          order: 3,
          attributes: [
            { id: 79, name: "Certifications", type: "Text", required: false },
            {
              id: 80,
              name: "Standards Compliance",
              type: "Text",
              required: false,
            },
            { id: 81, name: "Safety Ratings", type: "Text", required: false },
            {
              id: 82,
              name: "Environmental Compliance",
              type: "Text",
              required: false,
            },
            {
              id: 83,
              name: "Country of Origin",
              type: "Picklist",
              required: false,
            },
          ],
        },
        {
          id: "tech-documentation",
          title: "Technical Documentation",
          order: 4,
          attributes: [
            { id: 34, name: "Manual URL", type: "String", required: false },
            { id: 84, name: "Datasheet URL", type: "String", required: false },
            { id: 85, name: "CAD Files URL", type: "String", required: false },
            {
              id: 86,
              name: "Test Reports URL",
              type: "String",
              required: false,
            },
            {
              id: 87,
              name: "Installation Guide URL",
              type: "String",
              required: false,
            },
          ],
        },
      ],
    },
  ]);
  const [productData, setProductData] = useState({
    1: "Premium Auto Oil Filter Pro",
    2: "AOF-PRO-2024-001",
    3: "Advance Auto Parts",
    4: "Automotive Filters",
    5: "Oil Filter",
    6: "Active",
    7: "2024-01-15",
    8: "",
    9: "12.50",
    10: "24.99",
    11: "29.99",
    12: "USD",
    13: "150",
    14: "25",
    15: true,
    16: false,
    17: "0.8",
    18: "4.5",
    19: "3.2",
    20: "3.2",
    21: "Black",
    22: "Metal",
    23: "Retail Box",
    24: "High-performance oil filter designed for maximum engine protection and extended service life.",
    25: "The Premium Auto Oil Filter Pro features advanced filtration technology with synthetic media that captures 99% of harmful contaminants. Engineered for superior durability and performance, this filter provides exceptional protection for your engine while maintaining optimal oil flow. Perfect for both conventional and synthetic oils.",
    26: "• Advanced synthetic filtration media\n• 99% contaminant capture efficiency\n• Anti-drainback valve prevents dry starts\n• Silicone gasket for secure seal\n• Heavy-duty steel construction",
    27: "• Extended engine life\n• Improved fuel economy\n• Reduced maintenance costs\n• Enhanced engine performance\n• Peace of mind protection",
    28: "1. Ensure engine is cool before installation\n2. Remove old filter using proper filter wrench\n3. Clean filter mounting surface\n4. Apply thin layer of oil to new filter gasket\n5. Install new filter hand-tight plus 3/4 turn\n6. Check for leaks after engine warm-up",
    29: "oil filter, automotive, engine protection, synthetic media, premium quality",
    30: "https://example.com/images/oil-filter-primary.jpg",
    31: "https://example.com/images/oil-filter-1.jpg, https://example.com/images/oil-filter-2.jpg",
    32: "https://example.com/videos/installation-guide.mp4",
    33: "https://example.com/brochures/oil-filter-specs.pdf",
    34: "https://example.com/manuals/installation-manual.pdf",
    35: "12",
    36: "Limited",
    37: "Covers manufacturing defects and material failures under normal use conditions.",
    38: "support@advanceautoparts.com",
    39: "30-day return policy for unused products in original packaging.",
    40: "123456789012",
    41: "012345678901",
    42: "INT-AOF-001",
    43: "500",
    44: "50",
    45: "7",
    46: "A-12-B",
    47: "Room Temperature",
    48: false,
    49: false,
    50: "FilterTech Industries",
    51: "FTI-AOF-2024",
    52: "2024-01-10",
    53: "2024-02-15",
    54: "Auto Enthusiasts",
    55: "Spring Maintenance Campaign",
    56: "Seasonal Promotion",
    57: "Ultimate Engine Protection",
    58: "Filter Like a Pro",
    59: "• Industry-leading filtration efficiency\n• Trusted by mechanics nationwide\n• Premium quality at competitive price",
    60: "Premium Auto Oil Filter Pro - Advanced Engine Protection",
    61: "High-performance oil filter with 99% contaminant capture efficiency. Perfect for all vehicle types.",
    62: "Keep your engine running smooth with our Premium Oil Filter Pro! 🚗✨ #EngineProtection #AutoMaintenance",
    63: "#OilFilter #AutoParts #EngineProtection #CarMaintenance #Premium #Quality",
    64: "https://example.com/social/oil-filter-social-1.jpg, https://example.com/social/oil-filter-social-2.jpg",
    65: "https://example.com/banners/oil-filter-banner.jpg",
    66: "AOF-PRO-2024",
    67: "P/N-AOF-001",
    68: "Rev-A",
    69: "-40 to 250",
    70: "-40 to 300",
    71: "0-95",
    72: "0",
    73: "12",
    74: "0",
    75: "0",
    76: "99",
    77: "1 Quart Flow Capacity",
    78: "15 GPM Max Flow Rate",
    79: "ISO 9001, SAE J1858",
    80: "SAE J1858, ISO 4548-12",
    81: "UL Listed",
    82: "RoHS Compliant",
    83: "United States",
    84: "https://example.com/datasheets/oil-filter-datasheet.pdf",
    85: "https://example.com/cad/oil-filter-3d-model.dwg",
    86: "https://example.com/reports/filtration-test-report.pdf",
    87: "https://example.com/guides/professional-installation-guide.pdf",
  });
  const [picklistOptions, setPicklistOptions] = useState({
    3: [
      "Advance Auto Parts",
      "Bosch",
      "K&N",
      "Fram",
      "Mobil 1",
      "Purolator",
      "WIX",
      "AC Delco",
    ],
    4: [
      "Automotive Filters",
      "Engine Parts",
      "Maintenance Items",
      "Performance Parts",
      "OEM Parts",
    ],
    5: [
      "Oil Filter",
      "Air Filter",
      "Fuel Filter",
      "Cabin Filter",
      "Transmission Filter",
    ],
    6: ["Active", "Inactive", "Discontinued", "Coming Soon", "Out of Stock"],
    12: ["USD", "EUR", "GBP", "CAD", "AUD"],
    21: ["Black", "White", "Silver", "Blue", "Red", "Yellow", "Green"],
    22: ["Metal", "Plastic", "Composite", "Rubber", "Synthetic", "Paper"],
    23: [
      "Retail Box",
      "Bulk Pack",
      "Blister Pack",
      "Poly Bag",
      "Custom Packaging",
    ],
    36: ["Limited", "Full", "Extended", "Lifetime", "No Warranty"],
    47: [
      "Room Temperature",
      "Refrigerated",
      "Climate Controlled",
      "Dry Storage",
      "Hazmat",
    ],
    54: [
      "Auto Enthusiasts",
      "Professional Mechanics",
      "Fleet Managers",
      "DIY Mechanics",
      "General Public",
    ],
    56: [
      "Seasonal Promotion",
      "New Product Launch",
      "Clearance Sale",
      "Bundle Deal",
      "Loyalty Program",
    ],
    83: [
      "United States",
      "Canada",
      "Mexico",
      "Germany",
      "Japan",
      "China",
      "South Korea",
    ],
  });
  const [activeViewId, setActiveViewId] = useState("default");

  const handleSaveChanges = () => {
    alert("Changes Saved!");
  };

  const handleConfigureView = (viewId) => {
    setActiveViewId(viewId);
    setCurrentPage("config");
  };

  const handleCreateView = (sourceViewId, newViewData) => {
    const sourceView = viewTemplates.find((v) => v.id === sourceViewId);
    if (!sourceView) return;

    const newView = {
      id: `view-${Date.now()}`,
      name: newViewData.name,
      description: newViewData.description,
      isDefault: false,
      createdAt: new Date().toISOString().split("T")[0],
      lastModified: new Date().toISOString().split("T")[0],
      sections: sourceView.sections.map((section) => ({
        ...section,
        id: `${section.id}-${Date.now()}`,
        attributes: section.attributes.map((attr) => ({
          ...attr,
          id: attr.id + 1000 + Math.floor(Math.random() * 1000),
        })),
      })),
    };

    setViewTemplates((prev) => [...prev, newView]);
    setActiveViewId(newView.id);
    setCurrentPage("config");
  };

  const handleDeleteView = (viewId) => {
    if (viewTemplates.find((v) => v.id === viewId)?.isDefault) {
      alert("Cannot delete the default view");
      return;
    }

    setViewTemplates((prev) => prev.filter((v) => v.id !== viewId));

    if (activeViewId === viewId) {
      setActiveViewId("default");
    }
  };

  return (
    <div>
      {currentPage === "product" && (
        <ProductViewMode
          viewTemplates={viewTemplates}
          productData={productData}
          setProductData={setProductData}
          picklistOptions={picklistOptions}
          activeViewId={activeViewId}
          setActiveViewId={setActiveViewId}
          setCurrentPage={setCurrentPage}
          handleSaveChanges={handleSaveChanges}
        />
      )}
      {currentPage === "config" && (
        <ConfigurationMode
          viewTemplates={viewTemplates}
          activeViewId={activeViewId}
          picklistOptions={picklistOptions}
          setCurrentPage={setCurrentPage}
          handleSaveChanges={handleSaveChanges}
          {...{setViewTemplates, setPicklistOptions} as any}
        />
      )}
      {currentPage === "views" && (
        <ViewsListPage
          viewTemplates={viewTemplates}
          setCurrentPage={setCurrentPage}
          onConfigureView={handleConfigureView}
          onCreateView={handleCreateView}
          onDeleteView={handleDeleteView}
        />
      )}
        <ProductDetailView
          viewTemplates={viewTemplates}
          productData={productData}
          setProductData={setProductData}
          picklistOptions={picklistOptions}
          activeViewId={activeViewId}
          setActiveViewId={setActiveViewId}
          setCurrentPage={setCurrentPage}
          handleSaveChanges={handleSaveChanges}
          {...{setPicklistOptions} as any}
        />
    </div>
  );
}
