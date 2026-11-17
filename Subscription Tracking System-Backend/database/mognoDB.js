import mongoose from "mongoose";
import dontenv from 'dotenv';

dontenv.config();

const URI = process.env.DB_URI;

if (!URI) {
    throw new Error('Database could not be connectes');
}

const connectToDatabase = async () => {
    try {
        await mongoose.connect(URI);
        console.log('Connected to MonogoDB atlas');
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}
export default connectToDatabase;