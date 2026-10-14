import mongoose from 'mongoose';

let isMongooseConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pizzadb';
  try {
    mongoose.set('strictQuery', false);
    // Connect with a 3-second serverSelectionTimeoutMS so if local mongo isn't up, it falls back instantly
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongooseConnected = true;
    console.log(`✅ MongoDB Connected to: ${mongoose.connection.host}`);
    return true;
  } catch (err) {
    console.warn(`⚠️ MongoDB connection to ${uri} failed (${err.message}).`);
    console.log(`🚀 Activating high-performance Embedded Data Store fallback. Full app works out-of-the-box!`);
    isMongooseConnected = false;
    return false;
  }
};

export const getDBStatus = () => isMongooseConnected;
