import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}

// Global is used here to maintain a cached connection across hot reloads in development
// (Next.js may re-import modules multiple times). This avoids creating multiple connections.
let cached = (global as any)._mongoose as {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
} | undefined;

if (!cached) {
  cached = (global as any)._mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      // Mongoose 6+ has sensible defaults; add any options needed here
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    };

    cached!.promise = mongoose.connect(MONGO_URI /*, opts */).then((m) => m);
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}

export default connectToDatabase;
