"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export interface CategoryOption {
  id: string;
  name: string;
}

export interface ProductInput {
  id?: string;
  name: string;
  sku: string;
  price: number | string;
  categoryId: string | null;
  imageUrl?: string | null;
  isCombo?: boolean;
}

export default function ProductForm({
  mode,
  categories,
  initial,
}: {
  mode: "create" | "edit";
  categories: CategoryOption[];
  initial?: ProductInput;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductInput>(
    initial ?? { name: "", sku: "", price: "", categoryId: null, imageUrl: "", isCombo: false }
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl || null);

  const onChange = (field: keyof ProductInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = field === "isCombo" ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value } as ProductInput));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        price: Number(form.price),
        categoryId: form.categoryId || null,
        imageUrl: form.imageUrl || null,
        isCombo: !!form.isCombo,
      };
      const res = await fetch(
        mode === "create" ? "/api/products" : `/api/products/${initial?.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed: ${res.status}`);
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", f);
    const r = await fetch("/api/upload", { method: "POST", body: formData });
    const j = await r.json();
    if (r.ok && j.url) {
      setImageUrl(j.url);
      setForm((prev) => ({ ...prev, imageUrl: j.url }));
    } else {
      alert(j.error || "Upload failed");
    }
    setUploading(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm mb-1">Name</label>
        <input
          className="w-full rounded-md border px-3 py-2 bg-transparent"
          value={form.name}
          onChange={onChange("name")}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">SKU</label>
          <input
            className="w-full rounded-md border px-3 py-2 bg-transparent"
            value={form.sku}
            onChange={onChange("sku")}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Price</label>
          <input
            type="number"
            step="0.01"
            className="w-full rounded-md border px-3 py-2 bg-transparent"
            value={form.price as any}
            onChange={onChange("price")}
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">Category</label>
        <select
          className="w-full rounded-md border px-3 py-2 bg-transparent"
          value={form.categoryId ?? ""}
          onChange={onChange("categoryId")}
        >
          <option value="">- None -</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Image</label>
        <input type="file" accept="image/*" onChange={handleFile} />
        {uploading && <div className="text-xs text-neutral-500">Uploading...</div>}
        {imageUrl && (
          <img
            src={imageUrl}
            alt="preview"
            className="mt-2 h-24 w-24 object-cover rounded border"
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <input id="isCombo" type="checkbox" checked={!!form.isCombo} onChange={onChange("isCombo") as any} />
        <label htmlFor="isCombo">Is Combo</label>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm"
        >
          {submitting ? "Saving..." : mode === "create" ? "Create" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border px-3 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
