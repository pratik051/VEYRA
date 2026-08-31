const mongoose = require("mongoose");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required to run this migration.");
  }

  await mongoose.connect(uri, { bufferCommands: false });
  const users = mongoose.connection.collection("users");

  const existingUsers = await users
    .find({}, { projection: { _id: 1, email: 1 } })
    .toArray();

  const duplicateMap = new Map();
  for (const user of existingUsers) {
    const key = normalizeEmail(user.email);
    if (!duplicateMap.has(key)) duplicateMap.set(key, []);
    duplicateMap.get(key).push(String(user._id));
  }

  const collisions = [];
  for (const [email, ids] of duplicateMap.entries()) {
    if (email && ids.length > 1) {
      collisions.push({ email, ids });
    }
  }

  if (collisions.length > 0) {
    console.error("Migration blocked: duplicate emails detected after normalization.");
    for (const c of collisions) {
      console.error(`- ${c.email}: ${c.ids.join(", ")}`);
    }
    process.exitCode = 2;
    return;
  }

  const emailUpdates = [];
  for (const user of existingUsers) {
    const normalized = normalizeEmail(user.email);
    if (normalized && normalized !== user.email) {
      emailUpdates.push({
        updateOne: {
          filter: { _id: user._id },
          update: { $set: { email: normalized } }
        }
      });
    }
  }

  if (emailUpdates.length > 0) {
    const result = await users.bulkWrite(emailUpdates, { ordered: false });
    console.log(`Normalized ${result.modifiedCount} user email(s).`);
  } else {
    console.log("No email normalization changes required.");
  }

  const roleResult = await users.updateMany(
    { $or: [{ role: { $exists: false } }, { role: null }, { role: "" }] },
    { $set: { role: "customer" } }
  );
  console.log(`Backfilled role for ${roleResult.modifiedCount} user(s).`);

  await users.createIndex({ email: 1 }, { unique: true, name: "email_1" });
  await users.createIndex({ phone: 1 }, { name: "phone_1" });
  console.log("Ensured users indexes: email_1 (unique), phone_1.");
}

run()
  .then(async () => {
    await mongoose.disconnect();
  })
  .catch(async (error) => {
    console.error("User model migration failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  });
