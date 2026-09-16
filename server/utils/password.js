import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb);

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, 64);
  return `${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password, passwordHash) {
  if (!passwordHash) return false;
  const [salt, storedHash] = passwordHash.split(":");
  if (!salt || !storedHash) return false;
  const key = await scrypt(password, salt, 64);
  const storedBuffer = Buffer.from(storedHash, "hex");
  if (storedBuffer.length !== key.length) return false;
  return timingSafeEqual(storedBuffer, key);
}
