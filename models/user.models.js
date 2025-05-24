import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    cnic: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    digitalIdNumber: {
        type: String,
        required: true,
        unique: true
    },
    imageURL: {
        type: String,
        required: true
    },
}, { timestamps: true });


export default mongoose.model('User', userSchema);
