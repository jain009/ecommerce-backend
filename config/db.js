import mongoose from "mongoose";

import dotenv from "dotenv";


dotenv.config({ path: '.env' });



const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error('Error: MONGO_URI is not defined in .env file');
        process.exit(1);
    }
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI, {
         
            serverSelectionTimeoutMS: 15000, // 15 seconds
            socketTimeoutMS: 15000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);

    }
    catch(error){
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }   
};
export default connectDB;