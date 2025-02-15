import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './../config.env' });

const connectDB = async () => {
    // Validate Required environment variables
    if(!process.env.DATABASE || !process.env.DATABASE_PASSWORD){
        console.error(`❌ Missing required database environment variables!`);
        process.exit(1);
    }

    // Replace <PASSWORD> in the MongoDB URI
    const DB = process.env.DATABASE.replace(
        '<PASSWORD>',
        process.env.DATABASE_PASSWORD
    );

    // Connect to MongoDB
    try{
        await mongoose.connect(DB);
        console.log(`✅ DB connection successful!`);

    } catch(err){
        console.error(`❌ DB connection error: ${err.message}`);
        process.exit(1); // Exit app on failure 
    }

    // Enable Mongoose debugging based on environment variable
    const isDebugMode = process.env.MONGO_DEBUG === 'true';
    mongoose.set('debug', isDebugMode);

    if (isDebugMode) {
        console.log('🛠️  Mongoose Debug Mode Enabled');
    }

     // Listen for MongoDB connection Events
     mongoose.connection
        .once('connected', () => console.log(`✅ MongoDB connected successfully!`))
        .on('error', err => console.error(`❌ MongoDB Connection Error: ${err.message}`))
        .on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected! Attempting to reconnect...');
            mongoose.connect(DB).catch(err => console.error(`🔄 Reconnection attempt failed: ${err.message}`));
        });
};

export default connectDB;