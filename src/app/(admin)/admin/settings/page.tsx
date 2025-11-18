export default function AdminSettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="rounded-lg border p-4 space-y-3">
        <div>
          <label className="block text-sm mb-1">Store Name</label>
          <input className="w-full px-3 py-2 rounded-md border" placeholder="My Cafe" />
        </div>
        <div>
          <label className="block text-sm mb-1">Currency</label>
          <input className="w-full px-3 py-2 rounded-md border" defaultValue="THB" />
        </div>
        <div>
          <button className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm">Save</button>
        </div>
      </div>
    </div>
  );
}
