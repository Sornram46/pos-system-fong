"use client";
import { useEffect, useState, useRef } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import PayModal from "@/components/PayModal";
import ReceiptModal from "@/components/ReceiptModal";
import Cart, { type CartItem } from "@/components/Cart";

type Category = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  imageUrl: string | null;
  categoryId: string;
};
type ProductListResponse = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export default function POSPage() {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [query, setQuery] = useState("");
  const [cats, setCats] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [showPay, setShowPay] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState<CartItem[]>([]);
  const [lastCash, setLastCash] = useState<number>(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // cart localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pos-cart");
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("pos-cart", JSON.stringify(items));
    } catch {}
  }, [items]);

  // load categories
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        if (!res.ok) throw new Error("Categories fetch failed");
        const data = (await res.json()) as Category[];
        setCats(data);
      } catch (e) {
        setErrMsg("โหลดหมวดหมู่ล้มเหลว");
      }
    })();
  }, []);

  // reset page when category/search changes
  useEffect(() => {
    setPage(1);
  }, [selectedCat, query]);

  // fetch products
  useEffect(() => {
    // debounce query input
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const controller = new AbortController();
      setLoading(true);
      setErrMsg(null);
      const q = query.trim();
      const params = new URLSearchParams();
      if (selectedCat) params.set("categoryId", selectedCat);
      if (q) params.set("q", q);
      params.set("page", String(page));
      params.set("limit", String(pageSize));

      fetch(`/api/products?${params.toString()}`, {
        signal: controller.signal,
        cache: "no-store",
      })
        .then(async (r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return (await r.json()) as ProductListResponse;
        })
        .then((data) => {
          if (!data || !Array.isArray(data.items)) {
            throw new Error("Invalid data shape");
          }
          setProducts(data.items);
          setTotal(data.total);
          setHasMore(data.hasMore);
        })
        .catch((err: any) => {
          if (err.name !== "AbortError") {
            console.error("fetch products failed", err);
            setErrMsg("โหลดสินค้าล้มเหลว");
            setProducts([]);
            setTotal(0);
            setHasMore(false);
          }
        })
        .finally(() => setLoading(false));

      return () => controller.abort();
    }, 180);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [selectedCat, query, page]);

  // cart ops
  const addToCart = (p: Product) =>
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === p.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
  const inc = (id: string) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i))
    );
  const dec = (id: string) =>
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i
      )
    );
  const remove = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);

  // เมื่อกด Checkout
  const checkout = () => {
    setShowPay(true);
  };

  // เมื่อยืนยันรับเงิน
  const handlePayConfirm = (cash: number) => {
    setLastOrder(items);
    setLastCash(cash);
    setItems([]);
    setShowPay(false);
    setShowReceipt(true);
  };

  const from = (page - 1) * pageSize + (products.length ? 1 : 0);
  const to = (page - 1) * pageSize + products.length;

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-blue-50 via-white to-pink-50 dark:from-neutral-900 dark:to-neutral-950">
      <Header />
      <main className="mx-auto max-w-7xl w-full p-4 flex gap-6">
        <section className="flex-1 min-w-0">
          <div className="mb-4 space-y-4">
            <div className="flex items-center gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาสินค้า"
                className="flex-1 px-4 py-2 rounded-lg border border-primary/30 shadow focus:ring-2 focus:ring-primary/30 transition"
              />
            </div>
            <div
              role="tablist"
              aria-label="หมวดหมู่สินค้า"
              className="overflow-x-auto border-b"
            >
              <div className="flex items-center gap-2 whitespace-nowrap">
                <button
                  role="tab"
                  aria-selected={selectedCat === null}
                  onClick={() => setSelectedCat(null)}
                  className={`px-4 py-2 -mb-[1px] border-b-2 rounded-t-lg transition font-medium ${
                    selectedCat === null
                      ? "border-primary text-primary bg-primary/10"
                      : "border-transparent hover:border-primary/50 text-neutral-600"
                  }`}
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
                      className={`px-4 py-2 -mb-[1px] border-b-2 rounded-t-lg transition font-medium ${
                        active
                          ? "border-primary text-primary bg-primary/10"
                          : "border-transparent hover:border-primary/50 text-neutral-600"
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {errMsg && (
            <div className="mb-2 text-sm text-red-600 bg-red-50 rounded px-3 py-2 shadow">
              {errMsg}
            </div>
          )}

          {loading && (
            <div className="mb-2 text-xs text-neutral-500">กำลังโหลดสินค้า...</div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} />
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 pt-4">
            <div className="text-xs text-neutral-500">
              {total > 0
                ? `Showing ${from}-${to} of ${total}`
                : loading
                ? "Loading..."
                : "No products"}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-4 py-1 rounded-lg border border-primary/30 bg-white hover:bg-primary/10 transition disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Prev
              </button>
              <span className="text-sm font-medium">Page {page}</span>
              <button
                className="px-4 py-1 rounded-lg border border-primary/30 bg-primary text-primary-foreground hover:bg-primary/80 transition disabled:opacity-50"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore || loading}
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <aside className="w-full md:w-96 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <Cart
            items={items}
            onInc={inc}
            onDec={dec}
            onRemove={remove}
            onClear={clear}
            onCheckout={checkout}
          />
        </aside>
      </main>
      <PayModal
        open={showPay}
        total={items.reduce((s, it) => s + it.price * it.qty, 0)}
        onConfirm={handlePayConfirm}
        onClose={() => setShowPay(false)}
      />
      <ReceiptModal
        open={showReceipt}
        onClose={() => setShowReceipt(false)}
        items={lastOrder}
        cash={lastCash}
      />
    </div>
  );
}
