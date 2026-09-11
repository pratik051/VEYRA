import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { connectToDatabase } from "@/lib/db/mongodb";
import { AddressModel } from "@/lib/models/address-model";

export const dynamic = "force-dynamic";

/**
 * POST /api/user/addresses/[id]/default
 * Sets the specified address as the default address for the authenticated user.
 */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const addressId = params.id;
    await connectToDatabase();
    const userId = user._id;

    const existing = await AddressModel.findOne({ _id: addressId, userId });
    if (!existing) {
      return NextResponse.json({ error: "Address not found or unauthorized." }, { status: 404 });
    }

    // Reset all addresses for this user to isDefault: false
    await AddressModel.updateMany({ userId }, { $set: { isDefault: false } });

    // Set target address to isDefault: true
    existing.isDefault = true;
    await existing.save();

    return NextResponse.json({
      success: true,
      message: "Default address updated.",
      address: existing
    });
  } catch (err: unknown) {
    console.error("Failed to set default address:", err);
    const msg = err instanceof Error ? err.message : "Failed to set default address.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
