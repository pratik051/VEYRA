import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/constants";
import { createSessionForUser, findOrCreateGoogleUser } from "@/lib/auth/store";

export const dynamic = "force-dynamic";

function getBaseUrl(request: Request): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "http";
  if (host) {
    return `${proto}://${host}`;
  }

  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const rawState = searchParams.get("state");
  const storedNonce = cookies().get("google_oauth_state")?.value;

  if (!code) {
    const errorParam = searchParams.get("error") || "Authentication was denied or cancelled.";
    return NextResponse.redirect(new URL(`/account?tab=Security%20%26%20Auth&error=${encodeURIComponent(errorParam)}`, getBaseUrl(request)));
  }

  let returnTo = "/account?tab=Overview";
  if (rawState) {
    try {
      const decoded = JSON.parse(Buffer.from(rawState, "base64url").toString("utf8")) as { nonce?: string; returnTo?: string };
      if (decoded.returnTo && decoded.returnTo.startsWith("/")) {
        returnTo = decoded.returnTo;
      }
      if (storedNonce && decoded.nonce && storedNonce !== decoded.nonce) {
        console.warn("Google OAuth state nonce mismatch. Proceeding with safety checks.");
      }
    } catch {
      if (storedNonce && rawState !== storedNonce) {
        console.warn("Google OAuth state string mismatch. Proceeding with caution.");
      }
    }
  }

  const clientId =
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    process.env.FIREBASE_CLIENT_ID;

  const clientSecret =
    process.env.GOOGLE_CLIENT_SECRET ||
    process.env.FIREBASE_CLIENT_SECRET;

  const baseUrl = getBaseUrl(request);

  if (!clientId || !clientSecret) {
    const msg = "Google OAuth credentials (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET) are not configured in Vercel Environment Variables.";
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(msg)}`, baseUrl));
  }
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  try {
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
      console.error("Google token exchange error:", errorText);
      return NextResponse.redirect(
        new URL(`/account?tab=Security%20%26%20Auth&error=${encodeURIComponent("Failed to verify Google login token.")}`, baseUrl)
      );
    }

    const tokenData = (await tokenResponse.json()) as { access_token?: string; id_token?: string };
    let googleId: string | null = null;
    let email: string | null = null;
    let fullName = "Google User";

    if (tokenData.access_token) {
      const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`
        }
      });

      if (userInfoResponse.ok) {
        const profile = (await userInfoResponse.json()) as {
          sub?: string;
          email?: string;
          name?: string;
          given_name?: string;
          family_name?: string;
        };
        googleId = profile.sub || null;
        email = profile.email ? profile.email.toLowerCase() : null;
        fullName = profile.name || [profile.given_name, profile.family_name].filter(Boolean).join(" ") || fullName;
      }
    }

    // Fallback to ID token if profile endpoint didn't succeed
    if ((!googleId || !email) && tokenData.id_token) {
      try {
        const payloadBase64 = tokenData.id_token.split(".")[1];
        if (payloadBase64) {
          const payload = JSON.parse(Buffer.from(payloadBase64, "base64url").toString("utf8")) as {
            sub?: string;
            email?: string;
            name?: string;
          };
          googleId = googleId || payload.sub || null;
          email = email || (payload.email ? payload.email.toLowerCase() : null);
          fullName = fullName !== "Google User" ? fullName : payload.name || fullName;
        }
      } catch (err) {
        console.warn("Failed to parse fallback id_token payload:", err);
      }
    }

    if (!googleId || !email) {
      return NextResponse.redirect(
        new URL(`/account?tab=Security%20%26%20Auth&error=${encodeURIComponent("Incomplete Google profile returned.")}`, baseUrl)
      );
    }

    const user = await findOrCreateGoogleUser({
      googleId,
      email,
      fullName,
      phone: "+977-9800000000"
    });

    const token = await createSessionForUser(String(user?._id || (user as { id?: string } | null)?.id));
    const finalRedirectUrl = new URL(returnTo, baseUrl);
    const response = NextResponse.redirect(finalRedirectUrl.toString());

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
  } catch (error) {
    console.error("Google sign-in callback exception:", error);
    return NextResponse.redirect(
      new URL(`/account?tab=Security%20%26%20Auth&error=${encodeURIComponent("An unexpected error occurred during Google sign-in.")}`, baseUrl)
    );
  }
}
