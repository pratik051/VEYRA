import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function requireAdminSession() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return null;
  }
  return user;
}

export async function requireAdmin(_request?: Request) {
  const user = await requireAdminSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized admin access." }, { status: 403 });
  }
  return null;
}
