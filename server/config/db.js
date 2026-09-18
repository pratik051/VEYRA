import mongoose from "mongoose";

export async function connectDB() {
  const mongoURI =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.DATABASE_URL ||
    process.env.MONGODB_URL;

  if (!mongoURI) {
    console.error("[MongoDB] No connection URI found. Set MONGODB_URI in environment variables.");
    return null;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging 30s if Atlas IP is blocked
      socketTimeoutMS: 45000,
    });
    console.log(`[MongoDB Connected Successfully]: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.error(
      "👉 If hosted on Render/Vercel, ensure MongoDB Atlas Network Access has 0.0.0.0/0 (Allow from Anywhere) enabled."
    );
    return null;
  }
}

export default connectDB;
