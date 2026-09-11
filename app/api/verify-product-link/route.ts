import { NextRequest, NextResponse } from "next/server";
import { checkProductAvailabilityAndDelivery, REQUIRED_DELIVERY_PIN } from "@/lib/marketplace/availability";

export type VerificationStatus =
  | "available"
  | "out_of_stock"
  | "delivery_unavailable"
  | "unavailable"
  | "manual_required"
  | "unsupported_platform"
  | "invalid_url"
  | "blocked";

export interface VerifyProductResponse {
  status: VerificationStatus;
  platform: string | null;
  platformDisplayName: string | null;
  message: string;
  canProceed: boolean;
  canRequestManual: boolean;
  verified?: boolean;
  inStock?: boolean;
  deliveryAvailable?: boolean;
  postalCode?: string;
  canOrder?: boolean;
  reason?: string;
  stockStatusText?: string;
  deliveryStatusText?: string;
  product?: any;
}

export async function POST(req: NextRequest) {
  let body: { url?: string; postalCode?: string; variant?: any; quantity?: number };
  try {
    body = (await req.json()) as any;
  } catch {
    return NextResponse.json<VerifyProductResponse>(
      {
        status: "invalid_url",
        platform: null,
        platformDisplayName: null,
        message: "Invalid request body.",
        canProceed: false,
        canRequestManual: false
      },
      { status: 400 }
    );
  }

  const rawUrl = (body.url ?? "").trim();
  const postalCode = (body.postalCode ?? REQUIRED_DELIVERY_PIN).trim();

  if (!rawUrl) {
    return NextResponse.json<VerifyProductResponse>(
      {
        status: "invalid_url",
        platform: null,
        platformDisplayName: null,
        message: "Please paste a product link to check.",
        canProceed: false,
        canRequestManual: false
      },
      { status: 400 }
    );
  }

  const checkResult = await checkProductAvailabilityAndDelivery({
    url: rawUrl,
    postalCode,
    variant: body.variant,
    quantity: body.quantity
  });

  let status: VerificationStatus = "unavailable";
  if (checkResult.canOrder) {
    status = "available";
  } else if (!checkResult.verified) {
    status = checkResult.reason === "UNSUPPORTED_PLATFORM" ? "unsupported_platform" : "invalid_url";
  } else if (!checkResult.inStock && !checkResult.deliveryAvailable) {
    status = "unavailable";
  } else if (!checkResult.inStock) {
    status = "out_of_stock";
  } else if (!checkResult.deliveryAvailable) {
    status = "delivery_unavailable";
  }

  return NextResponse.json<VerifyProductResponse>(
    {
      status,
      platform: checkResult.product?.source || null,
      platformDisplayName: checkResult.product?.brand || checkResult.product?.source || "Indian Marketplace",
      message: checkResult.message,
      canProceed: checkResult.canOrder,
      canRequestManual: true,
      verified: checkResult.verified,
      inStock: checkResult.inStock,
      deliveryAvailable: checkResult.deliveryAvailable,
      postalCode: checkResult.postalCode,
      canOrder: checkResult.canOrder,
      reason: checkResult.reason,
      stockStatusText: checkResult.stockStatusText,
      deliveryStatusText: checkResult.deliveryStatusText,
      product: checkResult.product
    },
    { status: 200 }
  );
}
