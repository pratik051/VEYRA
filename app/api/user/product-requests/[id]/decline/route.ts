import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ProductRequestModel } from "@/lib/models/product-request-model";
import { getSessionUserByToken } from "@/lib/auth/store";
import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export const dynamic = "force-dynamic";

/**
 * POST /api/user/product-requests/[id]/decline
 * Customer declines an admin-provided alternative product.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;
    const sessionUser = token ? await getSessionUserByToken(token) : null;

    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();
    const queryId = params.id;
    const userId = String(sessionUser._id);
    const isAdmin = sessionUser.role === "admin";

    const request = await ProductRequestModel.findOne({
      $or: [{ requestId: queryId }, { _id: queryId.match(/^[0-9a-fA-F]{24}$/) ? queryId : undefined }]
    });

    if (!request) {
      return NextResponse.json({ success: false, error: "Product request not found." }, { status: 404 });
    }

    if (!isAdmin && request.userId !== userId) {
      return NextResponse.json({ success: false, error: "Access denied." }, { status: 403 });
    }

    request.customerAction = "declined";
    request.status = "Reviewing";
    request.updatedAt = new Date();
    await request.save();

    return NextResponse.json({
      success: true,
      message: "Alternative declined. Our sourcing team will explore other options.",
      request
    });
  } catch (err: any) {
    console.error("[POST /api/user/product-requests/[id]/decline] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to decline alternative" },
      { status: 500 }
    );
  }
}
