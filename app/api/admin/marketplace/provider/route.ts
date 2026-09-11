import { NextRequest, NextResponse } from "next/server";
import { setProviderEnabled } from "@/lib/marketplace";

export async function PATCH(req: NextRequest) {
  try {
    const { providerId, enabled } = await req.json();

    if (!providerId || typeof enabled !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Missing required fields: providerId, enabled (boolean)" },
        { status: 400 }
      );
    }

    const updated = setProviderEnabled(providerId, enabled);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Provider not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Provider ${providerId} is now ${enabled ? "enabled" : "disabled"}`
    });
  } catch (err: any) {
    console.error("[PATCH /api/admin/marketplace/provider] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update provider status" },
      { status: 500 }
    );
  }
}
