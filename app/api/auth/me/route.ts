import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";

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
