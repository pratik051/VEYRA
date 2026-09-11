import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db/mongodb";
import { SupportTicketModel } from "@/lib/models/support-ticket-model";
import { getSessionUserByToken } from "@/lib/auth/store";
import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/tickets/[id]
 * Retrieves a single ticket for the customer.
 * Strictly verifies that the authenticated user owns this ticket (or is admin).
 * Filters out internal admin notes.
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

    const ticket: any = await SupportTicketModel.findOne({
      $or: [{ ticketId: queryId }, { _id: queryId.match(/^[0-9a-fA-F]{24}$/) ? queryId : undefined }]
    }).lean();

    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found." }, { status: 404 });
    }

    // Authorization check
    if (!isAdmin && ticket.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Access denied. You do not have permission to view this ticket." },
        { status: 403 }
      );
    }

    // Filter internal notes for non-admins
    const sanitized = {
      ...ticket,
      messages: isAdmin
        ? ticket.messages
        : (ticket.messages || []).filter((m: any) => m.messageType !== "internal_note")
    };

    return NextResponse.json({ success: true, ticket: sanitized }, { status: 200 });
  } catch (err: any) {
    console.error("[GET /api/user/tickets/[id]] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}
