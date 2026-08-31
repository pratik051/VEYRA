import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/constants";
import { createSessionForUser, findOrCreateGoogleUser } from "@/lib/auth/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = cookies().get("google_oauth_state")?.value;

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.json({ error: "Invalid Google sign-in request." }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Google sign-in is not configured yet." }, { status: 500 });
  }

  const redirectUri = `${new URL(request.url).origin}/api/auth/google/callback`;
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    }).toString()
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    return NextResponse.json({ error: "Unable to complete Google sign-in.", details: errorText }, { status: 400 });
  }

  const tokenData = (await tokenResponse.json()) as { access_token?: string; id_token?: string };
  if (!tokenData.access_token) {
    return NextResponse.json({ error: "No access token returned from Google." }, { status: 400 });
  }

  const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  });

  if (!userInfoResponse.ok) {
    return NextResponse.json({ error: "Unable to fetch Google profile information." }, { status: 400 });
  }

  const profile = (await userInfoResponse.json()) as {
    sub?: string;
    email?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
  };

  if (!profile.sub || !profile.email) {
    return NextResponse.json({ error: "Google profile was incomplete." }, { status: 400 });
  }

  const fullName = profile.name || [profile.given_name, profile.family_name].filter(Boolean).join(" ") || "Google User";
  const user = await findOrCreateGoogleUser({
    googleId: profile.sub,
    email: profile.email,
    fullName,
    phone: "+977-9800000000"
  });

  const token = await createSessionForUser(String(user?._id || (user as { id?: string } | null)?.id));
  const redirectUrl = new URL("/account?tab=Overview", new URL(request.url).origin);
  const response = NextResponse.redirect(redirectUrl.toString());

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  });

  response.cookies.set({
    name: "google_oauth_state",
    value: "",
    path: "/",
    maxAge: 0
  });

  return response;
}
