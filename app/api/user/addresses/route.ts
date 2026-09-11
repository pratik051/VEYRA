import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { connectToDatabase } from "@/lib/db/mongodb";
import { AddressModel, IAddress } from "@/lib/models/address-model";
import { UserModel } from "@/lib/models/user-model";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/addresses
 * Returns saved delivery addresses for the authenticated user and indicates the default address.
 * Seamlessly migrates/synthesizes from user profile if no addresses exist in AddressModel.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const userId = String(user._id);

  let addresses = await AddressModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 }).lean();

  // If user has no addresses in AddressModel, check if they have profile address details in UserModel
  if (addresses.length === 0 && (user.fullAddress || user.city || user.province)) {
    try {
      const defaultAddr = await AddressModel.create({
        userId: user._id,
        fullName: user.fullName || "Valued Customer",
        phone: user.phone || "",
        email: user.email || "",
        province: user.province || "Bagmati",
        district: user.district || "",
        city: user.city || "",
        ward: user.ward || "",
        fullAddress: user.fullAddress || (user.city ? `${user.city}, Nepal` : "Nepal"),
        addressLine1: user.fullAddress || "",
        landmark: user.landmark || "",
        country: "Nepal",
        label: "Home",
        isDefault: true
      });
      addresses = [defaultAddr.toObject()];
    } catch (err) {
      console.warn("Could not auto-seed default address from user profile:", err);
    }
  }

  const defaultAddress = addresses.find((a: any) => a.isDefault) || addresses[0] || null;

  return NextResponse.json({
    success: true,
    addresses,
    defaultAddress
  });
}

/**
 * POST /api/user/addresses
 * Adds a new address for the authenticated user.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const fullName = String(body.fullName || "").trim();
    const phone = String(body.phone || "").trim();
    const fullAddress = String(body.fullAddress || body.address || "").trim();
    const city = String(body.city || "").trim();
    const district = String(body.district || "").trim();
    const province = String(body.province || "Bagmati").trim();
    const ward = String(body.ward || "").trim();
    const postalCode = String(body.postalCode || "").trim();
    const landmark = String(body.landmark || "").trim();
    const label = String(body.label || "Home").trim();
    let isDefault = Boolean(body.isDefault);

    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ error: "Please enter a valid full name." }, { status: 400 });
    }
    if (!phone || phone.length < 7) {
      return NextResponse.json({ error: "Please enter a valid contact phone number." }, { status: 400 });
    }
    if (!fullAddress || fullAddress.length < 3) {
      return NextResponse.json({ error: "Please enter a complete delivery address." }, { status: 400 });
    }
    if (!city) {
      return NextResponse.json({ error: "Please specify a city or municipality." }, { status: 400 });
    }

    await connectToDatabase();
    const userId = user._id;

    // Count existing addresses
    const count = await AddressModel.countDocuments({ userId });
    if (count === 0) {
      isDefault = true; // First address is automatically default
    }

    if (isDefault) {
      // Clear default flag on existing addresses
      await AddressModel.updateMany({ userId }, { $set: { isDefault: false } });
    }

    const newAddress = await AddressModel.create({
      userId,
      fullName,
      phone,
      email: user.email || "",
      province,
      district,
      city,
      ward,
      fullAddress,
      addressLine1: fullAddress,
      addressLine2: "",
      postalCode,
      country: "Nepal",
      landmark,
      label,
      isDefault
    });

    return NextResponse.json({
      success: true,
      message: "Address saved successfully.",
      address: newAddress
    });
  } catch (err: unknown) {
    console.error("Failed to create address:", err);
    const msg = err instanceof Error ? err.message : "Failed to create address.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
