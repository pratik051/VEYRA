import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { AUTH_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/constants";
import { createSessionForUser, createUser, getUserByEmail } from "@/lib/auth/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      fullName?: string;
      email?: string;
      phone?: string;
      password?: string;
    };

    const fullName = body.fullName?.trim() || "";
    const email = body.email?.trim().toLowerCase() || "";
    const phone = body.phone?.trim() || "";
    const password = body.password || "";

    if (!fullName || !email || !phone || !password) {
      return NextResponse.json({ error: "Full name, email, phone and password are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Email is already registered. Please sign in instead." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ fullName, email, phone, passwordHash });
    if (!user) {
      return NextResponse.json({ error: "Unable to create account. Please try again." }, { status: 500 });
    }

    const token = await createSessionForUser(String(user._id));

    const response = NextResponse.json({
      message: "Account created successfully.",
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
    console.error("Registration failed:", error);
    const msg = error instanceof Error ? error.message : "Registration failed.";
    if (msg.includes("MONGODB") || msg.includes("connect") || msg.includes("Mongo") || msg.includes("topology")) {
      return NextResponse.json(
        { error: "Database connection failed. Please check MONGODB_URI configuration and database network access." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
