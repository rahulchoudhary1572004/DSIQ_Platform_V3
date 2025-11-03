import React from "react";

const dummyUnlistedProducts = [
  {
    id: 101,
    name: "Classic Mild Salsa",
    sku: "SALSA-004",
    readiness: "42%",
    brand: "Puma",
    productType: "SWEATSHIRT",
    vendorCode: "Puma-1",
    language: "English (United States)",
    marketplace: "United States (amazon.com)",
  },
  {
    id: 102,
    name: " Spicy Jalapeno Salsa",
    sku: "SALSA-005",
    readiness: "47%",
    brand: "Puma",
    productType: "SWEATSHIRT",
    vendorCode: "Puma-1",
    language: "English (United States)",
    marketplace: "United States (amazon.com)",
  },
];

const retailerFields = [
  { key: "brand", label: "Brand" },
  { key: "productType", label: "Product Type" },
  { key: "vendorCode", label: "Vendor Code" },
  { key: "language", label: "Language" },
  { key: "marketplace", label: "Marketplace" },
  { key: "sku", label: "SKU" },
];

const ReadinessTab = ({ channelName }) => (
  <div>
    <h2 className="text-lg font-semibold mb-2">Readiness for {channelName}</h2>
    <table className="min-w-full border">
      <thead>
        <tr>
          <th className="border px-2 py-1">Product Name</th>
          <th className="border px-2 py-1">Readiness</th>
          {retailerFields.map((field) => (
            <th className="border px-2 py-1" key={field.key}>
              {field.label}
              <button className="ml-2 px-1 py-0.5 text-xs bg-blue-100 rounded hover:bg-blue-200">
                Map
              </button>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {dummyUnlistedProducts.map((product) => (
          <tr key={product.id}>
            <td className="border px-2 py-1">{product.name}</td>
            <td className="border px-2 py-1">{product.readiness}</td>
            {retailerFields.map((field) => (
              <td className="border px-2 py-1" key={field.key}>
                {product[field.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Publish to {channelName}
    </button>
  </div>
);

export default ReadinessTab;