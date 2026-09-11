import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var __linkova_mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI ?? process.env.MONGO_URI ?? "";

const cached = global.__linkova_mongoose || { conn: null, promise: null };
if (!global.__linkova_mongoose) {
  global.__linkova_mongoose = cached;
}

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI or MONGO_URI is not configured.");
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export const connectDB = connectToDatabase;

