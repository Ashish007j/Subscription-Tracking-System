import mongoose from "mongoose";

const userSchema = mongoose.Schema({

    name: {
        type: String,
        required: [true, 'User name is required'],
        minLength: 3,
        trim: true,
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Enter valid email']
    },

    password: {
        type: String,
        required: [true, 'EPassword is required'],
        unique: true,
        trim: true,
    }

}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;