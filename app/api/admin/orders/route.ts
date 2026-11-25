import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const { data, error } = await guard.admin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return NextResponse.json({ error: "تعذر جلب الطلبات" }, { status: 500 });
  return NextResponse.json({ orders: data });
}
