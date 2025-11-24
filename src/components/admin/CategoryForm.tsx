"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export interface CategoryInput {
  id?: string;
  name: string;
}

export default function CategoryForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: CategoryInput;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(mode === "create" ? "/api/categories" : `/api/categories/${initial?.id}` , {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed: ${res.status}`);
      }
      router.push("/admin/categories");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!initial?.id) return;
    if (!confirm("Delete this category?")) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/categories/${initial.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Delete failed: ${res.status}`);
      }
      router.push("/admin/categories");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm mb-1">Name</label>
        <input
          className="w-full rounded-md border px-3 py-2 bg-transparent"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
          onClick={() => history.back()}
          className="rounded-md border px-3 py-2 text-sm"
        >
          Cancel
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="rounded-md bg-red-600 text-white px-3 py-2 text-sm"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
    </form>
  );
}
