import { products } from "@/data/products";

export default function AdminProductsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <button className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm">New Product</button>
      </div>
      <div className="overflow-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">SKU</th>
              <th className="text-right p-2">Price</th>
              <th className="text-left p-2">Category</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.sku}</td>
                <td className="p-2 text-right">฿ {p.price.toFixed(2)}</td>
                <td className="p-2">{p.categoryId}</td>
                <td className="p-2 text-center">
                  <button className="px-2 py-1 text-sm">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
