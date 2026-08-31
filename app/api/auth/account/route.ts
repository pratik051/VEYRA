import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { updateUserProfileById } from "@/lib/auth/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: String(user._id),
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      province: user.province || "",
      district: user.district || "",
      city: user.city || "",
      ward: user.ward || "",
      fullAddress: user.fullAddress || "",
      landmark: user.landmark || ""
    }
  });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : user.fullName;
  const phone = typeof body.phone === "string" ? body.phone.trim() : user.phone;
  const province = typeof body.province === "string" ? body.province.trim() : user.province || "";
  const district = typeof body.district === "string" ? body.district.trim() : user.district || "";
  const city = typeof body.city === "string" ? body.city.trim() : user.city || "";
  const ward = typeof body.ward === "string" ? body.ward.trim() : user.ward || "";
  const fullAddress = typeof body.fullAddress === "string" ? body.fullAddress.trim() : user.fullAddress || "";
  const landmark = typeof body.landmark === "string" ? body.landmark.trim() : user.landmark || "";

  if (!fullName || !phone) {
    return NextResponse.json({ error: "Full name and phone number are required." }, { status: 400 });
  }

  const updated = await updateUserProfileById(String(user._id), {
    fullName,
    phone,
    province,
    district,
    city,
    ward,
    fullAddress,
    landmark
  });
  const updatedUser = updated && !Array.isArray(updated) ? updated : null;

  return NextResponse.json({
    user: {
      id: String(updatedUser?._id || user._id),
      fullName: String(updatedUser?.fullName || fullName),
      email: user.email,
      phone: String(updatedUser?.phone || phone),
      role: user.role,
      province: String(updatedUser?.province || province),
      district: String(updatedUser?.district || district),
      city: String(updatedUser?.city || city),
      ward: String(updatedUser?.ward || ward),
      fullAddress: String(updatedUser?.fullAddress || fullAddress),
      landmark: String(updatedUser?.landmark || landmark)
    }
  });
}
