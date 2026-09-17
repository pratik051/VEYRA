import { randomUUID } from "node:crypto";
import UserModel from "../models/user-model.js";
import AuthSessionModel from "../models/auth-session-model.js";
import PasswordResetTokenModel from "../models/password-reset-token-model.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function seedAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    return;
  }
  try {
    const passwordHash = await hashPassword(adminPassword);
    const existingAdmin = await UserModel.findOne({
      $or: [
        { email: adminEmail },
        { email: "admin@sajilomarts.tech" },
        { role: "admin" }
      ]
    });

    if (!existingAdmin) {
      await UserModel.create({
        fullName: "SAJILOMARTS Admin",
        email: adminEmail,
        phone: "9800000000",
        passwordHash,
        role: "admin"
      });
      console.log("[Admin Seeded successfully]:", adminEmail);
    } else {
      await UserModel.updateOne(
        { _id: existingAdmin._id },
        {
          $set: {
            email: adminEmail,
            role: "admin",
            passwordHash
          }
        }
      );
      console.log("[Admin Synchronized successfully]:", adminEmail);
    }
  } catch (error) {
    console.warn("Failed to seed/sync admin:", error.message);
  }
}

export async function getUserByEmail(email) {
  await seedAdmin();
  const normalizedEmail = (email || "").toLowerCase().trim();
  
  if (normalizedEmail === "admin" || normalizedEmail.startsWith("admin@")) {
    const adminUser = await UserModel.findOne({
      $or: [
        { role: "admin" },
        { email: normalizedEmail },
        { email: "admin@sajilomarts.com" },
        { email: "admin@sajilomarts.tech" }
      ]
    }).lean();
    if (adminUser) return adminUser;
  }
  
  return await UserModel.findOne({ email: normalizedEmail }).lean();
}

export async function createUser(input) {
  await seedAdmin();
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
  await seedAdmin();
  const normalizedEmail = input.email.trim().toLowerCase();
  const fallbackPhone = input.phone || "+977-9800000000";
  const existing = await UserModel.findOne({
    $or: [{ googleId: input.googleId }, { email: normalizedEmail }]
  }).lean();

  if (existing) {
    const updates = {
      fullName: existing.fullName || input.fullName,
      email: normalizedEmail,
      authProvider: "google",
      googleId: existing.googleId || input.googleId,
      passwordHash: existing.passwordHash || "google-oauth"
    };
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
