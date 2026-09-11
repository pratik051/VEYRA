import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/constants";
import { createSessionForUser, findOrCreateGoogleUser } from "@/lib/auth/store";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface GoogleTokenInfo {
  sub?: string;
  user_id?: string;
  email?: string;
  name?: string;
  email_verified?: string | boolean;
  error_description?: string;
  error?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { idToken?: string };
  const idToken = body.idToken?.trim();

  if (!idToken) {
    return NextResponse.json({ error: "Google ID token is required." }, { status: 400 });
  }

  let googleId: string | null = null;
  let email: string | null = null;
  let fullName: string | null = null;

  // 1. Try Firebase Admin SDK verification if configured
  const adminAuth = getFirebaseAdminAuth();
  if (adminAuth) {
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      googleId = decoded.uid;
      email = decoded.email ? decoded.email.toLowerCase() : null;
      fullName = decoded.name || decoded.email?.split("@")[0] || "Google User";
    } catch (adminError) {
      console.warn("Firebase Admin verifyIdToken error (falling back to Google OAuth tokeninfo):", adminError);
    }
  }

  // 2. Fallback: Verify directly using Google's OAuth2 / OpenID Connect tokeninfo endpoint
  if (!googleId || !email) {
    try {
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
      if (googleRes.ok) {
        const tokenInfo = (await googleRes.json()) as GoogleTokenInfo;
        googleId = tokenInfo.sub || tokenInfo.user_id || null;
        email = tokenInfo.email ? tokenInfo.email.toLowerCase() : null;
        fullName = tokenInfo.name || (email ? email.split("@")[0] : "Google User");
      }
    } catch (fetchError) {
      console.error("Google tokeninfo verification failed:", fetchError);
    }
  }

  if (!googleId || !email) {
    return NextResponse.json(
      { error: "Unable to verify Google credentials. Please try again or check OAuth configuration." },
      { status: 401 }
    );
  }

  try {
    const user = await findOrCreateGoogleUser({
      googleId,
      email,
      fullName: fullName || "Google User",
      phone: "+977-9800000000"
    });

    if (!user?._id) {
      return NextResponse.json({ error: "Unable to create or locate account for this Google user." }, { status: 500 });
    }

    const token = await createSessionForUser(String(user._id));
    const response = NextResponse.json({
      message: "Google sign-in successful.",
      user: {
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
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
  } catch (dbError) {
    console.error("Failed to store Google user session:", dbError);
    return NextResponse.json({ error: "Database error occurred during Google sign-in." }, { status: 500 });
  }
}
