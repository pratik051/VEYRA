import { randomUUID } from "node:crypto";
import UserModel from "../models/user-model.js";
import AuthSessionModel from "../models/auth-session-model.js";
import PasswordResetTokenModel from "../models/password-reset-token-model.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

let adminSeeded = false;

export async function seedAdmin() {
  if (adminSeeded) return;
  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    return;
  }
  try {
    const passwordHash = await hashPassword(adminPassword);
    // Strictly find the admin by their specific admin email only!
    // NEVER match generic { role: "admin" } which causes account collisions/overwrites.
    const existingAdmin = await UserModel.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await UserModel.create({
        fullName: "SAJILOMARTS Admin",
        email: adminEmail,
        phone: "9800000000",
        passwordHash,
        role: "admin"
      });
      console.log("[Admin Initialized]:", adminEmail);
    } else {
      await UserModel.updateOne(
        { _id: existingAdmin._id },
        {
          $set: {
            role: "admin",
            passwordHash
          }
        }
      );
      console.log("[Admin Verified]:", adminEmail);
    }
    adminSeeded = true;
  } catch (error) {
    console.warn("Failed to seed/sync admin:", error.message);
  }
}

export async function getUserByEmail(email) {
  const normalizedEmail = (email || "").toLowerCase().trim();
  if (!normalizedEmail) return null;

  // 1. Match exact email first
  let user = await UserModel.findOne({ email: normalizedEmail }).lean();
  if (user) return user;

  // 2. If entered username 'admin', match configured admin
  if (normalizedEmail === "admin") {
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@sajilomarts.com").toLowerCase();
    user = await UserModel.findOne({ email: adminEmail }).lean();
    if (!user) {
      user = await UserModel.findOne({ role: "admin" }).lean();
    }
    return user;
  }

  return null;
}

export async function createUser(input) {
  const email = input.email.toLowerCase().trim();
  const existing = await UserModel.findOne({ email }).lean();
  if (existing) return null;
  const created = await UserModel.create({
    fullName: input.fullName,
    email,
    phone: input.phone,
    passwordHash: input.passwordHash,
    role: input.role || "customer",
    authProvider: input.authProvider || "local",
    googleId: input.googleId,
    appleId: input.appleId,
    firebaseUid: input.firebaseUid
  });
  return created.toObject ? created.toObject() : created;
}

export async function findOrCreateGoogleUser(input) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const fallbackPhone = input.phone || "+977-9800000000";

  const existing = await UserModel.findOne({
    $or: [
      ...(input.googleId ? [{ googleId: input.googleId }] : []),
      { email: normalizedEmail }
    ]
  }).lean();

  if (existing) {
    const updates = {
      fullName: existing.fullName || input.fullName,
      email: normalizedEmail,
      authProvider: "google"
    };
    if (input.googleId) updates.googleId = input.googleId;
    if (!existing.passwordHash) updates.passwordHash = "google-oauth";
    if (!existing.phone && fallbackPhone) updates.phone = fallbackPhone;

    await UserModel.updateOne({ _id: existing._id }, { $set: updates });
    return await UserModel.findById(existing._id).lean();
  }

  const created = await UserModel.create({
    fullName: input.fullName,
    email: normalizedEmail,
    phone: fallbackPhone,
    passwordHash: "google-oauth",
    authProvider: "google",
    googleId: input.googleId,
    role: "customer"
  });

  return created.toObject ? created.toObject() : created;
}

export async function findOrCreateAppleUser(input) {
  const normalizedEmail = input.email ? input.email.trim().toLowerCase() : undefined;
  const fallbackPhone = input.phone || "+977-9800000000";

  const queryConditions = [];
  if (input.appleId) queryConditions.push({ appleId: input.appleId });
  if (input.firebaseUid) queryConditions.push({ firebaseUid: input.firebaseUid });
  if (normalizedEmail) queryConditions.push({ email: normalizedEmail });

  let existing = null;
  if (queryConditions.length > 0) {
    existing = await UserModel.findOne({ $or: queryConditions }).lean();
  }

  if (existing) {
    const updates = {
      fullName: existing.fullName || input.fullName || "Apple Customer",
      authProvider: "apple"
    };
    if (input.appleId) updates.appleId = input.appleId;
    if (input.firebaseUid) updates.firebaseUid = input.firebaseUid;
    if (normalizedEmail) updates.email = normalizedEmail;
    if (!existing.phone && fallbackPhone) updates.phone = fallbackPhone;

    await UserModel.updateOne({ _id: existing._id }, { $set: updates });
    return await UserModel.findById(existing._id).lean();
  }

  const created = await UserModel.create({
    fullName: input.fullName || "Apple Customer",
    email: normalizedEmail || `apple_${(input.appleId || input.firebaseUid || randomUUID()).slice(0, 8)}@sajilomarts.internal`,
    phone: fallbackPhone,
    passwordHash: "apple-oauth",
    authProvider: "apple",
    appleId: input.appleId,
    firebaseUid: input.firebaseUid,
    role: "customer"
  });

  return created.toObject ? created.toObject() : created;
}

export async function findOrCreatePhoneUser(input) {
  const cleanPhone = (input.phone || "").trim();
  const normalizedEmail = input.email ? input.email.trim().toLowerCase() : undefined;

  const queryConditions = [{ phone: cleanPhone }];
  if (input.firebaseUid) queryConditions.push({ firebaseUid: input.firebaseUid });
  if (normalizedEmail) queryConditions.push({ email: normalizedEmail });

  const existing = await UserModel.findOne({ $or: queryConditions }).lean();

  if (existing) {
    const updates = {
      fullName: existing.fullName || input.fullName || `Customer (${cleanPhone})`,
      authProvider: "phone"
    };
    if (input.firebaseUid) updates.firebaseUid = input.firebaseUid;
    if (normalizedEmail && !existing.email) updates.email = normalizedEmail;

    await UserModel.updateOne({ _id: existing._id }, { $set: updates });
    return await UserModel.findById(existing._id).lean();
  }

  const created = await UserModel.create({
    fullName: input.fullName || `Customer (${cleanPhone})`,
    email: normalizedEmail || `phone_${cleanPhone.replace(/[^0-9]/g, "")}@sajilomarts.internal`,
    phone: cleanPhone,
    passwordHash: "firebase-phone-auth",
    authProvider: "phone",
    firebaseUid: input.firebaseUid,
    role: "customer"
  });

  return created.toObject ? created.toObject() : created;
}

export async function createSessionForUser(userId) {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  await AuthSessionModel.create({ token, userId, expiresAt });
  return token;
}

export async function deleteSessionByToken(token) {
  await AuthSessionModel.deleteOne({ token });
}

export async function getSessionUserByToken(token) {
  if (!token || token === "null" || token === "undefined") return null;
  const session = await AuthSessionModel.findOne({ token }).lean();
  if (session && new Date(session.expiresAt).getTime() > Date.now()) {
    const user = await UserModel.findById(session.userId).lean();
    if (user) {
      return {
        _id: String(user._id),
        fullName: String(user.fullName),
        email: String(user.email || ""),
        phone: String(user.phone || ""),
        role: user.role === "admin" ? "admin" : "customer",
        province: String(user.province || ""),
        district: String(user.district || ""),
        city: String(user.city || ""),
        ward: String(user.ward || ""),
        fullAddress: String(user.fullAddress || ""),
        landmark: String(user.landmark || "")
      };
    }
  }
  return null;
}

export async function updatePasswordByUserId(userId, passwordHash) {
  const result = await UserModel.updateOne({ _id: userId }, { $set: { passwordHash } });
  return result.modifiedCount > 0 || result.matchedCount > 0;
}

export async function updateUserProfileById(userId, input) {
  const updates = {};
  if (input.fullName) updates.fullName = input.fullName.trim();
  if (input.phone) updates.phone = input.phone.trim();
  if (input.province !== undefined) updates.province = input.province.trim();
  if (input.district !== undefined) updates.district = input.district.trim();
  if (input.city !== undefined) updates.city = input.city.trim();
  if (input.ward !== undefined) updates.ward = input.ward.trim();
  if (input.fullAddress !== undefined) updates.fullAddress = input.fullAddress.trim();
  if (input.landmark !== undefined) updates.landmark = input.landmark.trim();

  if (Object.keys(updates).length > 0) {
    await UserModel.updateOne({ _id: userId }, { $set: updates });
    return await UserModel.findById(userId).lean();
  }
  return await UserModel.findById(userId).lean();
}
