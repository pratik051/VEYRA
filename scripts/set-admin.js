const mongoose = require("mongoose");
const { randomBytes, scrypt: scryptCb, timingSafeEqual } = require("node:crypto");
const { promisify } = require("node:util");
const fs = require("node:fs");
const path = require("node:path");

const scrypt = promisify(scryptCb);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, 64);
  return `${salt}:${key.toString("hex")}`;
}

async function verifyPassword(password, passwordHash) {
  const [salt, storedHash] = passwordHash.split(":");
  if (!salt || !storedHash) return false;
  const key = await scrypt(password, salt, 64);
  const storedBuffer = Buffer.from(storedHash, "hex");
  if (storedBuffer.length !== key.length) return false;
  return timingSafeEqual(storedBuffer, key);
}

// Load .env.local if present
function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/linkova";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "pratikshah2056@gamil.com").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Ajit@777";

async function main() {
  console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB successfully.");

  const db = mongoose.connection.db;
  const usersCollection = db.collection("users");

  const emailsToSetup = [ADMIN_EMAIL];
  if (ADMIN_EMAIL.includes("gamil.com")) {
    emailsToSetup.push(ADMIN_EMAIL.replace("gamil.com", "gmail.com"));
  }

  for (const email of emailsToSetup) {
    const passwordHash = await hashPassword(ADMIN_PASSWORD);
    const existing = await usersCollection.findOne({ email });

    if (existing) {
      await usersCollection.updateOne(
        { _id: existing._id },
        {
          $set: {
            fullName: existing.fullName || "LINKOVA Admin",
            passwordHash,
            role: "admin",
            phone: existing.phone || "9800000000",
            authProvider: "local",
            updatedAt: new Date()
          }
        }
      );
      console.log(`Updated admin user: ${email} with role 'admin' and new password.`);
    } else {
      await usersCollection.insertOne({
        fullName: "LINKOVA Admin",
        email,
        phone: "9800000000",
        passwordHash,
        role: "admin",
        authProvider: "local",
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Created new admin user: ${email} with role 'admin' and new password.`);
    }

    // Verify
    const savedUser = await usersCollection.findOne({ email });
    const isPasswordValid = await verifyPassword(ADMIN_PASSWORD, savedUser.passwordHash);
    console.log(`Verification for ${email} (role: ${savedUser.role}): password valid = ${isPasswordValid}`);
  }

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB. Admin setup completed successfully!");
}

main().catch((err) => {
  console.error("Error setting admin:", err);
  process.exit(1);
});
