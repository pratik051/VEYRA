import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { connectToDatabase } from "@/lib/db/mongodb";
import { IndiaOrderModel } from "@/lib/models/india-order-model";
import { OrderModel } from "@/lib/models/order-model";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const { orderId } = params;
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    await connectToDatabase();

    const userIdStr = String(user._id);
    const userEmail = (user.email || "").toLowerCase().trim();

    // 1. Check India Orders collection
    const indiaOrder = await IndiaOrderModel.findOne({ orderId }).lean() as any;

    if (indiaOrder) {
      // Verify ownership
      const orderUserId = String(indiaOrder.userId || indiaOrder.customerId || "");
      const orderEmail = (indiaOrder.email || "").toLowerCase().trim();

      const isOwner =
        orderUserId === userIdStr ||
        (userEmail && orderEmail === userEmail) ||
        user.role === "admin";

      if (!isOwner) {
        return NextResponse.json({ error: "Order not found." }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        order: {
          _id: String(indiaOrder._id),
          orderId: indiaOrder.orderId,
          invoiceNumber: indiaOrder.invoiceNumber,
          invoiceUrl: indiaOrder.invoiceUrl || `/api/india-order/invoice/${indiaOrder.orderId}`,
          isIndiaOrder: true,
          productName: indiaOrder.productName,
          productImage: indiaOrder.productImage || "",
          productUrl: indiaOrder.productUrl || "",
          marketplace: indiaOrder.marketplace,
          sourceProductId: indiaOrder.sourceProductId || "",
          productVariant: indiaOrder.productVariant || "",
          size: indiaOrder.size || "",
          color: indiaOrder.color || "",
          quantity: indiaOrder.quantity || 1,
          indianPriceINR: indiaOrder.indianPriceINR || 0,
          conversionAmountNPR: indiaOrder.conversionAmountNPR || 0,
          serviceChargeNPR: indiaOrder.serviceChargeNPR || 0,
          deliveryChargeNPR: indiaOrder.deliveryChargeNPR || 200,
          total: indiaOrder.finalAmountNPR || 0,
          paymentMethod: indiaOrder.paymentMethod || "COD",
          paymentStatus: indiaOrder.paymentStatus || "Pending",
          paymentTransactionId: indiaOrder.paymentTransactionId || "",
          orderStatus: indiaOrder.orderStatus || "Confirmed",
          shippingAddress: {
            customerName: indiaOrder.customerName || "",
            phone: indiaOrder.phone || "",
            email: indiaOrder.email || "",
            deliveryAddress: indiaOrder.deliveryAddress || "",
            city: indiaOrder.city || "",
            district: indiaOrder.district || "",
            province: indiaOrder.province || "",
            postalCode: indiaOrder.postalCode || "",
            deliveryInstructions: indiaOrder.deliveryInstructions || ""
          },
          createdAt: indiaOrder.createdAt ? new Date(indiaOrder.createdAt).toISOString() : new Date().toISOString()
        }
      });
    }

    // 2. Check Legacy Store Orders collection
    const legacyOrder = await OrderModel.findOne({ orderId }).lean() as any;

    if (legacyOrder) {
      const orderUserId = String(legacyOrder.userId || "");
      const orderEmail = (legacyOrder.email || "").toLowerCase().trim();

      const isOwner =
        orderUserId === userIdStr ||
        (userEmail && orderEmail === userEmail) ||
        user.role === "admin";

      if (!isOwner) {
        return NextResponse.json({ error: "Order not found." }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        order: {
          _id: String(legacyOrder._id),
          orderId: legacyOrder.orderId,
          invoiceNumber: legacyOrder.orderId,
          invoiceUrl: "",
          isIndiaOrder: false,
          productName: "Store Order",
          productImage: "",
          productUrl: "",
          marketplace: "SAJILOMARTS Store",
          quantity: legacyOrder.items?.reduce((acc: number, curr: any) => acc + (curr.quantity || 1), 0) || 1,
          items: legacyOrder.items || [],
          total: legacyOrder.total || 0,
          paymentMethod: legacyOrder.paymentMethod || "Cash on Delivery",
          paymentStatus: legacyOrder.paymentStatus || "Pending",
          orderStatus: legacyOrder.orderStatus || "Order Placed",
          shippingAddress: {
            customerName: legacyOrder.fullName || "",
            phone: legacyOrder.phone || "",
            email: legacyOrder.email || "",
            deliveryAddress: legacyOrder.fullAddress || "",
            city: legacyOrder.city || "",
            district: legacyOrder.district || "",
            province: legacyOrder.province || "",
            postalCode: "",
            deliveryInstructions: ""
          },
          createdAt: legacyOrder.createdAt ? new Date(legacyOrder.createdAt).toISOString() : new Date().toISOString()
        }
      });
    }

    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  } catch (error) {
    console.error("Failed to fetch order details:", error);
    return NextResponse.json(
      { error: "Failed to fetch order details." },
      { status: 500 }
    );
  }
}
