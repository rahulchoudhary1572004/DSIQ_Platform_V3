export const mockViewTemplates = [
  {
    id: "default",
    name: "Complete Product View",
    description: "Comprehensive view with all product details for internal management",
    isDefault: true,
    createdAt: "2024-01-15",
    lastModified: "2024-01-20",
    defaultFieldMapping: {
      templateId: "template-automotive-multiretailer",
      enabledRetailers: ["amazon", "walmart", "target"],
    },
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
          { id: 14, name: "Minimum Stock Level", type: "Number", required: false },
          { id: 15, name: "Is Trackable", type: "Boolean", required: false },
          { id: 16, name: "Backorder Allowed", type: "Boolean", required: false },
        ],
      },
      {
        id: "physical-specs",
        title: "Physical Specifications",
        order: 2,
        attributes: [
          { id: 17, name: "Weight (lbs)", type: "Number", required: false },
          { id: 18, name: "Length (inches)", type: "Number", required: false },
          { id: 19, name: "Width (inches)", type: "Number", required: false },
          { id: 20, name: "Height (inches)", type: "Number", required: false },
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
          { id: 25, name: "Long Description", type: "Rich Text", required: false },
          { id: 26, name: "Features", type: "Rich Text", required: false },
          { id: 27, name: "Benefits", type: "Rich Text", required: false },
          { id: 28, name: "Usage Instructions", type: "Rich Text", required: false },
          { id: 29, name: "Keywords", type: "Text", required: false },
        ],
      },
    ],
  },
  {
    id: "customer-facing",
    name: "Customer View",
    description: "Simplified view optimized for customer-facing applications and e-commerce",
    isDefault: false,
    createdAt: "2024-01-16",
    lastModified: "2024-01-18",
    defaultFieldMapping: {
      templateId: "template-electronics-multiretailer",
      enabledRetailers: ["shopify", "target"],
    },
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
          { id: 25, name: "Long Description", type: "Rich Text", required: false },
          { id: 26, name: "Features", type: "Rich Text", required: false },
          { id: 21, name: "Color", type: "Picklist", required: false },
          { id: 22, name: "Material", type: "Picklist", required: false },
        ],
      },
    ],
  },
]

export const mockProductData = {
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
  25: "The Premium Auto Oil Filter Pro features advanced filtration technology with synthetic media that captures 99% of harmful contaminants.",
  26: "• Advanced synthetic filtration media\n• 99% contaminant capture efficiency\n• Anti-drainback valve prevents dry starts",
  27: "• Extended engine life\n• Improved fuel economy\n• Reduced maintenance costs",
  28: "1. Ensure engine is cool before installation\n2. Remove old filter using proper filter wrench",
  29: "oil filter, automotive, engine protection, synthetic media, premium quality",
}

export const mockPicklistOptions = {
  3: ["Advance Auto Parts", "Bosch", "K&N", "Fram", "Mobil 1", "Purolator", "WIX", "AC Delco"],
  4: ["Automotive Filters", "Engine Parts", "Maintenance Items", "Performance Parts", "OEM Parts"],
  5: ["Oil Filter", "Air Filter", "Fuel Filter", "Cabin Filter", "Transmission Filter"],
  6: ["Active", "Inactive", "Discontinued", "Coming Soon", "Out of Stock"],
  12: ["USD", "EUR", "GBP", "CAD", "AUD"],
  21: ["Black", "White", "Silver", "Blue", "Red", "Yellow", "Green"],
  22: ["Metal", "Plastic", "Composite", "Rubber", "Synthetic", "Paper"],
  23: ["Retail Box", "Bulk Pack", "Blister Pack", "Poly Bag", "Custom Packaging"],
}

export const mockProducts = [
  {
    id: "PRD-001",
    sku: "LAPTOP-HP-001",
    name: "HP EliteBook 840 G8",
    category: "Electronics",
    subcategory: "Laptops",
    brand: "HP",
    channels: [
      {
        name: "Amazon",
        status: "synced",
        reason: "Successfully synced 2 hours ago",
        lastSync: "2024-01-15 14:30",
      },
      {
        name: "eBay",
        status: "pending",
        reason: "Waiting for price approval",
        lastSync: "2024-01-15 12:00",
      },
      {
        name: "Shopify",
        status: "synced",
        reason: "All data synchronized",
        lastSync: "2024-01-15 15:00",
      },
    ],
    lastModified: "2024-01-15",
    completeness: 95,
    status: "active",
  },
  {
    id: "PRD-002",
    sku: "PHONE-APPLE-001",
    name: "iPhone 15 Pro Max",
    category: "Electronics",
    subcategory: "Mobile Phones",
    brand: "Apple",
    channels: [
      {
        name: "Amazon",
        status: "failed",
        reason: "Missing product description",
        lastSync: "2024-01-14 10:30",
      },
      {
        name: "Best Buy",
        status: "pending",
        reason: "Pending inventory update",
        lastSync: "2024-01-14 09:00",
      },
    ],
    lastModified: "2024-01-14",
    completeness: 88,
    status: "active",
  },
  {
    id: "PRD-003",
    sku: "WATCH-SAMSUNG-001",
    name: "Samsung Galaxy Watch 6",
    category: "Electronics",
    subcategory: "Wearables",
    brand: "Samsung",
    channels: [
      {
        name: "Amazon",
        status: "failed",
        reason: "Invalid product category mapping",
        lastSync: "2024-01-13 16:45",
      },
      {
        name: "Target",
        status: "failed",
        reason: "Missing required specifications",
        lastSync: "2024-01-13 15:20",
      },
    ],
    lastModified: "2024-01-13",
    completeness: 45,
    status: "draft",
  },
  {
    id: "PRD-004",
    sku: "TABLET-IPAD-001",
    name: 'iPad Pro 12.9"',
    category: "Electronics",
    subcategory: "Tablets",
    brand: "Apple",
    channels: [
      {
        name: "Amazon",
        status: "synced",
        reason: "Perfect sync - all data current",
        lastSync: "2024-01-16 11:15",
      },
      {
        name: "Apple Store",
        status: "synced",
        reason: "Direct integration active",
        lastSync: "2024-01-16 11:20",
      },
      {
        name: "Target",
        status: "synced",
        reason: "Successfully updated inventory",
        lastSync: "2024-01-16 10:45",
      },
    ],
    lastModified: "2024-01-16",
    completeness: 100,
    status: "active",
  },
  {
    id: "PRD-005",
    sku: "HEADPHONES-SONY-001",
    name: "Sony WH-1000XM5",
    category: "Electronics",
    subcategory: "Audio",
    brand: "Sony",
    channels: [
      {
        name: "Amazon",
        status: "synced",
        reason: "All product data synchronized",
        lastSync: "2024-01-16 09:30",
      },
      {
        name: "Best Buy",
        status: "pending",
        reason: "Awaiting image approval",
        lastSync: "2024-01-15 18:00",
      },
    ],
    lastModified: "2024-01-15",
    completeness: 92,
    status: "active",
  },
  {
    id: "PRD-006",
    sku: "CAMERA-CANON-001",
    name: "Canon EOS R6 Mark II",
    category: "Electronics",
    subcategory: "Cameras",
    brand: "Canon",
    channels: [
      {
        name: "Amazon",
        status: "synced",
        reason: "Successfully synced all data",
        lastSync: "2024-01-16 13:20",
      },
      {
        name: "B&H Photo",
        status: "synced",
        reason: "Fully synchronized",
        lastSync: "2024-01-16 12:45",
      },
    ],
    lastModified: "2024-01-16",
    completeness: 98,
    status: "active",
  },
  {
    id: "PRD-007",
    sku: "TV-LG-001",
    name: "LG C3 OLED 65 inch",
    category: "Electronics",
    subcategory: "Televisions",
    brand: "LG",
    channels: [
      {
        name: "Best Buy",
        status: "synced",
        reason: "All specifications updated",
        lastSync: "2024-01-15 16:30",
      },
      {
        name: "Target",
        status: "pending",
        reason: "Waiting for stock confirmation",
        lastSync: "2024-01-15 14:20",
      },
      {
        name: "Amazon",
        status: "synced",
        reason: "Complete product sync",
        lastSync: "2024-01-15 17:00",
      },
    ],
    lastModified: "2024-01-15",
    completeness: 94,
    status: "active",
  },
  {
    id: "PRD-008",
    sku: "MOUSE-LOGITECH-001",
    name: "Logitech MX Master 3S",
    category: "Electronics",
    subcategory: "Accessories",
    brand: "Logitech",
    channels: [
      {
        name: "Amazon",
        status: "synced",
        reason: "All data synchronized",
        lastSync: "2024-01-16 08:15",
      },
      {
        name: "Walmart",
        status: "synced",
        reason: "Product listing updated",
        lastSync: "2024-01-16 07:30",
      },
    ],
    lastModified: "2024-01-16",
    completeness: 100,
    status: "active",
  },
  {
    id: "PRD-009",
    sku: "KEYBOARD-RAZER-001",
    name: "Razer BlackWidow V4 Pro",
    category: "Electronics",
    subcategory: "Accessories",
    brand: "Razer",
    channels: [
      {
        name: "Amazon",
        status: "failed",
        reason: "Image quality requirements not met",
        lastSync: "2024-01-14 11:20",
      },
      {
        name: "Newegg",
        status: "pending",
        reason: "Awaiting category approval",
        lastSync: "2024-01-14 10:00",
      },
    ],
    lastModified: "2024-01-14",
    completeness: 68,
    status: "draft",
  },
  {
    id: "PRD-010",
    sku: "SPEAKER-BOSE-001",
    name: "Bose SoundLink Revolve+",
    category: "Electronics",
    subcategory: "Audio",
    brand: "Bose",
    channels: [
      {
        name: "Amazon",
        status: "synced",
        reason: "Product fully synchronized",
        lastSync: "2024-01-16 10:30",
      },
      {
        name: "Best Buy",
        status: "synced",
        reason: "All data current",
        lastSync: "2024-01-16 09:45",
      },
    ],
    lastModified: "2024-01-16",
    completeness: 96,
    status: "active",
  },
  {
    id: "PRD-011",
    sku: "CONSOLE-PS5-001",
    name: "PlayStation 5 Digital Edition",
    category: "Gaming",
    subcategory: "Consoles",
    brand: "Sony",
    channels: [
      {
        name: "Amazon",
        status: "synced",
        reason: "Successfully updated",
        lastSync: "2024-01-16 15:00",
      },
      {
        name: "GameStop",
        status: "synced",
        reason: "Inventory synchronized",
        lastSync: "2024-01-16 14:30",
      },
      {
        name: "Target",
        status: "pending",
        reason: "Price verification in progress",
        lastSync: "2024-01-16 13:00",
      },
    ],
    lastModified: "2024-01-16",
    completeness: 91,
    status: "active",
  },
  {
    id: "PRD-012",
    sku: "MONITOR-DELL-001",
    name: "Dell UltraSharp 27 4K",
    category: "Electronics",
    subcategory: "Monitors",
    brand: "Dell",
    channels: [
      {
        name: "Amazon",
        status: "synced",
        reason: "All specifications updated",
        lastSync: "2024-01-15 12:30",
      },
      {
        name: "Dell Direct",
        status: "synced",
        reason: "Direct sync active",
        lastSync: "2024-01-15 12:35",
      },
    ],
    lastModified: "2024-01-15",
    completeness: 99,
    status: "active",
  },
  {
    id: "PRD-013",
    sku: "ROUTER-ASUS-001",
    name: "ASUS RT-AX88U Pro",
    category: "Electronics",
    subcategory: "Networking",
    brand: "ASUS",
    channels: [
      {
        name: "Amazon",
        status: "failed",
        reason: "Missing technical specifications",
        lastSync: "2024-01-13 09:00",
      },
      {
        name: "Newegg",
        status: "failed",
        reason: "Incomplete product details",
        lastSync: "2024-01-13 08:30",
      },
    ],
    lastModified: "2024-01-13",
    completeness: 52,
    status: "draft",
  },
  {
    id: "PRD-014",
    sku: "PRINTER-HP-001",
    name: "HP OfficeJet Pro 9025e",
    category: "Office",
    subcategory: "Printers",
    brand: "HP",
    channels: [
      {
        name: "Amazon",
        status: "synced",
        reason: "Product data current",
        lastSync: "2024-01-16 11:00",
      },
      {
        name: "Staples",
        status: "synced",
        reason: "All information updated",
        lastSync: "2024-01-16 10:15",
      },
      {
        name: "Office Depot",
        status: "pending",
        reason: "Waiting for price update",
        lastSync: "2024-01-15 16:00",
      },
    ],
    lastModified: "2024-01-16",
    completeness: 87,
    status: "active",
  },
  {
    id: "PRD-015",
    sku: "CHAIR-HERMAN-001",
    name: "Herman Miller Aeron Chair",
    category: "Furniture",
    subcategory: "Office Chairs",
    brand: "Herman Miller",
    channels: [
      {
        name: "Amazon",
        status: "synced",
        reason: "Successfully synchronized",
        lastSync: "2024-01-15 14:45",
      },
      {
        name: "Wayfair",
        status: "synced",
        reason: "All data updated",
        lastSync: "2024-01-15 14:20",
      },
    ],
    lastModified: "2024-01-15",
    completeness: 93,
    status: "active",
  },
  {
    id: "PRD-016",
    sku: "DESK-UPLIFT-001",
    name: "Uplift V2 Standing Desk",
    category: "Furniture",
    subcategory: "Desks",
    brand: "Uplift",
    channels: [
      {
        name: "Amazon",
        status: "pending",
        reason: "Dimensions verification needed",
        lastSync: "2024-01-14 15:30",
      },
      {
        name: "Uplift Direct",
        status: "synced",
        reason: "Direct integration active",
        lastSync: "2024-01-14 15:35",
      },
    ],
    lastModified: "2024-01-14",
    completeness: 85,
    status: "active",
  },
  {
    id: "PRD-017",
    sku: "BACKPACK-NORTH-001",
    name: "The North Face Borealis",
    category: "Fashion",
    subcategory: "Bags",
    brand: "The North Face",
    channels: [
      {
        name: "Amazon",
        status: "synced",
        reason: "Product fully listed",
        lastSync: "2024-01-16 12:00",
      },
      {
        name: "REI",
        status: "synced",
        reason: "Inventory updated",
        lastSync: "2024-01-16 11:30",
      },
      {
        name: "Dick's Sporting",
        status: "synced",
        reason: "All data synchronized",
        lastSync: "2024-01-16 11:45",
      },
    ],
    lastModified: "2024-01-16",
    completeness: 97,
    status: "active",
  },
  {
    id: "PRD-018",
    sku: "SHOES-NIKE-001",
    name: "Nike Air Max 90",
    category: "Fashion",
    subcategory: "Footwear",
    brand: "Nike",
    channels: [
      {
        name: "Nike.com",
        status: "synced",
        reason: "Direct brand sync",
        lastSync: "2024-01-16 09:00",
      },
      {
        name: "Foot Locker",
        status: "synced",
        reason: "Stock levels updated",
        lastSync: "2024-01-16 08:45",
      },
    ],
    lastModified: "2024-01-16",
    completeness: 100,
    status: "active",
  },
  {
    id: "PRD-019",
    sku: "JACKET-PATAGONIA-001",
    name: "Patagonia Better Sweater",
    category: "Fashion",
    subcategory: "Outerwear",
    brand: "Patagonia",
    channels: [
      {
        name: "Amazon",
        status: "failed",
        reason: "Color variants missing",
        lastSync: "2024-01-13 14:00",
      },
      {
        name: "Patagonia.com",
        status: "synced",
        reason: "Direct sync active",
        lastSync: "2024-01-13 14:05",
      },
    ],
    lastModified: "2024-01-13",
    completeness: 72,
    status: "draft",
  },
  {
    id: "PRD-020",
    sku: "VITAMINS-MULTI-001",
    name: "Daily Multivitamin Complex",
    category: "Health",
    subcategory: "Supplements",
    brand: "Nature Made",
    channels: [
      {
        name: "Amazon",
        status: "synced",
        reason: "All nutrition facts updated",
        lastSync: "2024-01-16 10:00",
      },
      {
        name: "CVS",
        status: "synced",
        reason: "Product information current",
        lastSync: "2024-01-16 09:30",
      },
      {
        name: "Walgreens",
        status: "pending",
        reason: "FDA compliance review",
        lastSync: "2024-01-15 17:00",
      },
    ],
    lastModified: "2024-01-16",
    completeness: 90,
    status: "active",
  },
  {
    id: "PRD-021",
    sku: "BLENDER-NINJA-001",
    name: "Ninja Professional Blender",
    category: "Home",
    subcategory: "Kitchen Appliances",
    brand: "Ninja",
    channels: [
      {
        name: "Amazon",
        status: "synced",
        reason: "Product details updated",
        lastSync: "2024-01-15 13:30",
      },
      {
        name: "Target",
        status: "synced",
        reason: "All data synchronized",
        lastSync: "2024-01-15 13:00",
      },
    ],
    lastModified: "2024-01-15",
    completeness: 95,
    status: "active",
  },
  {
    id: "PRD-022",
    sku: "VACUUM-DYSON-001",
    name: "Dyson V15 Detect",
    category: "Home",
    subcategory: "Cleaning",
    brand: "Dyson",
    channels: [
      {
        name: "Amazon",
        status: "synced",
        reason: "Successfully updated",
        lastSync: "2024-01-16 14:00",
      },
      {
        name: "Best Buy",
        status: "synced",
        reason: "Complete sync",
        lastSync: "2024-01-16 13:45",
      },
      {
        name: "Dyson.com",
        status: "synced",
        reason: "Direct integration",
        lastSync: "2024-01-16 14:05",
      },
    ],
    lastModified: "2024-01-16",
    completeness: 98,
    status: "active",
  },
  {
    id: "PRD-023",
    sku: "COFFEE-BREVILLE-001",
    name: "Breville Barista Express",
    category: "Home",
    subcategory: "Kitchen Appliances",
    brand: "Breville",
    channels: [
      {
        name: "Amazon",
        status: "pending",
        reason: "Image updates pending approval",
        lastSync: "2024-01-14 16:00",
      },
      {
        name: "Williams Sonoma",
        status: "synced",
        reason: "Product listing active",
        lastSync: "2024-01-14 15:30",
      },
    ],
    lastModified: "2024-01-14",
    completeness: 88,
    status: "active",
  },
  {
    id: "PRD-024",
    sku: "MATTRESS-PURPLE-001",
    name: "Purple Hybrid Premier 4",
    category: "Home",
    subcategory: "Bedding",
    brand: "Purple",
    channels: [
      {
        name: "Amazon",
        status: "synced",
        reason: "All specifications current",
        lastSync: "2024-01-15 11:00",
      },
      {
        name: "Purple.com",
        status: "synced",
        reason: "Direct brand sync",
        lastSync: "2024-01-15 11:05",
      },
    ],
    lastModified: "2024-01-15",
    completeness: 92,
    status: "active",
  },
  {
    id: "PRD-025",
    sku: "BIKE-PELOTON-001",
    name: "Peloton Bike+",
    category: "Sports",
    subcategory: "Fitness Equipment",
    brand: "Peloton",
    channels: [
      {
        name: "Peloton.com",
        status: "synced",
        reason: "Direct sync active",
        lastSync: "2024-01-16 08:00",
      },
      {
        name: "Amazon",
        status: "failed",
        reason: "Delivery restrictions apply",
        lastSync: "2024-01-13 10:00",
      },
    ],
    lastModified: "2024-01-16",
    completeness: 76,
    status: "active",
  },
]

export const mockFieldMappingTemplates = [
  {
    id: "template-automotive-multiretailer",
    name: "Automotive Products - Multi-Retailer",
    category: "Automotive",
    categoryId: "automotive",
    description: "Complete field mapping for automotive products across all major retailers",
    createdAt: "2024-01-10",
    lastModified: "2024-01-20",
    retailers: ["amazon", "walmart", "target", "ebay"],
    mappings: {
      amazon: {
        title: 1, // Product Name
        brand: 3, // Brand
        description: 24, // Short Description
        price: 10, // Selling Price
        sku: 2, // SKU
        weight: 17, // Weight
        dimensions: 18, // Length
        color: 21, // Color
        material: 22, // Material
      },
      walmart: {
        title: 1, // Product Name
        brand: 3, // Brand
        shortDescription: 24, // Short Description
        longDescription: 25, // Long Description
        price: 10, // Selling Price
        sku: 2, // SKU
        weight: 17, // Weight
      },
      target: {
        productTitle: 1, // Product Name
        brandName: 3, // Brand
        description: 25, // Long Description
        sellingPrice: 10, // Selling Price
        itemNumber: 2, // SKU
        weightPounds: 17, // Weight
      },
      ebay: {
        title: 1, // Product Name
        brand: 3, // Brand
        description: 25, // Long Description
        price: 10, // Selling Price
        sku: 2, // SKU
        shippingWeight: 17, // Weight
      },
    },
  },
  {
    id: "template-electronics-multiretailer",
    name: "Electronics - Multi-Retailer",
    category: "Electronics",
    categoryId: "electronics",
    description: "Comprehensive field mapping for consumer electronics across major platforms",
    createdAt: "2024-01-12",
    lastModified: "2024-01-18",
    retailers: ["amazon", "target", "shopify", "ebay"],
    mappings: {
      amazon: {
        title: 1, // Product Name
        brand: 3, // Brand
        description: 24, // Short Description
        bulletPoints: 26, // Features
        price: 10, // Selling Price
        sku: 2, // SKU
        color: 21, // Color
      },
      target: {
        productTitle: 1, // Product Name
        brandName: 3, // Brand
        description: 25, // Long Description
        sellingPrice: 10, // Selling Price
        itemNumber: 2, // SKU
        productColor: 21, // Color
      },
      shopify: {
        title: 1, // Product Name
        vendor: 3, // Brand
        bodyHtml: 25, // Long Description
        price: 10, // Selling Price
        sku: 2, // SKU
        variantOption1: 21, // Color
      },
      ebay: {
        title: 1, // Product Name
        brand: 3, // Brand
        description: 25, // Long Description
        price: 10, // Selling Price
        sku: 2, // SKU
      },
    },
  },
  {
    id: "template-general-allretailers",
    name: "General Products - All Retailers",
    category: "General",
    categoryId: "general",
    description: "Universal field mapping template suitable for most product types across all retailers",
    createdAt: "2024-01-14",
    lastModified: "2024-01-19",
    retailers: ["amazon", "walmart", "target", "shopify", "ebay", "etsy"],
    mappings: {
      amazon: {
        title: 1, // Product Name
        brand: 3, // Brand
        description: 24, // Short Description
        price: 10, // Selling Price
        sku: 2, // SKU
      },
      walmart: {
        title: 1, // Product Name
        brand: 3, // Brand
        shortDescription: 24, // Short Description
        price: 10, // Selling Price
        sku: 2, // SKU
      },
      target: {
        productTitle: 1, // Product Name
        brandName: 3, // Brand
        description: 24, // Short Description
        sellingPrice: 10, // Selling Price
        itemNumber: 2, // SKU
      },
      shopify: {
        title: 1, // Product Name
        vendor: 3, // Brand
        bodyHtml: 25, // Long Description
        price: 10, // Selling Price
        sku: 2, // SKU
      },
      ebay: {
        title: 1, // Product Name
        brand: 3, // Brand
        description: 25, // Long Description
        price: 10, // Selling Price
        sku: 2, // SKU
      },
      etsy: {
        title: 1, // Product Name
        shopSectionId: 4, // Category
        description: 25, // Long Description
        price: 10, // Selling Price
        sku: 2, // SKU
      },
    },
  },
]
