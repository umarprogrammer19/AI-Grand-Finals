import mongoose from "mongoose";

const idCardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    digitalIdNumber: {
        type: String,
        required: true,
        unique: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    qrCodeUrl: {
        type: String,
        required: true
    }, // URL to QR code image or data
    idCardUrl: {
        type: String,
        required: true
    }, // URL or path to generated PDF/Image of ID card
});

export default mongoose.model('IdCard', idCardSchema);
