import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ProductRequestModel } from "@/lib/models/product-request-model";
import { getSessionUserByToken } from "@/lib/auth/store";
import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/product-requests
 * Admin-only: Returns all product sourcing requests with status filters and live DB counts.
 */
export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;
    const sessionUser = token ? await getSessionUserByToken(token) : null;

    if (!sessionUser || sessionUser.role !== "admin") {
      return NextResponse.json({ success: false, error: "Access denied. Admin access required." }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status")?.trim();
    const search = searchParams.get("search")?.trim();

    const query: any = {};
    if (status && status !== "all") {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { requestId: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { productName: { $regex: search, $options: "i" } },
        { originalMarketplace: { $regex: search, $options: "i" } }
      ];
    }

    const requests = await ProductRequestModel.find(query).sort({ createdAt: -1 }).lean();

    // Live counts
    const allRequests = await ProductRequestModel.find({}).select("status").lean();
    const counts = {
      total: allRequests.length,
      pending: allRequests.filter((r) => r.status === "Pending").length,
      reviewing: allRequests.filter((r) => r.status === "Reviewing").length,
      alternativeFound: allRequests.filter((r) => r.status === "Alternative Found").length,
      waitingForUser: allRequests.filter((r) => r.status === "Waiting for User").length,
      converted: allRequests.filter((r) => r.status === "Converted to Order").length,
      closed: allRequests.filter((r) => r.status === "Closed" || r.status === "Rejected").length
    };

    return NextResponse.json({ success: true, requests, counts }, { status: 200 });
  } catch (err: any) {
    console.error("[GET /api/admin/product-requests] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load product requests" },
      { status: 500 }
    );
  }
}
