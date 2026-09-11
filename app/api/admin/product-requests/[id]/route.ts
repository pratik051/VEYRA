import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ProductRequestModel, PRODUCT_REQUEST_STATUSES } from "@/lib/models/product-request-model";
import { getSessionUserByToken } from "@/lib/auth/store";
import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/product-requests/[id]
 * Admin-only: Returns single product request detail.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;
    const sessionUser = token ? await getSessionUserByToken(token) : null;

    if (!sessionUser || sessionUser.role !== "admin") {
      return NextResponse.json({ success: false, error: "Access denied." }, { status: 403 });
    }

    await connectToDatabase();
    const queryId = params.id;

    const request = await ProductRequestModel.findOne({
      $or: [{ requestId: queryId }, { _id: queryId.match(/^[0-9a-fA-F]{24}$/) ? queryId : undefined }]
    }).lean();

    if (!request) {
      return NextResponse.json({ success: false, error: "Request not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, request }, { status: 200 });
  } catch (err: any) {
    console.error("[GET /api/admin/product-requests/[id]] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load request detail" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/product-requests/[id]
 * Admin updates status or notes.
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;
    const sessionUser = token ? await getSessionUserByToken(token) : null;

    if (!sessionUser || sessionUser.role !== "admin") {
      return NextResponse.json({ success: false, error: "Access denied." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    await connectToDatabase();
    const queryId = params.id;

    const request = await ProductRequestModel.findOne({
      $or: [{ requestId: queryId }, { _id: queryId.match(/^[0-9a-fA-F]{24}$/) ? queryId : undefined }]
    });

    if (!request) {
      return NextResponse.json({ success: false, error: "Request not found." }, { status: 404 });
    }

    if (body.status && PRODUCT_REQUEST_STATUSES.includes(body.status)) {
      request.status = body.status;
    }
    if (body.additionalNotes !== undefined) {
      request.additionalNotes = body.additionalNotes;
    }

    request.updatedAt = new Date();
    await request.save();

    return NextResponse.json({ success: true, message: "Request updated.", request }, { status: 200 });
  } catch (err: any) {
    console.error("[PATCH /api/admin/product-requests/[id]] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to update request" },
      { status: 500 }
    );
  }
}
