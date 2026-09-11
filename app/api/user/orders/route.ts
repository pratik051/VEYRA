import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { connectToDatabase } from "@/lib/db/mongodb";
import { IndiaOrderModel } from "@/lib/models/india-order-model";
import { OrderModel } from "@/lib/models/order-model";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    await connectToDatabase();

    const userIdStr = String(user._id);
    const userEmail = (user.email || "").toLowerCase().trim();

    // 1. Fetch Indian Marketplace Orders for this authenticated user
    const indiaOrdersQuery = {
      $or: [
        { userId: userIdStr },
        { customerId: userIdStr },
        ...(userEmail ? [{ email: userEmail }] : [])
      ]
    };

    const indiaOrders = await IndiaOrderModel.find(indiaOrdersQuery)
      .sort({ createdAt: -1 })
      .lean();

    // 2. Fetch Legacy Store Orders for this user (if any)
    let legacyOrders: any[] = [];
    try {
      const legacyQuery = {
        $or: [
          { userId: user._id },
          ...(userEmail ? [{ email: userEmail }] : [])
        ]
      };
      legacyOrders = await OrderModel.find(legacyQuery).sort({ createdAt: -1 }).lean();
    } catch {
      // Legacy model query failure is non-blocking
    }

    // 3. Map into unified Customer Order format
    const formattedIndiaOrders = indiaOrders.map((ord: any) => ({
      _id: String(ord._id),
      orderId: ord.orderId,
      invoiceNumber: ord.invoiceNumber,
      invoiceUrl: ord.invoiceUrl || `/api/india-order/invoice/${ord.orderId}`,
      isIndiaOrder: true,
      productName: ord.productName || "Indian Marketplace Product",
      productImage: ord.productImage || "",
      productUrl: ord.productUrl || "",
      marketplace: ord.marketplace || "Indian Marketplace",
      quantity: ord.quantity || 1,
      variant: ord.productVariant || "",
      size: ord.size || "",
      color: ord.color || "",
      indianPriceINR: ord.indianPriceINR || 0,
      total: ord.finalAmountNPR || 0,
      paymentMethod: ord.paymentMethod || "COD",
      paymentStatus: ord.paymentStatus || "Pending",
      orderStatus: ord.orderStatus || "Confirmed",
      shippingAddress: {
        customerName: ord.customerName || "",
        phone: ord.phone || "",
        deliveryAddress: ord.deliveryAddress || "",
        city: ord.city || "",
        district: ord.district || "",
        province: ord.province || "",
        postalCode: ord.postalCode || "",
        deliveryInstructions: ord.deliveryInstructions || ""
      },
      createdAt: ord.createdAt ? new Date(ord.createdAt).toISOString() : new Date().toISOString()
    }));

    const formattedLegacyOrders = legacyOrders.map((ord: any) => ({
      _id: String(ord._id),
      orderId: ord.orderId,
      invoiceNumber: ord.orderId,
      invoiceUrl: "",
      isIndiaOrder: false,
      productName: ord.items?.length > 1 ? `${ord.items[0]?.productId || "Product"} + ${ord.items.length - 1} more` : (ord.items?.[0]?.productId || "Store Product"),
      productImage: "",
      productUrl: "",
      marketplace: "LINKOVA Store",
      quantity: ord.items?.reduce((acc: number, curr: any) => acc + (curr.quantity || 1), 0) || 1,
      variant: "",
      size: "",
      color: "",
      indianPriceINR: 0,
      total: ord.total || 0,
      paymentMethod: ord.paymentMethod || "Cash on Delivery",
      paymentStatus: ord.paymentStatus || "Pending",
      orderStatus: ord.orderStatus || "Order Placed",
      shippingAddress: {
        customerName: ord.fullName || "",
        phone: ord.phone || "",
        deliveryAddress: ord.fullAddress || "",
        city: ord.city || "",
        district: ord.district || "",
        province: ord.province || "",
        postalCode: "",
        deliveryInstructions: ""
      },
      createdAt: ord.createdAt ? new Date(ord.createdAt).toISOString() : new Date().toISOString()
    }));

    // Combine and sort by newest first
    const allOrders = [...formattedIndiaOrders, ...formattedLegacyOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      orders: allOrders,
      count: allOrders.length
    });
  } catch (error) {
    console.error("Failed to fetch customer orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders. Please try again later." },
      { status: 500 }
    );
  }
}
