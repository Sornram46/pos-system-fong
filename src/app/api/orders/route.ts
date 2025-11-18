import { demoOrders } from "@/data/orders";

export async function GET() {
  return Response.json(demoOrders);
}
