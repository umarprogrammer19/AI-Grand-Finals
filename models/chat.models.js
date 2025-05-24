import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    platform: {
        type: String,
        enum: ['WhatsApp', 'Facebook', 'Instagram'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    response: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    intent: {
        type: String,
        default: null
    }, // Dialogflow intent name if matched
    generatedBy: {
        type: String,
        enum: ['Dialogflow', 'Gemini'],
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
