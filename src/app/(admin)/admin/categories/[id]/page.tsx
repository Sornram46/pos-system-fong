import CategoryForm from "@/components/admin/CategoryForm";
import { sql } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function EditCategoryPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const rows: any[] = await sql`SELECT id, name FROM categories WHERE id = ${id}`;
  if (!rows || rows.length === 0) return notFound();
  const r = rows[0];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Category</h1>
      <CategoryForm mode="edit" initial={{ id: r.id, name: r.name }} />
    </div>
  );
}
