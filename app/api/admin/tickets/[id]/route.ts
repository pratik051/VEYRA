import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db/mongodb";
import { SupportTicketModel } from "@/lib/models/support-ticket-model";
import { IndiaOrderModel } from "@/lib/models/india-order-model";
import { OrderModel } from "@/lib/models/order-model";
import { getSessionUserByToken } from "@/lib/auth/store";
import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/tickets/[id]
 * Admin-only: Retrieves full ticket detail, all message history (including internal notes),
 * and fetches the actual related order snapshot if orderId is attached.
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

    const ticket: any = await SupportTicketModel.findOne({
      $or: [{ ticketId: queryId }, { _id: queryId.match(/^[0-9a-fA-F]{24}$/) ? queryId : undefined }]
    }).lean();

    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found." }, { status: 404 });
    }

    let relatedOrder: any = null;
    if (ticket.orderId) {
      const cleanOrderId = ticket.orderId.trim();
      // Look up India order
      const indiaOrder = await IndiaOrderModel.findOne({
        $or: [{ orderId: cleanOrderId }, { invoiceNumber: cleanOrderId }]
      }).lean();

      if (indiaOrder) {
        relatedOrder = {
          ...indiaOrder,
          isIndiaOrder: true
        };
      } else {
        // Look up standard store order
        const storeOrder = await OrderModel.findOne({
          $or: [{ orderId: cleanOrderId }, { invoiceNumber: cleanOrderId }]
        }).lean();
        if (storeOrder) {
          relatedOrder = {
            ...storeOrder,
            isIndiaOrder: false
          };
        }
      }
    }

    return NextResponse.json({ success: true, ticket, relatedOrder }, { status: 200 });
  } catch (err: any) {
    console.error("[GET /api/admin/tickets/[id]] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load ticket details" },
      { status: 500 }
    );
  }
}
