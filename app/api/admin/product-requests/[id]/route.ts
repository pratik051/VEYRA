import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ProductRequestModel } from "@/lib/models/product-request-model";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { getSessionUserByToken } from "@/lib/auth/store";
import { validateAndBuildQuote } from "@/lib/admin/quote-utils";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  const sessionUser = token ? await getSessionUserByToken(token) : null;
  if (!sessionUser || sessionUser.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const allowedStatuses = ["pending_review","verifying","available","unavailable","manual_required","quoted","cancelled"];
  const updates: any = {};
  if (body.status) {
    if (!allowedStatuses.includes(body.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    updates.status = body.status;
  }
  if (typeof body.adminNotes === "string") updates.adminNotes = body.adminNotes;

  // Validate quote server-side when provided
  if (body.quote && typeof body.quote === "object") {
    const { valid, errors, quote } = validateAndBuildQuote(body.quote);
    if (!valid) {
      return NextResponse.json({ error: "Invalid quote payload.", details: errors }, { status: 400 });
    }
    updates.quote = quote;
  }

  const updated = await ProductRequestModel.findOneAndUpdate({ requestId: params.id }, { $set: updates }, { new: true }).lean();
  if (!updated) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json({ request: updated });
}
