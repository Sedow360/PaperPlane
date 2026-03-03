import mongoose from "mongoose";

type ConnectObj = {
    isConnected?: number;
};

const connection: ConnectObj = {};

async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("DB already connected");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || '', {})
        connection.isConnected = db.connections[0].readyState;

        console.log("DB connected successfully");
    } catch (err) {
        console.log("DB connection failed", err);
        process.exit(1);
    }
}

export default dbConnect;