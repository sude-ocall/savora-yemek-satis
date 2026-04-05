import mongoose from "mongoose";

// Serverless ortamında bağlantıyı cache'le
let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      family: 4,
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log(`MongoDB Connected: ${cached.conn.connection.host}`);
  } catch (err) {
    cached.promise = null;
    throw err; // process.exit yok — serverless'ta fonksiyonu öldürür
  }

  return cached.conn;
};

export default connectDB;