import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const q = (searchParams.get("q") || "").trim().toLowerCase();
    const page = Math.max(
      1,
      parseInt(searchParams.get("page") || "1", 10) || 1
    );
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20)
    );
    const offset = (page - 1) * pageSize;

    let where = sql``;
    if (categoryId) where = sql`${where} AND category_id = ${categoryId}`;
    if (q) where = sql`${where} AND lower(name) LIKE ${"%" + q + "%"}`;

    const countRows = await sql`
  SELECT COUNT(*)::int AS count
  FROM products
  WHERE is_deleted = false ${where}
`;
    const total = countRows[0]?.count ?? 0;

   const rows = await sql`
  SELECT id, name, sku, price, image_url AS "imageUrl", category_id AS "categoryId"
  FROM products
  WHERE is_deleted = false ${where}
  ORDER BY name ASC
  LIMIT ${pageSize} OFFSET ${offset}
`;
    const items = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      sku: r.sku,
      price: Number(r.price),
      imageUrl: r.imageUrl ?? r.image_url ?? null,
      categoryId: r.categoryId ?? r.category_id,
    }));

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      hasMore: offset + items.length < total,
    });
  } catch (err) {
    console.error("GET /api/products failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = (body.name || "").trim();
    const sku = (body.sku || "").trim();
    const priceRaw = body.price;
    const categoryId = (body.categoryId || "").trim();
    const imageUrl = (body.imageUrl || "").trim();

    if (!name || !sku || !priceRaw || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const price = Number(priceRaw);
    if (Number.isNaN(price) || price < 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    // Use tagged template (Neon returns array directly)
    const inserted = await sql`
      INSERT INTO products (name, sku, price, category_id, image_url)
      VALUES (${name}, ${sku}, ${price}, ${categoryId}, ${imageUrl || null})
      RETURNING id, name, sku, price, image_url, category_id
    `;
    if (!inserted || inserted.length === 0) {
      return NextResponse.json({ error: "Insert failed" }, { status: 500 });
    }
    const row: any = inserted[0];
    // Audit log (non-blocking): create table if needed and insert log
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
        VALUES (${String(row.id)}, ${"CREATE"}, ${JSON.stringify(payload)}::jsonb, ${ip}, ${ua})
      `;
    } catch (logErr) {
      console.warn("product create log failed", logErr);
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
      return NextResponse.json({ error: "SKU or name exists" }, { status: 409 });
    }
    console.error("POST /api/products error", e);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
