import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ProductRequestModel } from "@/lib/models/product-request-model";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { getSessionUserByToken } from "@/lib/auth/store";
import { getPlatformByDomain, isValidProductUrl, APPROVED_DOMAINS } from "@/lib/sourcing-platforms";

function sanitizeUrl(raw: string): URL | null {
  try {
    const parsed = new URL(raw.trim());
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    const hostname = parsed.hostname.toLowerCase();
    if (!APPROVED_DOMAINS.has(hostname)) return null;
    if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) return null;
    if (hostname === "localhost" || hostname.endsWith(".local") || hostname.endsWith(".internal")) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const rawUrl = (body.url ?? "").trim();
  if (!rawUrl) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  const parsed = sanitizeUrl(rawUrl);
  if (!parsed) return NextResponse.json({ error: "Invalid or unsupported URL" }, { status: 422 });

  const platform = getPlatformByDomain(parsed.hostname);
  if (!platform) {
    return NextResponse.json({ error: "Unsupported platform" }, { status: 422 });
  }

  // Validate URL structure for platform
  const isValidStructure = isValidProductUrl(rawUrl, platform);
  if (!isValidStructure) {
    return NextResponse.json({
      error: "URL does not match expected product page structure for the detected platform.",
      canRequestManual: platform.manualVerificationAllowed ?? false
    }, { status: 422 });
  }

  // Determine user (optional)
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  const sessionUser = token ? await getSessionUserByToken(token) : null;

  // Create product request
  const newReq = await ProductRequestModel.create({
    requestId: `PR-${Date.now()}-${Math.random().ToString(36).slice(2, 8)}`,
    fullName: sessionUser ? sessionUser.fullName : (body.fullName ?? "Guest"),
    phone: sessionUser ? sessionUser.phone : (body.phone ?? ""),
    email: sessionUser ? sessionUser.email : (body.email ?? ""),
    deliveryLocation: body.deliveryLocation ?? "",
    productUrl: rawUrl,
    productName: body.productName ?? "",
    productCategory: body.productCategory ?? "",
    detectedPlatform: platform.displayName,
    preferredSize: body.preferredSize ?? "",
    preferredColor: body.preferredColor ?? "",
    quantity: Number(body.quantity ?? 1),
    additionalNotes: body.additionalNotes ?? "",
    maximumBudget: body.maximumBudget ?? "",
    preferredDeliveryTime: body.preferredDeliveryTime ?? "",
    screenshotUrl: body.screenshotUrl ?? "",
    status: "pending_review",
    quote: {}
  });

  return NextResponse.json({ id: newReq.requestId, status: newReq.status, message: "Request created." }, { status: 201 });
}
