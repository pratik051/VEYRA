import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { IndiaOrderModel } from "@/lib/models/india-order-model";
import { getSessionUserByToken } from "@/lib/auth/store";
import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;
  const user = token ? await getSessionUserByToken(token) : null;
  return user && user.role === "admin";
}

export async function GET(req: Request) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized admin access." }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const orders = await IndiaOrderModel.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, orders });
  } catch (error: unknown) {
    // Memory fallback
    const memList = global.__sajilomarts_mem_india_orders
      ? Array.from(global.__sajilomarts_mem_india_orders.values()).reverse()
      : [];
    return NextResponse.json({ success: true, orders: memList });
  }
}
