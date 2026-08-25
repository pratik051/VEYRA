import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ProductRequestModel } from "@/lib/models/product-request-model";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = (await req.json()) as {
    status?: string;
    quote?: {
      indianProductPrice?: number;
      exchangeRate?: number;
      shippingIndiaToNepal?: number;
      customsTaxes?: number;
      handlingFee?: number;
      nepalDeliveryFee?: number;
      serviceFee?: number;
      finalEstimatedPrice?: number;
      customerQuote?: number;
      quoteExpiry?: string;
      expectedDeliveryTime?: string;
      adminNotes?: string;
    };
  };
  await connectToDatabase();
  const updated = await ProductRequestModel.findByIdAndUpdate(
    params.id,
    {
      ...(body.status ? { status: body.status } : {}),
      ...(body.quote ? { quote: body.quote } : {})
    },
    { new: true }
  ).lean();
  if (!updated) return NextResponse.json({ error: "Request not found." }, { status: 404 });
  return NextResponse.json({ request: updated });
}
