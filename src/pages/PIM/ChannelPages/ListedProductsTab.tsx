import React from "react";

const dummyListedProducts = [
  { id: 1, name: "Salsa", sku: "SALSA-001", status: "Active", lastSynced: "2024-06-01" },
  { id: 2, name: "Roasted Garlic", sku: "SALSA-002", status: "Active", lastSynced: "2024-06-02" },
  { id: 3, name: "Mango Habanero", sku: "SALSA-003", status: "Inactive", lastSynced: "2024-05-28" },
];

const ListedProductsTab = ({ channelName }) => (
  <div>
    <h2 className="text-lg font-semibold mb-2">Listed Products for {channelName}</h2>
    <table className="min-w-full border">
      <thead>
        <tr>
          <th className="border px-2 py-1">Product Name</th>
          <th className="border px-2 py-1">SKU</th>
          <th className="border px-2 py-1">Status</th>
          <th className="border px-2 py-1">Last Synced</th>
        </tr>
      </thead>
      <tbody>
        {dummyListedProducts.map((product) => (
          <tr key={product.id}>
            <td className="border px-2 py-1">{product.name}</td>
            <td className="border px-2 py-1">{product.sku}</td>
            <td className="border px-2 py-1">{product.status}</td>
            <td className="border px-2 py-1">{product.lastSynced}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ListedProductsTab; 