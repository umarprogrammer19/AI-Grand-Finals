import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const instance = await mongoose.connect(process.env.MONGO_URI, {
            dbName: "SMIT-AI-HACKATHON"
        });
        console.log(`✅ MongoDB Connected: ${instance.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error}`);
        process.exit(1);
    }
};

export default connectDB;
