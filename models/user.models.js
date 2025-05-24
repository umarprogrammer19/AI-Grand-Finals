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
    registrationDate: {
        type: Date,
        default: Date.now
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
    role: {
        type: String,
        default: "student",
        enum: ["admin", "student"]
    }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    const user = this;
    if (!user.isModified("password")) return;
    const hashPassword = await bcrypt.hash(user.password, 10);
    user.password = hashPassword;
    next();
})

module.exports = mongoose.model('User', userSchema);
