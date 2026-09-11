import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, updatePasswordByUserId } from "@/lib/auth/store";
import { hashPassword } from "@/lib/auth/password";
import { PasswordResetOtpModel } from "@/lib/models/password-reset-otp-model";
import { connectToDatabase } from "@/lib/db/mongodb";

declare global {
  // eslint-disable-next-line no-var
  var __linkova_mem_otps: Map<string, { otp: string; expiresAt: Date; email: string }> | undefined;
}
const memOtps = global.__linkova_mem_otps || new Map<string, { otp: string; expiresAt: Date; email: string }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, newPassword } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Email is required." },
        { status: 400 }
      );
    }
    if (!otp || typeof otp !== "string" || otp.trim().length !== 6) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 6-digit verification code." },
        { status: 400 }
      );
    }
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

    // Verify user exists
    const user = await getUserByEmail(normalizedEmail);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "No account found with this email address." },
        { status: 404 }
      );
    }

    let isValid = false;

    // Check DB first
    try {
      await connectToDatabase();
      const dbRecord = await PasswordResetOtpModel.findOne({
        email: normalizedEmail,
        otp: cleanOtp,
        used: false,
      }).sort({ createdAt: -1 });

      if (dbRecord && new Date(dbRecord.expiresAt).getTime() > Date.now()) {
        isValid = true;
        // Invalidate used OTP
        await PasswordResetOtpModel.deleteOne({ _id: dbRecord._id });
      }
    } catch (dbErr) {
      console.warn("DB OTP verify fallback to memory:", dbErr);
    }

    // Fallback to memory if DB did not succeed
    if (!isValid) {
      const memRecord = memOtps.get(normalizedEmail);
      if (
        memRecord &&
        memRecord.otp === cleanOtp &&
        new Date(memRecord.expiresAt).getTime() > Date.now()
      ) {
        isValid = true;
        memOtps.delete(normalizedEmail);
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification code. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash the new password and update the user
    const passwordHash = await hashPassword(newPassword);
    const updated = await updatePasswordByUserId(user._id, passwordHash);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Failed to update password. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully! You can now log in with your new password.",
    });
  } catch (error: any) {
    console.error("Verify OTP Route Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
