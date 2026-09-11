import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db/mongodb";
import { SupportTicketModel, TICKET_STATUSES, TICKET_PRIORITIES } from "@/lib/models/support-ticket-model";
import { getSessionUserByToken } from "@/lib/auth/store";
import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/tickets/[id]/status
 * Admin-only: Updates the status or priority of a support ticket.
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;
    const sessionUser = token ? await getSessionUserByToken(token) : null;

    if (!sessionUser || sessionUser.role !== "admin") {
      return NextResponse.json({ success: false, error: "Access denied. Admin authorization required." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { status, priority } = body;

    const updateFields: any = { updatedAt: new Date() };

    if (status) {
      if (!TICKET_STATUSES.includes(status)) {
        return NextResponse.json({ success: false, error: `Invalid status: ${status}` }, { status: 400 });
      }
      updateFields.status = status;
    }

    if (priority) {
      if (!TICKET_PRIORITIES.includes(priority)) {
        return NextResponse.json({ success: false, error: `Invalid priority: ${priority}` }, { status: 400 });
      }
      updateFields.priority = priority;
    }

    await connectToDatabase();
    const queryId = params.id;

    const ticket = await SupportTicketModel.findOneAndUpdate(
      { $or: [{ ticketId: queryId }, { _id: queryId.match(/^[0-9a-fA-F]{24}$/) ? queryId : undefined }] },
      { $set: updateFields },
      { new: true }
    );

    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Ticket updated successfully.",
      ticket
    });
  } catch (err: any) {
    console.error("[PATCH /api/admin/tickets/[id]/status] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to update ticket" },
      { status: 500 }
    );
  }
}
