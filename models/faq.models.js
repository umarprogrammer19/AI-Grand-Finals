import mongoose from "mongoose";

const faqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        unique: true
    },
    answer: {
        type: String,
        required: true
    },
    language: {
        type: String,
        default: 'en'
    },
}, { timestamps: true });

module.exports = mongoose.model('FAQ', faqSchema);
