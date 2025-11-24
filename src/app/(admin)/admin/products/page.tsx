import Link from "next/link";
import { sql } from "@/lib/db";
import ProductTable from "@/components/admin/ProductTable";

interface AdminProductRow {
  id: string;
  name: string;
  sku: string;
  price: any;
  category_name: string | null;
}

export default async function AdminProductsPage() {
  let products: AdminProductRow[] = [];
  try {
    const rows = await sql`
      SELECT p.id, p.name, p.sku, p.price, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY p.name
      LIMIT 300
    `;
    products = rows as AdminProductRow[];
  } catch (e) {
    console.error("AdminProductsPage query error", e);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary mb-2">สินค้า</h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-base font-semibold shadow hover:bg-primary/90 transition"
        >
          + เพิ่มสินค้า
        </Link>
      </div>
      <ProductTable products={products} />
    </div>
  );
}
