import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const { data, error } = await guard.admin.from("messages").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "تعذر جلب الرسائل" }, { status: 500 });
  return NextResponse.json({ messages: data });
}
