export default function AdminCustomersPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <button className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm">New Customer</button>
      </div>
      <div className="rounded-lg border p-4 text-sm text-neutral-500">
        No customers yet (demo).
      </div>
    </div>
  );
}
