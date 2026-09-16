import mongoose from "mongoose";

export async function connectDB() {
  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb+srv://pratikshah2056_db_user:Ajita_777@cluster0.hvnskf.mongodb.net/sajilomarts?retryWrites=true&w=majority&appName=Cluster0";
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
