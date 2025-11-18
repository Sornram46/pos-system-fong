export type Product = {
  id: string;
  name: string;
  price: number;
  sku: string;
  categoryId: string;
  imageUrl?: string;
};

export const products: Product[] = [
  { id: "p-1", name: "Americano", price: 65, sku: "AMR-001", categoryId: "drinks" },
  { id: "p-2", name: "Latte", price: 75, sku: "LAT-001", categoryId: "drinks" },
  { id: "p-3", name: "Cappuccino", price: 80, sku: "CAP-001", categoryId: "drinks" },
  { id: "p-4", name: "Thai Tea", price: 60, sku: "THT-001", categoryId: "drinks" },
  { id: "p-5", name: "Fried Rice", price: 95, sku: "FRD-001", categoryId: "food" },
  { id: "p-6", name: "Pad Thai", price: 105, sku: "PDT-001", categoryId: "food" },
  { id: "p-7", name: "Mango Sticky Rice", price: 85, sku: "MSR-001", categoryId: "dessert" },
  { id: "p-8", name: "Brownie", price: 55, sku: "BRW-001", categoryId: "dessert" },
  { id: "p-9", name: "Bottle Water", price: 20, sku: "BTW-001", categoryId: "other" },
];
