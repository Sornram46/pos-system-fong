import { categories } from "@/data/categories";

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <button className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm">New Category</button>
      </div>
      <div className="rounded-lg border divide-y">
        {categories.map((c) => (
          <div key={c.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-neutral-500">{c.id}</div>
            </div>
            <button className="px-2 py-1 text-sm">Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
}
