import User from "../models/user.models.js";
import Auth from "../models/auth.models.js";
import { generateRefreshToken } from "../utilities/jwt";

export const registerUser = async (req, res) => {
    try {
        const { cnic, password } = req.body;

        if (!cnic || password) {
            return res.status(400).json({ error: "Please fill all required fields" });
        }

        const existingUser = await User.findOne({
            $or: [{ cnic }],
        });
        if (!existingUser) {
            return res
                .status(400)
                .json({ error: "User with this email or CNIC is not exist" });
        }

        const user = new Auth({
            cnic,
            password
        });

        await user.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

// Login Api 
export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email) return res.status(400).json({ message: "Email is Required" });
        if (!password) return res.status(400).json({ message: "Password is Required" });

        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User Does Not Exists With This Email" });

        const isTruePassword = await bcrypt.compare(password, user.password);
        if (!isTruePassword) return res.status(400).json({ message: "Password Is Incorrect" });

        const refreshToken = generateRefreshToken(user);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            path: '/'
        });

        res.status(200).json({
            message: "User Logged In Successfully",
            accessToken,
            refreshToken,
            user,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred during Login" });
    }
}

// logout Api
export const logOut = async (req, res) => {
    try {
        await res.clearCookie("refreshToken");
        await res.clearCookie("accessToken");
        res.status(200).json({ message: "Logout Successfull" })
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "An error occurred during Logout" })
    };
};
