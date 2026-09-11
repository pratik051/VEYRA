import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { connectToDatabase } from "@/lib/db/mongodb";
import { AddressModel } from "@/lib/models/address-model";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/user/addresses/[id]
 * Updates an address owned by the authenticated user.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const addressId = params.id;
    const body = await req.json();

    await connectToDatabase();
    const userId = user._id;

    const existing = await AddressModel.findOne({ _id: addressId, userId });
    if (!existing) {
      return NextResponse.json({ error: "Address not found or unauthorized." }, { status: 404 });
    }

    const updates: Record<string, any> = {};
    if (typeof body.fullName === "string") updates.fullName = body.fullName.trim();
    if (typeof body.phone === "string") updates.phone = body.phone.trim();
    if (typeof body.email === "string") updates.email = body.email.trim();
    if (typeof body.province === "string") updates.province = body.province.trim();
    if (typeof body.district === "string") updates.district = body.district.trim();
    if (typeof body.city === "string") updates.city = body.city.trim();
    if (typeof body.ward === "string") updates.ward = body.ward.trim();
    if (typeof body.fullAddress === "string") {
      updates.fullAddress = body.fullAddress.trim();
      updates.addressLine1 = body.fullAddress.trim();
    }
    if (typeof body.postalCode === "string") updates.postalCode = body.postalCode.trim();
    if (typeof body.landmark === "string") updates.landmark = body.landmark.trim();
    if (typeof body.label === "string") updates.label = body.label.trim();

    if (body.isDefault === true) {
      await AddressModel.updateMany({ userId }, { $set: { isDefault: false } });
      updates.isDefault = true;
    }

    const updated = await AddressModel.findOneAndUpdate(
      { _id: addressId, userId },
      { $set: updates },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Address updated successfully.",
      address: updated
    });
  } catch (err: unknown) {
    console.error("Failed to update address:", err);
    const msg = err instanceof Error ? err.message : "Failed to update address.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

/**
 * DELETE /api/user/addresses/[id]
 * Deletes an address owned by the authenticated user.
 */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
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

    const wasDefault = existing.isDefault;
    await AddressModel.deleteOne({ _id: addressId, userId });

    // If deleted address was default, promote the newest remaining address as default
    if (wasDefault) {
      const remaining = await AddressModel.findOne({ userId }).sort({ createdAt: -1 });
      if (remaining) {
        remaining.isDefault = true;
        await remaining.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully."
    });
  } catch (err: unknown) {
    console.error("Failed to delete address:", err);
    const msg = err instanceof Error ? err.message : "Failed to delete address.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
