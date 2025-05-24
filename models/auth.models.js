import bcrypt from "bcrypt"
import mongoose from "mongoose";

const AuthSchema = new mongoose.Schema({
    cnic: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "student",
        enum: ["admin", "student"]
    }
}, { timestamps: true });

AuthSchema.pre("save", async function (next) {
    const user = this;
    if (!user.isModified("password")) return;
    const hashPassword = await bcrypt.hash(user.password, 10);
    user.password = hashPassword;
    next();
});

module.exports = mongoose.model('Auth', userSchema);