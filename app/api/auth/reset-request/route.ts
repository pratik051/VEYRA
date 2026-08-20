import { NextResponse } from "next/server";
import { createResetToken, getUserByEmail } from "@/lib/auth/store";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string };
  const email = body.email?.trim().toLowerCase() || "";
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  const user = await getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ message: "If an account exists, password reset instructions have been created." });
  }
  const resetToken = await createResetToken(String(user._id));
  return NextResponse.json({
    message: "Password reset token generated. Connect this flow to email/SMS delivery in production.",
    resetToken
  });
}
