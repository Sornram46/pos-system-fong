import { sql } from "@/lib/db";

// GET: list recent orders (switch from mock to DB)
export async function GET() {
  try {
    const rows = await sql`
      SELECT
        o.id,
        o.number ${""},
        o.created_at,
        o.status,
        COALESCE(SUM(oi.price * oi.qty), 0) AS total
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 100
    `;
    return Response.json({ items: rows });
  } catch (e) {
    console.error("GET /api/orders error", e);
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

interface IncomingItem {
  id: string; // product id
  qty: number;
  price?: number; // optional, will fallback to product price
}

// POST: create new order from cart items
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items: IncomingItem[] = Array.isArray(body.items) ? body.items : [];
    if (!items.length) {
      return Response.json({ error: "No items" }, { status: 400 });
    }

    // Fetch product prices if not provided (snapshot price at time of order)
    const productIds = items.filter(i => !i.price).map(i => i.id);
    let priceMap: Record<string, number> = {};
    if (productIds.length) {
      // Use ANY(array) for safer parameterization
      const priceRows = await sql`
        SELECT id, price FROM products WHERE id = ANY(${productIds})
      `;
      for (const r of priceRows as any[]) priceMap[r.id] = Number(r.price);
    }

    const enriched = items.map(i => ({
      product_id: i.id,
      qty: i.qty,
      price: Number(i.price ?? priceMap[i.id] ?? 0)
    })).filter(i => i.qty > 0 && i.price >= 0);
    if (!enriched.length) {
      return Response.json({ error: "Invalid items" }, { status: 400 });
    }

    // Generate order number (simple unique stamp)
    const orderNumber = `ORD-${Date.now()}`;
    let status = (body.status || 'paid').toString().trim().toLowerCase();
    const allowedStatus = new Set(['paid','refunded','void']);
    if (!allowedStatus.has(status)) status = 'paid';

    // Compute monetary fields (basic: no tax rules yet)
    const subtotal = enriched.reduce((s, i) => s + i.price * i.qty, 0);
    const taxRaw = body.tax;
    let tax = Number(taxRaw);
    if (Number.isNaN(tax) || tax < 0) tax = 0;
    const total = subtotal + tax;

    // Insert order (schema requires subtotal, tax, total)
    const insertedOrder = await sql`
      INSERT INTO orders (number, status, subtotal, tax, total)
      VALUES (${orderNumber}, ${status}, ${subtotal}, ${tax}, ${total})
      RETURNING id, number, created_at, status, subtotal, tax, total
    `;
    if (!insertedOrder.length) {
      return Response.json({ error: "Create failed" }, { status: 500 });
    }
    const order = insertedOrder[0] as any;
    const orderId = order.id as string;

    // Insert items (batch)
    for (const it of enriched) {
      await sql`
        INSERT INTO order_items (order_id, product_id, price, qty)
        VALUES (${orderId}, ${it.product_id}, ${it.price}, ${it.qty})
      `;
    }

    return Response.json({
      id: orderId,
      number: order.number,
      created_at: order.created_at,
      status: order.status,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      total: Number(order.total),
      items: enriched
    }, { status: 201 });
  } catch (e) {
    console.error("POST /api/orders error", e);
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }
}
