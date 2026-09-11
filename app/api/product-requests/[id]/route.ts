import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ProductRequestModel } from "@/lib/models/product-request-model";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { getSessionUserByToken } from "@/lib/auth/store";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const doc = await ProductRequestModel.findOne({ requestId: params.id }).lean();
  if (!doc) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  const sessionUser = token ? await getSessionUserByToken(token) : null;

  // Allow owner or admin
  if (!sessionUser || (sessionUser.role !== "admin" && (sessionUser.email !== (doc as any).email))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  return NextResponse.json({ request: doc });
}
