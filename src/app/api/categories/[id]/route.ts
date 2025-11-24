import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET single (optional)
export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    const rows = await sql`SELECT id, name FROM categories WHERE id = ${id}`;
    if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("GET /api/categories/[id] failed:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    const body = await req.json();
    const name: string = (body.name || "").trim();
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

    const rows: any[] = await sql`
      UPDATE categories
      SET name = ${name}
      WHERE id = ${id}
      RETURNING id, name
    `;
    if (rows.length === 0)
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err: any) {
    if (err.message?.includes("duplicate")) {
      return NextResponse.json({ error: "Name already exists" }, { status: 409 });
    }
    console.error("PUT /api/categories/[id] failed:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    // ตรวจว่ามีสินค้าผูกอยู่ไหม
    const countRows = await sql`
      SELECT COUNT(*)::int AS cnt FROM products WHERE category_id = ${id}
    `;
    if ((countRows[0]?.cnt ?? 0) > 0) {
      return NextResponse.json(
        { error: "Category has products; remove or reassign them first" },
        { status: 409 }
      );
    }
    const rows = await sql`DELETE FROM categories WHERE id = ${id} RETURNING id`;
    if (rows.length === 0)
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/categories/[id] failed:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
