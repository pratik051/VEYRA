import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ProductRequestModel } from "@/lib/models/product-request-model";
import { getSessionUserByToken } from "@/lib/auth/store";
import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/product-requests/[id]
 * Retrieves a single product request with ownership verification.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

    const request: any = await ProductRequestModel.findOne({
      $or: [{ requestId: queryId }, { _id: queryId.match(/^[0-9a-fA-F]{24}$/) ? queryId : undefined }]
    }).lean();

    if (!request) {
      return NextResponse.json({ success: false, error: "Product request not found." }, { status: 404 });
    }

    if (!isAdmin && request.userId !== userId) {
      return NextResponse.json({ success: false, error: "Access denied." }, { status: 403 });
    }

    return NextResponse.json({ success: true, request }, { status: 200 });
  } catch (err: any) {
    console.error("[GET /api/user/product-requests/[id]] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load product request" },
      { status: 500 }
    );
  }
}
