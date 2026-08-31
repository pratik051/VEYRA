import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/constants";
import { createSessionForUser, findOrCreateGoogleUser } from "@/lib/auth/store";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { idToken?: string };
  const idToken = body.idToken?.trim();

  if (!idToken) {
    return NextResponse.json({ error: "Google ID token is required." }, { status: 400 });
  }

  const adminAuth = getFirebaseAdminAuth();
  if (!adminAuth) {
    return NextResponse.json({ error: "Firebase admin is not configured." }, { status: 500 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    const email = String(decoded.email || `${decoded.uid}@firebase.local`).toLowerCase();
    const fullName = String(decoded.name || decoded.email || "Firebase User");
    const user = await findOrCreateGoogleUser({
      googleId: decoded.uid,
      email,
      fullName,
      phone: "+977-9800000000"
    });

    const token = await createSessionForUser(String(user?._id));
    const response = NextResponse.json({
      message: "Google sign-in successful.",
      user: {
        id: String(user?._id),
        fullName: user?.fullName,
        email: user?.email,
        phone: user?.phone,
        role: user?.role
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
  } catch (error) {
    console.error("Firebase token verification failed", error);
    return NextResponse.json({ error: "Unable to verify Google sign-in." }, { status: 401 });
  }
}
