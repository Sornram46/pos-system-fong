import { demoOrders } from "@/data/orders";

export default function AdminReportsPage() {
  const total = demoOrders.reduce((s, o) => s + o.total, 0);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-neutral-500">Sales (Demo)</div>
          <div className="text-3xl font-bold">฿ {total.toFixed(2)}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-neutral-500">Orders</div>
          <div className="text-3xl font-bold">{demoOrders.length}</div>
        </div>
      </div>
    </div>
  );
}
