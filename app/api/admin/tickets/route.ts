import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db/mongodb";
import { SupportTicketModel } from "@/lib/models/support-ticket-model";
import { getSessionUserByToken } from "@/lib/auth/store";
import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/tickets
 * Admin-only: Returns all user problem / support tickets with real-time counts, search, and filters.
 */
export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;
    const sessionUser = token ? await getSessionUserByToken(token) : null;

    if (!sessionUser || sessionUser.role !== "admin") {
      return NextResponse.json({ success: false, error: "Access denied. Admin authorization required." }, { status: 403 });
    }

    await connectToDatabase();

    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status");
    const categoryFilter = url.searchParams.get("category");
    const search = (url.searchParams.get("search") || "").trim();

    const query: any = {};

    if (statusFilter && statusFilter !== "All") {
      query.status = statusFilter;
    }

    if (categoryFilter && categoryFilter !== "All") {
      query.category = categoryFilter;
    }

    if (search) {
      query.$or = [
        { ticketId: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
        { orderId: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } }
      ];
    }

    const [tickets, totalCount, openCount, inProgressCount, waitingCount, resolvedCount, closedCount] =
      await Promise.all([
        SupportTicketModel.find(query).sort({ updatedAt: -1 }).lean(),
        SupportTicketModel.countDocuments({}),
        SupportTicketModel.countDocuments({ status: "Open" }),
        SupportTicketModel.countDocuments({ status: "In Progress" }),
        SupportTicketModel.countDocuments({ status: "Waiting for User" }),
        SupportTicketModel.countDocuments({ status: "Resolved" }),
        SupportTicketModel.countDocuments({ status: "Closed" })
      ]);

    return NextResponse.json(
      {
        success: true,
        tickets,
        counts: {
          total: totalCount,
          open: openCount,
          inProgress: inProgressCount,
          waitingForUser: waitingCount,
          resolved: resolvedCount,
          closed: closedCount
        }
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[GET /api/admin/tickets] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load support tickets" },
      { status: 500 }
    );
  }
}
