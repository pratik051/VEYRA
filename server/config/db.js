import mongoose from "mongoose";

export async function connectDB() {
  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoURI) {
    console.error("[MongoDB Error]: MONGODB_URI environment variable is not defined.");
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(mongoURI, {
      bufferCommands: false,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    process.exit(1);
  }
}

export default connectDB;
