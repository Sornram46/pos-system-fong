import { demoOrders } from "@/data/orders";

export default function AdminDashboardPage() {
  const totalSales = demoOrders.reduce((s, o) => s + o.total, 0);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-neutral-500">Total Sales</div>
          <div className="text-2xl font-bold">฿ {totalSales.toFixed(2)}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-neutral-500">Orders</div>
          <div className="text-2xl font-bold">{demoOrders.length}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-neutral-500">Avg Order</div>
          <div className="text-2xl font-bold">฿ {(totalSales / demoOrders.length).toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
