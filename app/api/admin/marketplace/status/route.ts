import { NextResponse } from "next/server";
import { getAllProviders } from "@/lib/marketplace";
import { connectDB } from "@/lib/db/mongodb";
import { MarketplaceProductModel } from "@/lib/models/marketplace-product-model";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const providers = getAllProviders();

    const providerCounts = await MarketplaceProductModel.aggregate([
      { $group: { _id: "$source", count: { $sum: 1 }, lastSynced: { $max: "$lastSyncedAt" } } }
    ]);

    const countMap: Record<string, { count: number; lastSynced?: Date }> = {};
    providerCounts.forEach((item) => {
      countMap[item._id] = { count: item.count, lastSynced: item.lastSynced };
    });

    const enrichedProviders = providers.map((p) => ({
      id: p.id,
      name: p.name,
      displayName: p.displayName,
      enabled: p.enabled,
      importedCount: countMap[p.id]?.count || 0,
      lastSyncedAt: countMap[p.id]?.lastSynced || null
    }));

    const totalImported = await MarketplaceProductModel.countDocuments();

    return NextResponse.json({
      success: true,
      totalImported,
      providers: enrichedProviders
    });
  } catch (err: any) {
    console.error("[GET /api/admin/marketplace/status] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load marketplace status" },
      { status: 500 }
    );
  }
}
