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
  authProvider?: "local" | "google" | "apple" | "phone";
  googleId?: string;
  appleId?: string;
  firebaseUid?: string;
};

// In-memory fallback stores for development resilience
declare global {
  // eslint-disable-next-line no-var
  var __sajilomarts_mem_users: Map<string, AuthUser> | undefined;
  // eslint-disable-next-line no-var
  var __sajilomarts_mem_sessions: Map<string, { token: string; userId: string; expiresAt: Date }> | undefined;
  // eslint-disable-next-line no-var
  var __sajilomarts_mem_tokens: Map<string, { token: string; userId: string; expiresAt: Date }> | undefined;
}

const memUsers = global.__sajilomarts_mem_users || new Map<string, AuthUser>();
const memSessions = global.__sajilomarts_mem_sessions || new Map<string, { token: string; userId: string; expiresAt: Date }>();
const memTokens = global.__sajilomarts_mem_tokens || new Map<string, { token: string; userId: string; expiresAt: Date }>();

if (!global.__sajilomarts_mem_users) global.__sajilomarts_mem_users = memUsers;
if (!global.__sajilomarts_mem_sessions) global.__sajilomarts_mem_sessions = memSessions;
if (!global.__sajilomarts_mem_tokens) global.__sajilomarts_mem_tokens = memTokens;

async function tryDb(): Promise<boolean> {
  try {
    await connectToDatabase();
    return true;
  } catch {
    return false;
  }
}

async function seedAdmin() {
  const dbOk = await tryDb();
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@sajilomarts.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";

  if (dbOk) {
    try {
      const existingAdmin = await UserModel.findOne({ email: adminEmail }).lean();
      if (!existingAdmin) {
        const passwordHash = await hashPassword(adminPassword);
        await UserModel.create({
          fullName: "SAJILOMARTS Admin",
          email: adminEmail,
          phone: "9800000000",
          passwordHash,
          role: "admin"
        });
      }
      return;
    } catch (e) {
      console.warn("DB seedAdmin warning, using fallback:", e);
    }
  }

  // Memory seed
  if (!Array.from(memUsers.values()).some((u) => u.email === adminEmail)) {
    const passwordHash = await hashPassword(adminPassword);
    const adminId = "mem-admin-" + randomUUID().slice(0, 8);
    memUsers.set(adminId, {
      _id: adminId,
      fullName: "SAJILOMARTS Admin",
      email: adminEmail,
      phone: "9800000000",
      role: "admin",
      passwordHash,
      authProvider: "local"
    });
  }
}

export async function getUserByEmail(email: string): Promise<AuthUser | null> {
  await seedAdmin();
  const normalizedEmail = email.toLowerCase().trim();
  const dbOk = await tryDb();

  if (dbOk) {
    try {
      const user = await UserModel.findOne({ email: normalizedEmail }).lean();
      if (user && !Array.isArray(user)) return user as unknown as AuthUser;
    } catch {
      // Fallback to memory
    }
  }

  for (const user of memUsers.values()) {
    if (user.email === normalizedEmail) return user;
  }
  return null;
}

export async function createUser(input: {
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role?: UserRole;
  authProvider?: "local" | "google" | "apple" | "phone";
  googleId?: string;
  appleId?: string;
  firebaseUid?: string;
}): Promise<AuthUser | null> {
  await seedAdmin();
  const email = input.email.toLowerCase().trim();
  const dbOk = await tryDb();

  if (dbOk) {
    try {
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
      return (created.toObject ? created.toObject() : created) as unknown as AuthUser;
    } catch {
      // Fallback to memory
    }
  }

  // Check memory
  for (const user of memUsers.values()) {
    if (user.email === email) return null;
  }

  const userId = "mem-user-" + randomUUID().slice(0, 8);
  const newUser: AuthUser = {
    _id: userId,
    fullName: input.fullName,
    email,
    phone: input.phone,
    role: input.role || "customer",
    passwordHash: input.passwordHash,
    authProvider: input.authProvider || "local",
    googleId: input.googleId,
    appleId: input.appleId,
    firebaseUid: input.firebaseUid
  };
  memUsers.set(userId, newUser);
  return newUser;
}

export async function findOrCreateGoogleUser(input: {
  googleId: string;
  email: string;
  fullName: string;
  phone?: string;
}): Promise<AuthUser | null> {
  await seedAdmin();
  const normalizedEmail = input.email.trim().toLowerCase();
  const fallbackPhone = input.phone || "+977-9800000000";
  const dbOk = await tryDb();

  if (dbOk) {
    try {
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
        const updated = await UserModel.findById(existingUser._id).lean();
        if (updated && !Array.isArray(updated)) return updated as unknown as AuthUser;
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

      return (created.toObject ? created.toObject() : created) as unknown as AuthUser;
    } catch {
      // Fallback to memory
    }
  }

  // Memory fallback
  for (const user of memUsers.values()) {
    if (user.googleId === input.googleId || user.email === normalizedEmail) {
      user.fullName = input.fullName || user.fullName;
      user.googleId = input.googleId;
      user.authProvider = "google";
      return user;
    }
  }

  const userId = "mem-google-" + randomUUID().slice(0, 8);
  const newUser: AuthUser = {
    _id: userId,
    fullName: input.fullName,
    email: normalizedEmail,
    phone: fallbackPhone,
    passwordHash: "google-oauth",
    authProvider: "google",
    googleId: input.googleId,
    role: "customer"
  };
  memUsers.set(userId, newUser);
  return newUser;
}

export async function findOrCreateAppleUser(input: {
  appleId: string;
  email?: string;
  fullName?: string;
  phone?: string;
  firebaseUid?: string;
}): Promise<AuthUser | null> {
  await seedAdmin();
  const normalizedEmail = (input.email || `apple_${input.appleId.slice(0, 10)}@sajilomarts.internal`).trim().toLowerCase();
  const displayName = input.fullName || "Apple User";
  const fallbackPhone = input.phone || "+977-9800000000";
  const dbOk = await tryDb();

  if (dbOk) {
    try {
      const existing = await UserModel.findOne({
        $or: [
          { appleId: input.appleId },
          ...(input.firebaseUid ? [{ firebaseUid: input.firebaseUid }] : []),
          ...(input.email ? [{ email: normalizedEmail }] : [])
        ]
      }).lean();

      if (existing) {
        const existingUser = existing as any;
        const updates: Record<string, unknown> = {
          fullName: existingUser.fullName || displayName,
          authProvider: "apple",
          appleId: existingUser.appleId || input.appleId,
          firebaseUid: existingUser.firebaseUid || input.firebaseUid || input.appleId,
          passwordHash: existingUser.passwordHash || "apple-oauth"
        };
        if (input.email && !existingUser.email) updates.email = normalizedEmail;
        if (!existingUser.phone && fallbackPhone) updates.phone = fallbackPhone;

        await UserModel.updateOne({ _id: existingUser._id }, { $set: updates });
        const updated = await UserModel.findById(existingUser._id).lean();
        if (updated && !Array.isArray(updated)) return updated as unknown as AuthUser;
      }

      const created = await UserModel.create({
        fullName: displayName,
        email: normalizedEmail,
        phone: fallbackPhone,
        passwordHash: "apple-oauth",
        authProvider: "apple",
        appleId: input.appleId,
        firebaseUid: input.firebaseUid || input.appleId,
        role: "customer"
      });

      return (created.toObject ? created.toObject() : created) as unknown as AuthUser;
    } catch {
      // Fallback to memory
    }
  }

  // Memory fallback
  for (const user of memUsers.values()) {
    if (user.appleId === input.appleId || user.email === normalizedEmail) {
      user.fullName = displayName || user.fullName;
      user.appleId = input.appleId;
      user.authProvider = "apple";
      return user;
    }
  }

  const userId = "mem-apple-" + randomUUID().slice(0, 8);
  const newUser: AuthUser = {
    _id: userId,
    fullName: displayName,
    email: normalizedEmail,
    phone: fallbackPhone,
    passwordHash: "apple-oauth",
    authProvider: "apple",
    appleId: input.appleId,
    firebaseUid: input.firebaseUid || input.appleId,
    role: "customer"
  };
  memUsers.set(userId, newUser);
  return newUser;
}

export async function findOrCreatePhoneUser(input: {
  phone: string;
  firebaseUid?: string;
  fullName?: string;
  email?: string;
}): Promise<AuthUser | null> {
  await seedAdmin();
  const cleanPhone = input.phone.trim();
  const normalizedEmail = (input.email || `phone_${cleanPhone.replace(/[^0-9]/g, "")}@sajilomarts.internal`).trim().toLowerCase();
  const displayName = input.fullName || `User (${cleanPhone})`;
  const dbOk = await tryDb();

  if (dbOk) {
    try {
      const existing = await UserModel.findOne({
        $or: [
          { phone: cleanPhone },
          ...(input.firebaseUid ? [{ firebaseUid: input.firebaseUid }] : []),
          ...(input.email ? [{ email: normalizedEmail }] : [])
        ]
      }).lean();

      if (existing) {
        const existingUser = existing as any;
        const updates: Record<string, unknown> = {
          fullName: existingUser.fullName || displayName,
          phone: cleanPhone,
          authProvider: existingUser.authProvider || "phone",
          firebaseUid: existingUser.firebaseUid || input.firebaseUid,
          passwordHash: existingUser.passwordHash || "firebase-phone-auth"
        };
        if (input.email && !existingUser.email) updates.email = normalizedEmail;

        await UserModel.updateOne({ _id: existingUser._id }, { $set: updates });
        const updated = await UserModel.findById(existingUser._id).lean();
        if (updated && !Array.isArray(updated)) return updated as unknown as AuthUser;
      }

      const created = await UserModel.create({
        fullName: displayName,
        email: normalizedEmail,
        phone: cleanPhone,
        passwordHash: "firebase-phone-auth",
        authProvider: "phone",
        firebaseUid: input.firebaseUid,
        role: "customer"
      });

      return (created.toObject ? created.toObject() : created) as unknown as AuthUser;
    } catch {
      // Fallback to memory
    }
  }

  // Memory fallback
  for (const user of memUsers.values()) {
    if (user.phone === cleanPhone || (input.firebaseUid && user.firebaseUid === input.firebaseUid)) {
      user.fullName = displayName || user.fullName;
      user.phone = cleanPhone;
      user.authProvider = "phone";
      return user;
    }
  }

  const userId = "mem-phone-" + randomUUID().slice(0, 8);
  const newUser: AuthUser = {
    _id: userId,
    fullName: displayName,
    email: normalizedEmail,
    phone: cleanPhone,
    passwordHash: "firebase-phone-auth",
    authProvider: "phone",
    firebaseUid: input.firebaseUid,
    role: "customer"
  };
  memUsers.set(userId, newUser);
  return newUser;
}

export async function createSessionForUser(userId: string): Promise<string> {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  const dbOk = await tryDb();

  if (dbOk) {
    try {
      await AuthSessionModel.create({ token, userId, expiresAt });
      return token;
    } catch {
      // Fallback to memory
    }
  }

  memSessions.set(token, { token, userId, expiresAt });
  return token;
}

export async function refreshSessionByToken(token: string) {
  const dbOk = await tryDb();

  if (dbOk) {
    try {
      const session = await AuthSessionModel.findOne<{ _id: string; userId: string; expiresAt: Date }>({ token }).lean();
      if (session && new Date(session.expiresAt).getTime() > Date.now()) {
        const user = await UserModel.findById(session.userId).lean();
        if (user && !Array.isArray(user)) {
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
      }
    } catch {
      // Fallback to memory
    }
  }

  // Memory fallback
  const memSession = memSessions.get(token);
  if (!memSession || new Date(memSession.expiresAt).getTime() <= Date.now()) {
    memSessions.delete(token);
    return null;
  }

  const memUser = memUsers.get(memSession.userId);
  if (!memUser) return null;

  const newToken = randomUUID();
  const newExpiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  memSessions.delete(token);
  memSessions.set(newToken, { token: newToken, userId: memUser._id, expiresAt: newExpiresAt });

  return { token: newToken, user: memUser };
}

export async function deleteSessionByToken(token: string) {
  const dbOk = await tryDb();
  if (dbOk) {
    try {
      await AuthSessionModel.deleteOne({ token });
    } catch {
      // Fallback to memory
    }
  }
  memSessions.delete(token);
}

export async function getSessionUserByToken(token: string): Promise<AuthUser | null> {
  const dbOk = await tryDb();

  if (dbOk) {
    try {
      const session = await AuthSessionModel.findOne<{ userId: string; expiresAt: Date }>({ token }).lean();
      if (session && new Date(session.expiresAt).getTime() > Date.now()) {
        const user = await UserModel.findById(session.userId).lean();
        if (user && !Array.isArray(user)) {
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
      }
    } catch {
      // Fallback to memory
    }
  }

  // Memory fallback
  const memSession = memSessions.get(token);
  if (!memSession || new Date(memSession.expiresAt).getTime() <= Date.now()) {
    return null;
  }

  const memUser = memUsers.get(memSession.userId);
  return memUser || null;
}

export async function createResetToken(userId: string) {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
  const dbOk = await tryDb();

  if (dbOk) {
    try {
      await PasswordResetTokenModel.create({ token, userId, expiresAt });
      return token;
    } catch {
      // Fallback to memory
    }
  }

  memTokens.set(token, { token, userId, expiresAt });
  return token;
}

export async function consumeResetToken(token: string) {
  const dbOk = await tryDb();

  if (dbOk) {
    try {
      const item = await PasswordResetTokenModel.findOne({ token }).lean();
      if (item && !Array.isArray(item) && new Date(item.expiresAt).getTime() > Date.now()) {
        await PasswordResetTokenModel.deleteOne({ token });
        return String(item.userId);
      }
    } catch {
      // Fallback to memory
    }
  }

  const memToken = memTokens.get(token);
  if (!memToken || new Date(memToken.expiresAt).getTime() <= Date.now()) {
    memTokens.delete(token);
    return null;
  }
  memTokens.delete(token);
  return memToken.userId;
}

export async function updatePasswordByUserId(userId: string, passwordHash: string) {
  const dbOk = await tryDb();

  if (dbOk) {
    try {
      const result = await UserModel.updateOne({ _id: userId }, { passwordHash });
      if (result.modifiedCount > 0) return true;
    } catch {
      // Fallback to memory
    }
  }

  const memUser = memUsers.get(userId);
  if (memUser) {
    memUser.passwordHash = passwordHash;
    return true;
  }
  return false;
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
  const dbOk = await tryDb();

  if (dbOk) {
    try {
      const updates: Record<string, string> = {};
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
        const updated = await UserModel.findById(userId).lean();
        if (updated) return updated;
      }
    } catch {
      // Fallback to memory
    }
  }

  const memUser = memUsers.get(userId);
  if (!memUser) return null;

  if (input.fullName) memUser.fullName = input.fullName.trim();
  if (input.phone) memUser.phone = input.phone.trim();
  if (input.province !== undefined) memUser.province = input.province.trim();
  if (input.district !== undefined) memUser.district = input.district.trim();
  if (input.city !== undefined) memUser.city = input.city.trim();
  if (input.ward !== undefined) memUser.ward = input.ward.trim();
  if (input.fullAddress !== undefined) memUser.fullAddress = input.fullAddress.trim();
  if (input.landmark !== undefined) memUser.landmark = input.landmark.trim();

  return memUser;
}
