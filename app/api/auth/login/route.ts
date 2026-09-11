import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { AUTH_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/constants";
import { createSessionForUser, getUserByEmail } from "@/lib/auth/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase() || "";
    const password = body.password || "";
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await createSessionForUser(String(user._id));

    const response = NextResponse.json({
      message: "Login successful.",
      user: { id: String(user._id), fullName: user.fullName, email: user.email, phone: user.phone, role: user.role }
    });
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS
    });
    return response;
  } catch (error: unknown) {
    console.error("Login failed:", error);
    const msg = error instanceof Error ? error.message : "Login failed.";
    if (msg.includes("MONGODB") || msg.includes("connect") || msg.includes("Mongo") || msg.includes("topology")) {
      return NextResponse.json(
        { error: "Database connection failed. Please check MONGODB_URI configuration and database network access." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
