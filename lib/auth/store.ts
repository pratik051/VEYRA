import { randomUUID } from "node:crypto";
import { connectToDatabase } from "@/lib/db/mongodb";
import { hashPassword } from "@/lib/auth/password";
import { SESSION_MAX_AGE_SECONDS } from "@/lib/auth/constants";
import { UserRole } from "@/lib/auth/types";
import { UserModel } from "@/lib/models/user-model";
import { AuthSessionModel } from "@/lib/models/auth-session-model";
import { PasswordResetTokenModel } from "@/lib/models/password-reset-token-model";

export type AuthUser = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  passwordHash: string;
  province?: string;
  district?: string;
  city?: string;
  ward?: string;
  fullAddress?: string;
  landmark?: string;
};

async function seedAdmin() {
  await connectToDatabase();
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@veyra.com").toLowerCase();
  const existingAdmin = await UserModel.findOne({ email: adminEmail }).lean();
  if (existingAdmin) return;
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
  const passwordHash = await hashPassword(adminPassword);
  await UserModel.create({
    fullName: "VEYRA Admin",
    email: adminEmail,
    phone: "9800000000",
    passwordHash,
    role: "admin"
  });
}

export async function getUserByEmail(email: string) {
  await seedAdmin();
  return UserModel.findOne<AuthUser>({ email: email.toLowerCase() }).lean();
}

export async function createUser(input: {
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role?: UserRole;
  authProvider?: "local" | "google";
  googleId?: string;
}) {
  await seedAdmin();
  const email = input.email.toLowerCase();
  const existing = await UserModel.findOne({ email }).lean();
  if (existing) return null;
  return UserModel.create({
    fullName: input.fullName,
    email,
    phone: input.phone,
    passwordHash: input.passwordHash,
    role: input.role || "customer",
    authProvider: input.authProvider || "local",
    googleId: input.googleId
  });
}

export async function findOrCreateGoogleUser(input: {
  googleId: string;
  email: string;
  fullName: string;
  phone?: string;
}) {
  await seedAdmin();
  const normalizedEmail = input.email.trim().toLowerCase();
  const fallbackPhone = input.phone || "+977-9800000000";

  const existing = await UserModel.findOne({
    $or: [{ googleId: input.googleId }, { email: normalizedEmail }]
  }).lean();

  if (existing) {
    const existingUser = existing as {
      _id: string;
      fullName?: string;
      phone?: string;
      googleId?: string;
      passwordHash?: string;
    };

    const updates: Record<string, unknown> = {
      fullName: existingUser.fullName || input.fullName,
      email: normalizedEmail,
      authProvider: "google",
      googleId: existingUser.googleId || input.googleId,
      passwordHash: existingUser.passwordHash || "google-oauth"
    };

    if (!existingUser.phone && fallbackPhone) updates.phone = fallbackPhone;

    await UserModel.updateOne({ _id: existingUser._id }, { $set: updates });
    return UserModel.findById(existingUser._id).lean();
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

export async function createSessionForUser(userId: string) {
  await connectToDatabase();
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  await AuthSessionModel.create({ token, userId, expiresAt });
  return token;
}

export async function refreshSessionByToken(token: string) {
  await connectToDatabase();
  const session = await AuthSessionModel.findOne<{ _id: string; userId: string; expiresAt: Date }>({ token }).lean();
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await AuthSessionModel.deleteOne({ token });
    return null;
  }
  const user = await UserModel.findById(session.userId).lean();
  if (!user || Array.isArray(user)) return null;

  const newToken = randomUUID();
  const newExpiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  await AuthSessionModel.updateOne(
    { _id: session._id },
    { token: newToken, expiresAt: newExpiresAt }
  );

  const authUser: AuthUser = {
    _id: String(user._id),
    fullName: String(user.fullName),
    email: String(user.email),
    phone: String(user.phone),
    role: user.role === "admin" ? "admin" : "customer",
    passwordHash: String(user.passwordHash)
  };

  return { token: newToken, user: authUser };
}

export async function deleteSessionByToken(token: string) {
  await connectToDatabase();
  await AuthSessionModel.deleteOne({ token });
}

export async function getSessionUserByToken(token: string): Promise<AuthUser | null> {
  await connectToDatabase();
  const session = await AuthSessionModel.findOne<{ userId: string; expiresAt: Date }>({ token }).lean();
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await AuthSessionModel.deleteOne({ token });
    return null;
  }
  const user = await UserModel.findById(session.userId).lean();
  if (!user || Array.isArray(user)) return null;
  return {
    _id: String(user._id),
    fullName: String(user.fullName),
    email: String(user.email),
    phone: String(user.phone),
    role: user.role === "admin" ? "admin" : "customer",
    passwordHash: String(user.passwordHash),
    province: String(user.province || ""),
    district: String(user.district || ""),
    city: String(user.city || ""),
    ward: String(user.ward || ""),
    fullAddress: String(user.fullAddress || ""),
    landmark: String(user.landmark || "")
  };
}

export async function createResetToken(userId: string) {
  await connectToDatabase();
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
  await PasswordResetTokenModel.create({ token, userId, expiresAt });
  return token;
}

export async function consumeResetToken(token: string) {
  await connectToDatabase();
  const item = await PasswordResetTokenModel.findOne({ token }).lean();
  if (!item || Array.isArray(item) || new Date(item.expiresAt).getTime() <= Date.now()) {
    await PasswordResetTokenModel.deleteOne({ token });
    return null;
  }
  await PasswordResetTokenModel.deleteOne({ token });
  return String(item.userId);
}

export async function updatePasswordByUserId(userId: string, passwordHash: string) {
  await connectToDatabase();
  const result = await UserModel.updateOne({ _id: userId }, { passwordHash });
  return result.modifiedCount > 0;
}

export async function updateUserProfileById(userId: string, input: {
  fullName?: string;
  phone?: string;
  province?: string;
  district?: string;
  city?: string;
  ward?: string;
  fullAddress?: string;
  landmark?: string;
}) {
  await connectToDatabase();
  const updates: Record<string, string> = {};
  if (input.fullName) updates.fullName = input.fullName.trim();
  if (input.phone) updates.phone = input.phone.trim();
  if (input.province !== undefined) updates.province = input.province.trim();
  if (input.district !== undefined) updates.district = input.district.trim();
  if (input.city !== undefined) updates.city = input.city.trim();
  if (input.ward !== undefined) updates.ward = input.ward.trim();
  if (input.fullAddress !== undefined) updates.fullAddress = input.fullAddress.trim();
  if (input.landmark !== undefined) updates.landmark = input.landmark.trim();

  if (Object.keys(updates).length === 0) return null;

  await UserModel.updateOne({ _id: userId }, { $set: updates });
  return UserModel.findById(userId).lean();
}
