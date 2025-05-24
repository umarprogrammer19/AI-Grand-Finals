import crypto from "crypto";
import User from "../models/User.js";
import { uploadImageToCloudinary } from "../utilities/cloudinary.js";

function generateDigitalId() {
    return "SID" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

export const registerUserOnCourse = async (req, res) => {
    try {
        const {
            fullName,
            cnic,
            email,
            phone,
            address,
            course,
        } = req.body;

        if (
            !fullName ||
            !cnic ||
            !email ||
            !phone ||
            !address ||
            !course ||
            !req.file
        ) {
            return res.status(400).json({ error: "Please fill all required fields" });
        }

        const imageURL = await uploadImageToCloudinary(req.file.path);

        if (!imageURL) return res.status(400).json({ message: "Image Not Found" })

        const existingUser = await User.findOne({
            $or: [{ email }, { cnic }, { digitalIdNumber }],
        });
        if (existingUser) {
            return res
                .status(400)
                .json({ error: "User with this email or CNIC already exists" });
        }

        const digitalIdNumber = generateDigitalId();

        const user = new User({
            fullName,
            cnic,
            email,
            phone,
            address,
            course,
            imageURL,
            digitalIdNumber,
        });

        await user.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};
