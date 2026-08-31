import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/constants";
import { refreshSessionByToken } from "@/lib/auth/store";

export async function POST() {
  const currentToken = cookies().get(AUTH_COOKIE_NAME)?.value;
  if (!currentToken) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const refreshed = await refreshSessionByToken(currentToken);
  if (!refreshed) {
    const unauthorized = NextResponse.json({ error: "Session expired or invalid." }, { status: 401 });
    unauthorized.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0
    });
    return unauthorized;
  }

  const response = NextResponse.json({
    message: "Session refreshed.",
    user: {
      id: refreshed.user._id,
      fullName: refreshed.user.fullName,
      email: refreshed.user.email,
      role: refreshed.user.role
    }
  });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: refreshed.token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  });
  return response;
}
