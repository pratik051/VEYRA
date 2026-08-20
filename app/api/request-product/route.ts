import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ProductRequestModel } from "@/lib/models/product-request-model";
import { generateId } from "@/lib/utils";

type RequestPayload = {
  fullName?: string;
  phone?: string;
  email?: string;
  deliveryLocation?: string;
  productUrl?: string;
  productName?: string;
  productCategory?: string;
  preferredSize?: string;
  preferredColor?: string;
  quantity?: number;
  additionalNotes?: string;
  maximumBudget?: string;
  preferredDeliveryTime?: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as RequestPayload;
  if (!body.fullName || !body.phone || !body.productUrl) {
    return NextResponse.json({ error: "fullName, phone and productUrl are required." }, { status: 400 });
  }
  const requestId = generateId("REQ");
  await connectToDatabase();
  await ProductRequestModel.create({
    requestId,
    fullName: body.fullName,
    phone: body.phone,
    email: body.email || "",
    deliveryLocation: body.deliveryLocation || "",
    productUrl: body.productUrl,
    productName: body.productName || "",
    productCategory: body.productCategory || "",
    preferredSize: body.preferredSize || "",
    preferredColor: body.preferredColor || "",
    quantity: body.quantity || 1,
    additionalNotes: body.additionalNotes || "",
    maximumBudget: body.maximumBudget || "",
    preferredDeliveryTime: body.preferredDeliveryTime || "",
    status: "Pending"
  });
  return NextResponse.json({
    message: "Your request has been received. VEYRA will review the product and contact you with availability and estimated pricing.",
    requestId,
    status: "Pending"
  });
}
