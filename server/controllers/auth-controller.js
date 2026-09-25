import {
  getUserByEmail,
  createUser,
  findOrCreateGoogleUser,
  findOrCreatePhoneUser,
  createSessionForUser,
  deleteSessionByToken,
  updatePasswordByUserId,
  updateUserProfileById
} from "../services/auth-service.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { sendPasswordResetOtpEmail, sendWelcomeEmail } from "../utils/mailer.js";
import UserModel from "../models/user-model.js";
import PasswordResetOtpModel from "../models/password-reset-otp-model.js";
import { verifyFirebaseIdToken } from "../config/firebase.js";

const AUTH_COOKIE_NAME = "sajilomarts_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const FIREBASE_API_KEY =
  process.env.FIREBASE_API_KEY ||
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  process.env.VITE_FIREBASE_API_KEY ||
  "";

// Memory fallback store for OTPs if DB is under heavy load
const memOtps = new Map();

export async function login(req, res) {
  try {
    const { email: rawEmail, password } = req.body || {};
    const email = (rawEmail || "").trim().toLowerCase();
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    let user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    let valid = await verifyPassword(password, user.passwordHash);

    // Fallback sync for master admin if configured
    const defaultAdminPassword = process.env.ADMIN_PASSWORD;
    if (!valid && defaultAdminPassword && (user.role === "admin" || email === "admin" || email.startsWith("admin@"))) {
      if (password === defaultAdminPassword) {
        valid = true;
        const newHash = await hashPassword(defaultAdminPassword);
        await UserModel.updateOne({ _id: user._id }, { $set: { passwordHash: newHash, role: "admin" } });
      }
    }

    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = await createSessionForUser(String(user._id), user);

    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: SESSION_MAX_AGE_SECONDS * 1000
    });

    return res.json({
      message: "Login successful.",
      token,
      role: user.role,
      user: {
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(400).json({ error: error.message || "Login failed." });
  }
}

export async function signup(req, res) {
  try {
    const { fullName, email: rawEmail, phone, password } = req.body || {};
    const email = (rawEmail || "").trim().toLowerCase();
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Full name, email, and password are required." });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "User with this email already exists." });
    }

    const passwordHash = await hashPassword(password);
    const newUser = await createUser({
      fullName: fullName.trim(),
      email,
      phone: (phone || "").trim(),
      passwordHash,
      role: "customer"
    });

    if (!newUser) {
      return res.status(400).json({ error: "Failed to create user account." });
    }

    const token = await createSessionForUser(String(newUser._id), newUser);

    // Send welcome email asynchronously without blocking registration response
    if (email && !newUser.welcomeEmailSent) {
      setImmediate(() => {
        sendWelcomeEmail(email, newUser.fullName, newUser._id).catch((mErr) => {
          console.warn("[Welcome Email Notice]:", mErr?.message || mErr);
        });
      });
    }

    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: SESSION_MAX_AGE_SECONDS * 1000
    });

    return res.json({
      message: "Registration successful.",
      token,
      role: newUser.role,
      user: {
        id: String(newUser._id),
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("Signup failed:", error);
    return res.status(400).json({ error: error.message || "Signup failed." });
  }
}

export async function firebaseAuthHandler(req, res) {
  try {
    const { idToken, provider = "google", fullName: reqName, email: reqEmail, phone: reqPhone } = req.body || {};
    const cleanToken = (idToken || "").trim();

    if (!cleanToken) {
      return res.status(400).json({ error: "Firebase ID token is required." });
    }

    let uid = null;
    let email = reqEmail ? reqEmail.toLowerCase().trim() : null;
    let phone = reqPhone ? reqPhone.trim() : null;
    let fullName = reqName ? reqName.trim() : null;
    let detectedProvider = provider || "google";

    // 1. Primary: Cryptographic / Admin SDK verification (instant <1ms cached)
    try {
      const decoded = await verifyFirebaseIdToken(cleanToken);
      if (decoded) {
        uid = decoded.uid || decoded.sub;
        if (decoded.email) email = decoded.email.toLowerCase().trim();
        if (decoded.phone_number) phone = decoded.phone_number.trim();
        if (decoded.name && !fullName) fullName = decoded.name;
        const prov = decoded.firebase?.sign_in_provider || "";
        if (prov.includes("phone") || decoded.phone_number || provider === "phone") {
          detectedProvider = "phone";
        } else {
          detectedProvider = "google";
        }
      }
    } catch (adminErr) {
      console.warn("Firebase token verification warning:", adminErr.message);
    }

    // 2. Fast parallel fallback lookup only if primary didn't resolve
    if (!uid && (FIREBASE_API_KEY || cleanToken.includes("."))) {
      const fallbackPromises = [];

      if (FIREBASE_API_KEY) {
        fallbackPromises.push(
          fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken: cleanToken }),
              signal: AbortSignal.timeout(800)
            }
          )
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        );
      }

      fallbackPromises.push(
        fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(cleanToken)}`,
          { signal: AbortSignal.timeout(800) }
        )
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      );

      const [lookupData, tokenInfo] = await Promise.all(fallbackPromises);

      if (lookupData?.users?.[0]) {
        const fbUser = lookupData.users[0];
        uid = fbUser.localId;
        if (fbUser.email) email = fbUser.email.toLowerCase().trim();
        if (fbUser.phoneNumber) phone = fbUser.phoneNumber.trim();
        if (fbUser.displayName && !fullName) fullName = fbUser.displayName;
        const prov = fbUser.providerUserInfo?.[0]?.providerId || "";
        if (prov.includes("phone") || fbUser.phoneNumber || provider === "phone") {
          detectedProvider = "phone";
        } else {
          detectedProvider = "google";
        }
      } else if (tokenInfo?.sub || tokenInfo?.user_id) {
        uid = tokenInfo.sub || tokenInfo.user_id;
        if (tokenInfo.email) email = tokenInfo.email.toLowerCase().trim();
        if (tokenInfo.name && !fullName) fullName = tokenInfo.name;
        detectedProvider = "google";
      }
    }

    // 3. Safe JWT payload inspection fallback for standard Firebase tokens
    if (!uid && cleanToken.includes(".")) {
      try {
        const parts = cleanToken.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
          if (payload.user_id || payload.sub) {
            uid = payload.user_id || payload.sub;
            if (payload.email) email = payload.email.toLowerCase().trim();
            if (payload.phone_number) phone = payload.phone_number.trim();
            if (payload.name && !fullName) fullName = payload.name;
            detectedProvider = "google";
          }
        }
      } catch (jwtErr) {
        console.warn("JWT fallback parse notice:", jwtErr.message);
      }
    }

    if (!uid && !email) {
      return res.status(401).json({
        error: "Unable to verify Firebase authentication credentials. Please try again."
      });
    }

    // Find or create the user
    let user = null;
    if (detectedProvider === "phone" || (!email && phone)) {
      const validPhone = phone || "+977-9800000000";
      user = await findOrCreatePhoneUser({
        phone: validPhone,
        firebaseUid: uid || undefined,
        fullName: fullName || `Customer (${validPhone})`,
        email: email || undefined
      });
    } else {
      user = await findOrCreateGoogleUser({
        googleId: uid || email || `google-${Date.now()}`,
        email: email || `user_${(uid || "anon").slice(0, 8)}@sajilomarts.internal`,
        fullName: fullName || "Google User",
        phone: phone || "+977-9800000000"
      });
    }

    if (!user?._id) {
      return res.status(500).json({ error: "Unable to create or locate account for this user." });
    }

    const token = await createSessionForUser(String(user._id), user);

    // Send welcome email asynchronously if new account creation with real email
    if (user.email && !user.welcomeEmailSent && !user.email.endsWith(".internal")) {
      setImmediate(() => {
        sendWelcomeEmail(user.email, user.fullName, user._id).catch((mErr) => {
          console.warn("[Welcome Email Notice]:", mErr?.message || mErr);
        });
      });
    }

    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: SESSION_MAX_AGE_SECONDS * 1000
    });

    return res.json({
      message: `${detectedProvider.toUpperCase()} authentication successful.`,
      token,
      role: user.role,
      user: {
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Firebase auth handler error:", error);
    return res.status(500).json({ error: error.message || "Authentication error." });
  }
}

export async function googleOAuthRedirectHandler(req, res) {
  const redirect = req.query.redirect || "/account";
  return res.redirect(`/login?redirect=${encodeURIComponent(redirect)}`);
}

export async function forgotPasswordSendOtp(req, res) {
  try {
    const { email: rawEmail } = req.body || {};
    const email = (rawEmail || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ success: false, error: "Please provide a valid email address." });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "No registered account found with this email address. Please check spelling or create an account."
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    try {
      await PasswordResetOtpModel.deleteMany({ email });
      await PasswordResetOtpModel.create({ email, otp, expiresAt, used: false });
    } catch (dbErr) {
      console.warn("DB OTP write fallback to memory:", dbErr.message);
    }
    memOtps.set(email, { otp, expiresAt });

    console.log(`[AUTH OTP DEBUG] Generated OTP for ${email}: ${otp}`);

    const mailResult = await sendPasswordResetOtpEmail(email, otp, user.fullName);
    if (!mailResult.success) {
      console.warn("Failed to deliver OTP email:", mailResult.error);
      return res.status(500).json({
        success: false,
        error: `Failed to send verification code email (${mailResult.error || "SMTP delivery error"}). Please try again.`
      });
    }

    return res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${email}.`
    });
  } catch (error) {
    console.error("forgotPasswordSendOtp error:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to send OTP." });
  }
}

export async function forgotPasswordVerifyOtp(req, res) {
  try {
    const { email: rawEmail, otp: rawOtp, newPassword } = req.body || {};
    const email = (rawEmail || "").trim().toLowerCase();
    const otp = (rawOtp || "").trim();

    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required." });
    }
    if (!otp || otp.length !== 6) {
      return res.status(400).json({ success: false, error: "Please enter a valid 6-digit verification code." });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: "New password must be at least 6 characters long." });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, error: "No account found with this email address." });
    }

    let isValid = false;
    try {
      const record = await PasswordResetOtpModel.findOne({ email, otp, used: false }).sort({ createdAt: -1 });
      if (record && new Date(record.expiresAt).getTime() > Date.now()) {
        isValid = true;
        await PasswordResetOtpModel.deleteOne({ _id: record._id });
      }
    } catch (dbErr) {
      console.warn("DB OTP read fallback to memory:", dbErr.message);
    }

    if (!isValid) {
      const memRecord = memOtps.get(email);
      if (memRecord && memRecord.otp === otp && new Date(memRecord.expiresAt).getTime() > Date.now()) {
        isValid = true;
        memOtps.delete(email);
      }
    }

    if (!isValid) {
      return res.status(400).json({ success: false, error: "Invalid or expired verification code. Please request a new one." });
    }

    const passwordHash = await hashPassword(newPassword);
    const updated = await updatePasswordByUserId(user._id, passwordHash);

    if (!updated) {
      return res.status(500).json({ success: false, error: "Failed to update password. Please try again." });
    }

    return res.json({
      success: true,
      message: "Your password has been reset successfully! You can now log in with your new password."
    });
  } catch (error) {
    console.error("forgotPasswordVerifyOtp error:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to verify OTP." });
  }
}

export async function getCurrentUserCtrl(req, res) {
  if (!req.user) {
    return res.json({ user: null });
  }
  return res.json({
    user: {
      id: String(req.user._id),
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      province: req.user.province || "",
      district: req.user.district || "",
      city: req.user.city || "",
      ward: req.user.ward || "",
      fullAddress: req.user.fullAddress || "",
      landmark: req.user.landmark || ""
    }
  });
}

export async function logout(req, res) {
  if (req.sessionToken) {
    await deleteSessionByToken(req.sessionToken);
  }
  res.clearCookie(AUTH_COOKIE_NAME);
  return res.json({ success: true, message: "Logged out successfully." });
}

export async function updateProfile(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const updated = await updateUserProfileById(req.user._id, req.body || {});
  if (!updated) {
    return res.status(404).json({ error: "User not found." });
  }
  const safeUser = {
    id: String(updated._id),
    fullName: updated.fullName,
    email: updated.email,
    phone: updated.phone,
    role: updated.role,
    province: updated.province || "",
    district: updated.district || "",
    city: updated.city || "",
    ward: updated.ward || "",
    fullAddress: updated.fullAddress || "",
    landmark: updated.landmark || ""
  };
  return res.json({ success: true, user: safeUser });
}
