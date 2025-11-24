"use client";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    sku: string;
    price: number;
    imageUrl?: string | null;
    categoryId?: string;
  };
  onAdd?: (p: ProductCardProps["product"]) => void;
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <button
      type="button"
      onClick={() => onAdd?.(product)}
      className="p-3 rounded-md border text-left hover:border-primary/60 transition"
    >
      {product.imageUrl ? (
        // Use native img to avoid layout shift; next/image optional
        <img
          src={product.imageUrl}
          alt={product.name}
          className="aspect-video w-full rounded-md object-cover mb-2 bg-neutral-100 dark:bg-neutral-900"
          loading="lazy"
        />
      ) : (
        <div className="aspect-video w-full rounded-md bg-neutral-100 dark:bg-neutral-900 mb-2" />
      )}
      <div className="font-medium">{product.name}</div>
      <div className="text-sm text-neutral-600 dark:text-neutral-400">
        {product.sku}
      </div>
      <div className="mt-1 font-semibold">฿ {product.price.toFixed(2)}</div>
    </button>
  );
}
