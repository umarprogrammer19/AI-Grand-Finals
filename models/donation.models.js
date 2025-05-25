import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
    person: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true
    }
}, { timestamps: true });


export default mongoose.model('Donation', donationSchema);