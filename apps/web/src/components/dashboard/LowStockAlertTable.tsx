import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ProductDto } from "@vanta/shared";

interface LowStockAlertTableProps {
  products: ProductDto[];
}

export const LowStockAlertTable: React.FC<LowStockAlertTableProps> = ({ products }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-zinc-900 tracking-tight">Low Stock Alert</h2>
        <Link
          to="/products?lowStock=true"
          className="text-xs font-semibold px-3 py-1 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-zinc-500 font-semibold border-b border-zinc-100">
              <th className="pb-3 pr-4">Product</th>
              <th className="pb-3 pr-4">SKU</th>
              <th className="pb-3 pr-4 text-center">Current Stock</th>
              <th className="pb-3 text-right">Min. Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {products.map((p) => (
              <tr
                key={p.id}
                onClick={() => navigate(`/products/${p.id}`)}
                className="hover:bg-zinc-50/80 cursor-pointer transition-colors"
              >
                <td className="py-3.5 pr-4 font-medium text-zinc-800 truncate max-w-[150px]">
                  {p.productName}
                </td>
                <td className="py-3.5 pr-4 font-mono text-zinc-500">{p.sku}</td>
                <td className="py-3.5 pr-4 text-center font-bold text-red-500">
                  {p.currentStock}
                </td>
                <td className="py-3.5 text-right font-medium text-zinc-600">
                  {p.minimumStock}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
