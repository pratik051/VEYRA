import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/constants";
import {
  createSessionForUser,
  findOrCreateGoogleUser,
  findOrCreateAppleUser,
  findOrCreatePhoneUser
} from "@/lib/auth/store";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBu4-U7nZ0GAMT_OQVSvs9xsU7gt9mN1Pk";

interface FirebaseLookupUser {
  localId: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  photoUrl?: string;
  providerUserInfo?: Array<{
    providerId: string;
    rawId?: string;
    email?: string;
    displayName?: string;
    phoneNumber?: string;
  }>;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    idToken?: string;
    provider?: string;
    fullName?: string;
    phone?: string;
    email?: string;
  };

  const idToken = body.idToken?.trim();

  if (!idToken) {
    return NextResponse.json({ error: "Firebase ID token is required." }, { status: 400 });
  }

  let uid: string | null = null;
  let email: string | null = body.email ? body.email.toLowerCase().trim() : null;
  let phone: string | null = body.phone ? body.phone.trim() : null;
  let fullName: string | null = body.fullName?.trim() || null;
  let detectedProvider: "google" | "apple" | "phone" | string = body.provider || "google";

  // 1. Try Firebase Admin SDK verification first
  const adminAuth = getFirebaseAdminAuth();
  if (adminAuth) {
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      uid = decoded.uid;
      if (decoded.email) email = decoded.email.toLowerCase().trim();
      if (decoded.phone_number) phone = decoded.phone_number.trim();
      if (decoded.name) fullName = decoded.name;

      const signInProvider = decoded.firebase?.sign_in_provider || "";
      if (signInProvider.includes("apple")) {
        detectedProvider = "apple";
      } else if (signInProvider.includes("phone")) {
        detectedProvider = "phone";
      } else if (signInProvider.includes("google")) {
        detectedProvider = "google";
      }
    } catch (adminError) {
      console.warn("Firebase Admin verifyIdToken error, falling back to lookup API:", adminError);
    }
  }

  // 2. Fallback: Verify token with Firebase Identity Toolkit endpoint
  if (!uid) {
    try {
      const lookupRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken })
        }
      );

      if (lookupRes.ok) {
        const lookupData = (await lookupRes.json()) as { users?: FirebaseLookupUser[] };
        const fbUser = lookupData.users?.[0];
        if (fbUser) {
          uid = fbUser.localId;
          if (fbUser.email) email = fbUser.email.toLowerCase().trim();
          if (fbUser.phoneNumber) phone = fbUser.phoneNumber.trim();
          if (fbUser.displayName && !fullName) fullName = fbUser.displayName;

          const prov = fbUser.providerUserInfo?.[0]?.providerId || "";
          if (prov.includes("apple") || body.provider === "apple") {
            detectedProvider = "apple";
          } else if (prov.includes("phone") || fbUser.phoneNumber || body.provider === "phone") {
            detectedProvider = "phone";
          } else if (prov.includes("google") || body.provider === "google") {
            detectedProvider = "google";
          }
        }
      }
    } catch (lookupErr) {
      console.warn("Firebase Identity Toolkit lookup error:", lookupErr);
    }
  }

  // 3. Fallback for Google OAuth Tokeninfo
  if (!uid && (detectedProvider === "google" || !detectedProvider)) {
    try {
      const googleRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
      );
      if (googleRes.ok) {
        const tokenInfo = (await googleRes.json()) as {
          sub?: string;
          user_id?: string;
          email?: string;
          name?: string;
        };
        uid = tokenInfo.sub || tokenInfo.user_id || null;
        if (tokenInfo.email) email = tokenInfo.email.toLowerCase().trim();
        if (tokenInfo.name && !fullName) fullName = tokenInfo.name;
        detectedProvider = "google";
      }
    } catch (googleErr) {
      console.warn("Google tokeninfo fallback error:", googleErr);
    }
  }

  if (!uid) {
    return NextResponse.json(
      { error: "Unable to verify Firebase authentication credentials. Please try again." },
      { status: 401 }
    );
  }

  try {
    let user: any = null;

    if (detectedProvider === "apple") {
      user = await findOrCreateAppleUser({
        appleId: uid,
        email: email || undefined,
        fullName: fullName || "Apple Customer",
        phone: phone || "+977-9800000000",
        firebaseUid: uid
      });
    } else if (detectedProvider === "phone" || (!email && phone)) {
      const validPhone = phone || body.phone || "+977-9800000000";
      user = await findOrCreatePhoneUser({
        phone: validPhone,
        firebaseUid: uid,
        fullName: fullName || `Customer (${validPhone})`,
        email: email || undefined
      });
    } else {
      // Default to Google / Email Auth
      user = await findOrCreateGoogleUser({
        googleId: uid,
        email: email || `user_${uid.slice(0, 8)}@linkova.internal`,
        fullName: fullName || "Google User",
        phone: phone || "+977-9800000000"
      });
    }

    if (!user?._id) {
      return NextResponse.json(
        { error: "Unable to create or locate account for this user." },
        { status: 500 }
      );
    }

    const token = await createSessionForUser(String(user._id));
    const response = NextResponse.json({
      message: `${detectedProvider.toUpperCase()} authentication successful.`,
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
    console.error("Failed to store Firebase user session:", dbError);
    return NextResponse.json(
      { error: "Database error occurred during authentication." },
      { status: 500 }
    );
  }
}
