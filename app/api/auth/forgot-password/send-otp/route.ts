import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/auth/store";
import { PasswordResetOtpModel } from "@/lib/models/password-reset-otp-model";
import { sendPasswordResetOtpEmail } from "@/lib/mail/mailer";
import { connectToDatabase } from "@/lib/db/mongodb";

// Memory fallback store for OTPs if DB is offline during testing
declare global {
  // eslint-disable-next-line no-var
  var __sajilomarts_mem_otps: Map<string, { otp: string; expiresAt: Date; email: string }> | undefined;
}
const memOtps = global.__sajilomarts_mem_otps || new Map<string, { otp: string; expiresAt: Date; email: string }>();
if (!global.__sajilomarts_mem_otps) global.__sajilomarts_mem_otps = memOtps;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await getUserByEmail(normalizedEmail);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "No account found with this email address." },
        { status: 404 }
      );
    }

    // Generate random 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to DB or Memory
    try {
      await connectToDatabase();
      // Remove any previous active OTPs for this email
      await PasswordResetOtpModel.deleteMany({ email: normalizedEmail });
      await PasswordResetOtpModel.create({
        email: normalizedEmail,
        otp,
        expiresAt,
        used: false,
      });
    } catch (dbErr) {
      console.warn("DB write for OTP failed, storing in memory fallback:", dbErr);
    }

    // Always store in memory fallback as well
    memOtps.set(normalizedEmail, { otp, expiresAt, email: normalizedEmail });

    // Send OTP email
    const mailResult = await sendPasswordResetOtpEmail(normalizedEmail, otp, user.fullName);
    if (!mailResult.success) {
      console.error("Failed to deliver OTP email:", mailResult.error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send verification code email. Please try again later.",
          details: mailResult.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "A 6-digit verification code has been sent to your email address.",
    });
  } catch (error: any) {
    console.error("Send OTP Route Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
