import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    const rows = await sql`
  SELECT id, name, sku, price, image_url, category_id
  FROM products
  WHERE id = ${id} AND is_deleted = false
`;
    if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const r: any = rows[0];
    return NextResponse.json({
      id: r.id,
      name: r.name,
      sku: r.sku,
      price: Number(r.price),
      imageUrl: r.image_url,
      categoryId: r.category_id,
    });
  } catch (e) {
    console.error("GET /api/products/[id] error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    const body = await req.json();
    const name = (body.name || "").trim();
    const sku = (body.sku || "").trim();
    const priceRaw = body.price;
    const categoryId = (body.categoryId || "").trim();
    const imageUrl = (body.imageUrl || "").trim();

    if (!name || !sku || !priceRaw || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const price = Number(priceRaw);
    if (Number.isNaN(price) || price < 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    // ตรวจว่ามีสินค้านี้จริง
    const exists = await sql`SELECT id FROM products WHERE id = ${id}`;
    if (exists.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // ใช้ tagged template ป้องกัน result.rows undefined (Neon คืน array)
    const updated = await sql`
      UPDATE products
      SET name = ${name},
          sku = ${sku},
          price = ${price},
          category_id = ${categoryId},
          image_url = ${imageUrl || null}
      WHERE id = ${id}
      RETURNING id, name, sku, price, image_url, category_id
    `;
    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
    const row: any = updated[0];
    // Audit log (non-blocking)
    try {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        null;
      const ua = req.headers.get("user-agent") || null;
      await sql`
        CREATE TABLE IF NOT EXISTS product_logs (
          id bigserial PRIMARY KEY,
          product_id text NOT NULL,
          action text NOT NULL,
          payload jsonb,
          ip text,
          user_agent text,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `;
      const payload = { name, sku, price, categoryId, imageUrl };
      await sql`
        INSERT INTO product_logs (product_id, action, payload, ip, user_agent)
        VALUES (${String(row.id)}, ${"UPDATE"}, ${JSON.stringify(payload)}::jsonb, ${ip}, ${ua})
      `;
    } catch (logErr) {
      console.warn("product update log failed", logErr);
    }
    return NextResponse.json({
      id: row.id,
      name: row.name,
      sku: row.sku,
      price: Number(row.price),
      imageUrl: row.image_url,
      categoryId: row.category_id,
    });
  } catch (e: any) {
    if (e.message?.includes("duplicate")) {
      return NextResponse.json({ error: "SKU or name already exists" }, { status: 409 });
    }
    console.error("PUT /api/products/[id] error", e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    const del = await sql`
      UPDATE products SET is_deleted = true WHERE id = ${id} AND is_deleted = false RETURNING id
    `;
    if (del.length === 0)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}