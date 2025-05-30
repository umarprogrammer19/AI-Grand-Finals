import crypto from "crypto";
import User from "../models/user.models.js";
import { uploadImageToCloudinary } from "../utilities/cloudinary.js";
import { generateIdCardPDF } from "../utilities/idCardGenerator.js";
import { transporter } from "../utilities/transporter.js";
import fs from "fs";

export function generateDigitalId() {
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
        if (!imageURL) return res.status(400).json({ message: "Image Not Found" });

        const digitalIdNumber = generateDigitalId();

        const existingUser = await User.findOne({
            $or: [{ email }, { cnic }, { digitalIdNumber }],
        });
        if (existingUser) {
            return res
                .status(400)
                .json({ error: "User with this email or CNIC already exists" });
        }

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

        // Generate PDF ID card
        const pdfPath = await generateIdCardPDF(user);

        // Send email with PDF attachment
        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: "Your Saylani Digital ID Card",
            text: `Dear ${user.fullName},\n\nPlease find attached your digital ID card.\n\nRegards,\nSaylani Team`,
            attachments: [
                {
                    filename: `IDCard_${digitalIdNumber}.pdf`,
                    path: pdfPath,
                },
            ],
        };

        await transporter.sendMail(mailOptions);

        // Delete temp PDF file after sending email
        fs.unlink(pdfPath, (err) => {
            if (err) console.error("Failed to delete temp PDF:", err);
        });

        res.status(201).json({ message: "User registered and ID card sent by email" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

export const renderCardByCNIC = async (req, res) => {
    try {
        const { cnic } = req.body;

        if (!cnic) {
            return res.status(400).json({ error: "CNIC is required" });
        }

        const user = await User.findOne({ cnic });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const pdfPath = await generateIdCardPDF(user);

        res.download(pdfPath, `IDCard_${user.digitalIdNumber}.pdf`, (err) => {
            fs.unlink(pdfPath, (unlinkErr) => {
                if (unlinkErr) console.error("Error deleting temp PDF:", unlinkErr);
            });

            if (err) {
                console.error("Error sending PDF:", err);
                res.status(500).json({ error: "Failed to send PDF" });
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};
