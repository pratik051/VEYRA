import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ProductRequestModel } from "@/lib/models/product-request-model";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { getSessionUserByToken } from "@/lib/auth/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await connectToDatabase();
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  const sessionUser = token ? await getSessionUserByToken(token) : null;
  if (!sessionUser || sessionUser.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? undefined;
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 25)));

  const filter: any = {};
  if (status) filter.status = status;

  const total = await ProductRequestModel.countDocuments(filter);
  const items = await ProductRequestModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();

  return NextResponse.json({ total, page, limit, items });
}
