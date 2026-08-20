import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { deleteSessionByToken } from "@/lib/auth/store";

export async function POST() {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  if (token) {
    await deleteSessionByToken(token);
  }
  const response = NextResponse.json({ message: "Logged out successfully." });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  return response;
}
