import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db/mongodb";
import { SupportTicketModel, TICKET_CATEGORIES } from "@/lib/models/support-ticket-model";
import { getSessionUserByToken } from "@/lib/auth/store";
import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { randomBytes } from "node:crypto";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/tickets
 * Returns all support tickets belonging to the authenticated customer.
 * Strictly enforces user ownership and filters out internal admin notes.
 */
export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;
    const sessionUser = token ? await getSessionUserByToken(token) : null;

    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    await connectToDatabase();
    const userId = String(sessionUser._id);

    // Fetch user tickets sorted by most recently updated
    const tickets = await SupportTicketModel.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();

    // Security: Filter out any internal notes from messages
    const sanitized = tickets.map((t: any) => ({
      ...t,
      messages: (t.messages || []).filter((m: any) => m.messageType !== "internal_note")
    }));

    return NextResponse.json({ success: true, tickets: sanitized }, { status: 200 });
  } catch (err: any) {
    console.error("[GET /api/user/tickets] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch support tickets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/tickets
 * Creates a new problem / support ticket for the authenticated user.
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;
    const sessionUser = token ? await getSessionUserByToken(token) : null;

    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please sign in to create a ticket." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const subject = String(body.subject || "").trim();
    const category = String(body.category || "").trim();
    const description = String(body.description || "").trim();
    const orderId = String(body.orderId || "").trim();
    const productId = String(body.productId || "").trim();
    const marketplace = String(body.marketplace || "").trim();

    if (!subject || subject.length < 3) {
      return NextResponse.json({ success: false, error: "Please enter a descriptive subject (at least 3 characters)." }, { status: 400 });
    }

    if (!category || !TICKET_CATEGORIES.includes(category as any)) {
      return NextResponse.json(
        {
          success: false,
          error: `Please select a valid problem category: ${TICKET_CATEGORIES.join(", ")}`
        },
        { status: 400 }
      );
    }

    if (!description || description.length < 5) {
      return NextResponse.json(
        { success: false, error: "Please provide a detailed description of the problem (at least 5 characters)." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const userId = String(sessionUser._id);
    const userName = sessionUser.fullName || sessionUser.email || "Customer";
    const userEmail = sessionUser.email || "";
    const userPhone = sessionUser.phone || "";

    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const ticketId = `TCK-${randomDigits}`;
    const initialMessageId = `MSG-${randomBytes(4).toString("hex")}`;

    const newTicket = await SupportTicketModel.create({
      ticketId,
      userId,
      userName,
      userEmail,
      userPhone,
      subject,
      category,
      description,
      orderId,
      productId,
      marketplace,
      status: "Open",
      priority: "medium",
      messages: [
        {
          messageId: initialMessageId,
          senderId: userId,
          senderName: userName,
          senderRole: "user",
          message: description,
          messageType: "reply",
          createdAt: new Date()
        }
      ]
    });

    return NextResponse.json(
      {
        success: true,
        message: `Support ticket ${ticketId} created successfully. Our team will assist you shortly.`,
        ticket: newTicket
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[POST /api/user/tickets] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to create support ticket" },
      { status: 500 }
    );
  }
}
