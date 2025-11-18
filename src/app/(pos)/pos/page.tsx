"use client";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import Cart, { type CartItem } from "@/components/Cart";

type Category = { id: string; name: string };
type Product = { id: string; name: string; price: number; sku: string; categoryId: string; imageUrl?: string };

export default function POSPage() {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("pos-cart");
    if (saved) setItems(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem("pos-cart", JSON.stringify(items));
  }, [items]);

  const [cats, setCats] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // load categories once
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = (await res.json()) as Category[];
      setCats(data);
    })();
  }, []);

  // fetch products when filters change (debounced by typing)
  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      const sp = new URLSearchParams();
      if (selectedCat) sp.set("categoryId", selectedCat);
      if (query) sp.set("q", query);
      const url = "/api/products" + (sp.toString() ? `?${sp.toString()}` : "");
      const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
      if (!res.ok) return;
      const data = (await res.json()) as Product[];
      setProducts(data);
    }, 200);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [selectedCat, query]);

  const addToCart = (p: Product) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === p.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
  };

  const inc = (id: string) => setItems((prev) => prev.map((i) => i.id === id ? { ...i, qty: i.qty + 1 } : i));
  const dec = (id: string) => setItems((prev) => prev.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i));
  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);
  const checkout = () => {
    alert("Checkout complete (demo)");
    setItems([]);
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="mx-auto max-w-7xl w-full p-4 flex gap-4">
        <section className="flex-1 min-w-0">
          <div className="mb-3 space-y-3">
            <div className="flex items-center gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาสินค้า"
                className="flex-1 px-3 py-2 rounded-md border"
              />
            </div>
            <div role="tablist" aria-label="หมวดหมู่สินค้า" className="overflow-x-auto border-b">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <button
                  role="tab"
                  aria-selected={selectedCat === null}
                  onClick={() => setSelectedCat(null)}
                  className={`px-3 py-2 -mb-[1px] border-b-2 ${selectedCat === null ? "border-primary text-primary font-medium" : "border-transparent hover:border-primary/50"}`}
                >
                  ทั้งหมด
                </button>
                {cats.map((c) => {
                  const active = selectedCat === c.id;
                  return (
                    <button
                      key={c.id}
                      role="tab"
                      aria-selected={active}
                      onClick={() => setSelectedCat(c.id)}
                      className={`px-3 py-2 -mb-[1px] border-b-2 ${active ? "border-primary text-primary font-medium" : "border-transparent hover:border-primary/50"}`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} />
            ))}
          </div>
        </section>

        <aside className="w-full md:w-96 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <Cart items={items} onInc={inc} onDec={dec} onRemove={remove} onClear={clear} onCheckout={checkout} />
        </aside>
      </main>
    </div>
  );
}
