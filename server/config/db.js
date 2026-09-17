import mongoose from "mongoose";

export async function connectDB() {
  const mongoURI =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.DATABASE_URL ||
    process.env.MONGODB_URL;

  if (!mongoURI) {
    console.error(
      "[MongoDB Configuration Notice]: MONGODB_URI environment variable is not defined in environment settings. Please add MONGODB_URI in Render dashboard."
    );
    return null;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      bufferCommands: false,
    });
    console.log(`[MongoDB Connected Successfully]: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    return null;
  }
}

export default connectDB;
