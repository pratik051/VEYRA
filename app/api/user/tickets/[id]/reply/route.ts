import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db/mongodb";
import { SupportTicketModel } from "@/lib/models/support-ticket-model";
import { getSessionUserByToken } from "@/lib/auth/store";
import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { randomBytes } from "node:crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/user/tickets/[id]/reply
 * Appends a customer message to their own ticket.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;
    const sessionUser = token ? await getSessionUserByToken(token) : null;

    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const message = String(body.message || "").trim();

    if (!message || message.length < 2) {
      return NextResponse.json({ success: false, error: "Message cannot be empty." }, { status: 400 });
    }

    await connectToDatabase();
    const queryId = params.id;
    const userId = String(sessionUser._id);
    const userName = sessionUser.fullName || sessionUser.email || "Customer";
    const isAdmin = sessionUser.role === "admin";

    const ticket = await SupportTicketModel.findOne({
      $or: [{ ticketId: queryId }, { _id: queryId.match(/^[0-9a-fA-F]{24}$/) ? queryId : undefined }]
    });

    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found." }, { status: 404 });
    }

    // Ownership check
    if (!isAdmin && ticket.userId !== userId) {
      return NextResponse.json({ success: false, error: "Access denied." }, { status: 403 });
    }

    const messageId = `MSG-${randomBytes(4).toString("hex")}`;
    const newMessage = {
      messageId,
      senderId: userId,
      senderName: userName,
      senderRole: (isAdmin ? "admin" : "user") as "user" | "admin",
      message,
      messageType: "reply" as const,
      createdAt: new Date()
    };

    ticket.messages.push(newMessage);

    // If ticket was closed or waiting for user, reopen to Open / In Progress
    if (ticket.status === "Waiting for User" || ticket.status === "Resolved") {
      ticket.status = "Open";
    }

    ticket.updatedAt = new Date();
    await ticket.save();

    // Security: Filter out internal notes for user response
    const sanitized = {
      ...ticket.toObject(),
      messages: isAdmin
        ? ticket.messages
        : ticket.messages.filter((m: any) => m.messageType !== "internal_note")
    };

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully.",
      ticket: sanitized
    });
  } catch (err: any) {
    console.error("[POST /api/user/tickets/[id]/reply] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to send reply" },
      { status: 500 }
    );
  }
}
