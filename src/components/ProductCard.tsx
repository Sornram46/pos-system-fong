"use client";
import type { Product } from "@/data/products";

export default function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  return (
    <button
      onClick={() => onAdd(product)}
      className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 text-left hover:shadow-sm transition"
    >
      <div className="aspect-video w-full rounded-md bg-neutral-100 dark:bg-neutral-900 mb-2" />
      <div className="font-medium">{product.name}</div>
      <div className="text-sm text-neutral-600 dark:text-neutral-400">{product.sku}</div>
      <div className="mt-1 font-semibold">฿ {product.price.toFixed(2)}</div>
    </button>
  );
}
