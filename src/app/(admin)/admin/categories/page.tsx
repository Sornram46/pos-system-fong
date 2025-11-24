import Link from "next/link";
import { sql } from "@/lib/db";

interface AdminCategoryRow {
  id: string;
  name: string;
}

export default async function AdminCategoriesPage() {
  let categories: AdminCategoryRow[] = [];
  try {
    const rows = await sql`SELECT id, name FROM categories ORDER BY name`;
    categories = rows as AdminCategoryRow[];
  } catch (e) {
    console.error("AdminCategoriesPage query error", e);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary mb-2">หมวดหมู่สินค้า</h1>
        <Link
          href="/admin/categories/new"
          className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-base font-semibold shadow hover:bg-primary/90 transition"
        >
          + เพิ่มหมวดหมู่
        </Link>
      </div>
      <div className="rounded-xl shadow-lg border border-neutral-200 bg-white dark:bg-neutral-900 divide-y">
        {categories.length === 0 ? (
          <div className="p-6 text-center text-neutral-400">ไม่พบหมวดหมู่</div>
        ) : (
          categories.map((c, i) => (
            <div
              key={c.id}
              className={`flex items-center justify-between p-4 transition hover:bg-primary/5 ${
                i % 2 === 0
                  ? "bg-neutral-50 dark:bg-neutral-800"
                  : "bg-white dark:bg-neutral-900"
              }`}
            >
              <div>
                <div className="font-medium text-lg">{c.name}</div>
                <div className="text-xs text-neutral-500">{c.id}</div>
              </div>
              <Link
                href={`/admin/categories/${c.id}`}
                className="px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm font-medium transition"
              >
                แก้ไข
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
