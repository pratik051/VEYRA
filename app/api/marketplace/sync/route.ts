import { NextResponse } from "next/server";
import { syncMarketplaceProducts } from "@/lib/marketplace/sync";

export const dynamic = "force-dynamic";

/**
 * GET /api/marketplace/sync
 * Triggers automatic synchronization across all enabled Indian marketplace providers.
 * Query parameter `provider` (optional): syncs a single specific platform (e.g., 'meesho', 'amazon-india', 'myntra').
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get("provider") || undefined;

    const results = await syncMarketplaceProducts(provider);

    const totalImported = results.reduce((acc, r) => acc + r.importedCount, 0);
    const totalUpdated = results.reduce((acc, r) => acc + r.updatedCount, 0);

    return NextResponse.json({
      success: true,
      message: `Marketplace synchronization completed successfully at ${new Date().toISOString()}`,
      summary: {
        totalProvidersSynced: results.length,
        totalImported,
        totalUpdated
      },
      details: results
    });
  } catch (err: any) {
    console.error("[API /api/marketplace/sync] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to sync marketplace products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
