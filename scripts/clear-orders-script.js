const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        if (!process.env[key]) {
          process.env[key] = value.trim();
        }
      }
    });
  }
}

loadEnv();

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGO_URI not found in environment or .env.local");
  process.exit(1);
}

async function clearOrders() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("Connected successfully!");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    console.log("Found collections in DB:", collectionNames);

    const targetCollections = [
      "orders",
      "indiaorders",
      "india_orders",
      "productrequests",
      "product_requests",
      "payments",
      "carts"
    ];

    for (const name of collectionNames) {
      if (targetCollections.includes(name.toLowerCase())) {
        const countBefore = await db.collection(name).countDocuments();
        const deleteResult = await db.collection(name).deleteMany({});
        console.log(`Collection '${name}': Deleted ${deleteResult.deletedCount} items (was ${countBefore} total).`);
      }
    }

    console.log("\n✅ ALL ORDERS AND PRODUCT REQUESTS DELETED SUCCESSFULLY! DATABASE IS FRESH AND NEW.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error clearing orders:", err);
    process.exit(1);
  }
}

clearOrders();
