import type { Product } from "@/data/products";

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
};

export type Order = {
  id: string;
  number: string;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "paid" | "refunded" | "void";
};

export const demoOrders: Order[] = [
  {
    id: "o-1001",
    number: "#1001",
    createdAt: new Date().toISOString(),
    items: [
      { productId: "p-1", name: "Americano", price: 65, qty: 1 },
      { productId: "p-5", name: "Fried Rice", price: 95, qty: 1 },
    ],
    subtotal: 160,
    tax: 0,
    total: 160,
    status: "paid",
  },
];
