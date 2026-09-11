import { NextRequest, NextResponse } from "next/server";
import { syncMarketplaceProducts } from "@/lib/marketplace/sync";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const providerId = body.providerId;

    const results = await syncMarketplaceProducts(providerId);

    const totalImported = results.reduce((acc, r) => acc + r.importedCount, 0);
    const totalUpdated = results.reduce((acc, r) => acc + r.updatedCount, 0);
    const hasFailures = results.some((r) => !r.success);

    return NextResponse.json({
      success: !hasFailures,
      message: `Sync completed: ${totalImported} imported, ${totalUpdated} updated.`,
      totalImported,
      totalUpdated,
      results
    });
  } catch (err: any) {
    console.error("[POST /api/admin/marketplace/sync] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to trigger product sync" },
      { status: 500 }
    );
  }
}
