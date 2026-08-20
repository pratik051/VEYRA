import { NextResponse } from "next/server";
import { consumeResetToken, updatePasswordByUserId } from "@/lib/auth/store";
import { hashPassword } from "@/lib/auth/password";

export async function POST(req: Request) {
  const body = (await req.json()) as { token?: string; newPassword?: string };
  const token = body.token?.trim() || "";
  const newPassword = body.newPassword || "";
  if (!token || !newPassword) {
    return NextResponse.json({ error: "Token and newPassword are required." }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const userId = await consumeResetToken(token);
  if (!userId) {
    return NextResponse.json({ error: "Invalid or expired reset token." }, { status: 400 });
  }
  const passwordHash = await hashPassword(newPassword);
  const updated = await updatePasswordByUserId(userId, passwordHash);
  if (!updated) {
    return NextResponse.json({ error: "Unable to reset password." }, { status: 500 });
  }

  return NextResponse.json({ message: "Password reset successful. Please login with your new password." });
}
