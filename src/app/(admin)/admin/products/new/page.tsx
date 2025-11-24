import ProductForm, { type CategoryOption } from "@/components/admin/ProductForm";
import { sql } from "@/lib/db";

export default async function NewProductPage() {
  const rows = await sql`SELECT id, name FROM categories ORDER BY name`;
  const categories = rows as CategoryOption[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New Product</h1>
      <ProductForm mode="create" categories={categories} />
    </div>
  );
}
