import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('❌ Please define the MONGODB_URI environment variable');
}

// Global is used here to maintain a cached connection across hot reloads in development
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // Skip connection attempt if running in Edge Runtime
  if (typeof window !== 'undefined' || process.env.NEXT_RUNTIME === 'edge') {
    return null;
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;

    if (cached.conn.connection.readyState === 1) {
      console.log('✅ MongoDB connected:', cached.conn.connection.name);
    } else {
      console.log('❌ MongoDB not ready');
    }

    return cached.conn;
  } catch (err) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
}

export default dbConnect;