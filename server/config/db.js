import mongoose from "mongoose";

const DEFAULT_MONGO_URI =
  "mongodb+srv://pratikshah2056_db_user:Ajita_777@cluster0.hvnskf.mongodb.net/sajilomarts?retryWrites=true&w=majority&appName=Cluster0";

export async function connectDB() {
  const mongoURI =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.DATABASE_URL ||
    process.env.MONGODB_URL ||
    DEFAULT_MONGO_URI;

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
