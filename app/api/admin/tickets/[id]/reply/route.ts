import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db/mongodb";
import { SupportTicketModel, TICKET_STATUSES } from "@/lib/models/support-ticket-model";
import { getSessionUserByToken } from "@/lib/auth/store";
import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { randomBytes } from "node:crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/tickets/[id]/reply
 * Admin-only: Appends a reply (visible to user) or an internal note (admin-only).
 * Optionally updates the ticket status.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;
    const sessionUser = token ? await getSessionUserByToken(token) : null;

    if (!sessionUser || sessionUser.role !== "admin") {
      return NextResponse.json({ success: false, error: "Access denied. Admin authorization required." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const message = String(body.message || "").trim();
    const messageType = body.messageType === "internal_note" ? "internal_note" : "reply";
    const newStatus = body.status;

    if (!message || message.length < 2) {
      return NextResponse.json({ success: false, error: "Message content cannot be empty." }, { status: 400 });
    }

    await connectToDatabase();
    const queryId = params.id;
    const adminId = String(sessionUser._id);
    const adminName = sessionUser.fullName || sessionUser.email || "SAJILOMARTS Support Team";

    const ticket = await SupportTicketModel.findOne({
      $or: [{ ticketId: queryId }, { _id: queryId.match(/^[0-9a-fA-F]{24}$/) ? queryId : undefined }]
    });

    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found." }, { status: 404 });
    }

    const messageId = `MSG-${randomBytes(4).toString("hex")}`;
    const newMessage = {
      messageId,
      senderId: adminId,
      senderName: adminName,
      senderRole: "admin" as const,
      message,
      messageType: messageType as "reply" | "internal_note",
      createdAt: new Date()
    };

    ticket.messages.push(newMessage);

    if (newStatus && TICKET_STATUSES.includes(newStatus)) {
      ticket.status = newStatus;
    } else if (messageType === "reply" && ticket.status === "Open") {
      ticket.status = "Waiting for User";
    }

    ticket.updatedAt = new Date();
    await ticket.save();

    return NextResponse.json({
      success: true,
      message: messageType === "internal_note" ? "Internal note saved." : "Reply sent to customer.",
      ticket
    });
  } catch (err: any) {
    console.error("[POST /api/admin/tickets/[id]/reply] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to post reply" },
      { status: 500 }
    );
  }
}
