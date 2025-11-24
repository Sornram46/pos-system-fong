import ProductForm, { type CategoryOption, type ProductInput } from "@/components/admin/ProductForm";
import { sql } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const rows = await sql`SELECT id, name FROM categories ORDER BY name`;
  const categories = rows as CategoryOption[];

  const prodRows: any[] = await sql`
    SELECT id, name, sku, price, image_url AS "imageUrl", category_id AS "categoryId", is_combo AS "isCombo"
    FROM products WHERE id = ${id}
  `;
  if (!prodRows || prodRows.length === 0) return notFound();
  const r = prodRows[0];

  const initial: ProductInput = {
    id: r.id,
    name: r.name,
    sku: r.sku,
    price: Number(r.price),
    imageUrl: r.imageUrl ?? null,
    categoryId: r.categoryId ?? null,
    isCombo: !!(r.isCombo ?? r.is_combo),
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-2">
        <div className="rounded-full bg-primary/10 p-3">
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <path d="M5 21h14M12 17v4M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="#2563eb" strokeWidth={1.5} />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primary">แก้ไขสินค้า</h1>
          <div className="text-neutral-500 text-sm">ปรับข้อมูลสินค้าให้ถูกต้อง แล้วกดบันทึก</div>
        </div>
      </div>
      <div className="rounded-xl shadow-lg border border-neutral-200 bg-white dark:bg-neutral-900 p-6">
        <ProductForm mode="edit" categories={categories} initial={initial} />
      </div>
    </div>
  );
}
