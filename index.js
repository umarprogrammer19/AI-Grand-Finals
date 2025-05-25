import express from "express";
import "dotenv/config";
import connectDB from "./db/connection.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import cors from "cors";
import nodemailer from "nodemailer";
import { WebhookClient } from "dialogflow-fulfillment";
import axios from "axios";
import User from "./models/user.models.js";         // your registration model
import Donation from "./models/donation.models.js"; // your donation model
import { generateIdCardPDF } from "./utilities/idCardGenerator.js";
import fs from "fs";
import { generateDigitalId } from "./controllers/user.controller.js";

const app = express();

const corsOption = {
    origin: "http://localhost:3000",
    credentials: true,
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOption));

app.use("/api/v1", userRouter);

app.get("/", (req, res) => {
    res.send("Hello World");
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.SMTP_SECRET,
    }
});

// ✅ Gemini API Config
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

app.post("/webhook", async (req, res) => {
    const agent = new WebhookClient({ request: req, response: res });

    // 🟢 Welcome intent
    function welcome(agent) {
        agent.add("👋 Assalamu Alaikum! Welcome to SMIT 💻\nHow can I assist you today?");
    }

    // 📝 Course Registration intent
    async function registration(agent) {
        const { name, cnic, email, phone, address, course } = agent.parameters;

        try {
            const digitalIdNumber = generateDigitalId();

            const user = new User({
                fullName: name,
                cnic,
                email,
                phone,
                address,
                course,
                digitalIdNumber,
                imageURL: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg",
            });

            await user.save();

            // Generate ID card PDF
            const pdfPath = await generateIdCardPDF(user);

            await transporter.sendMail({
                from: '"SMIT Team" <' + process.env.EMAIL + '>',
                to: email,
                subject: "🎓 SMIT Course Registration & ID Card",
                html: `
                    <h2>Thank you, ${name}!</h2>
                    <p>You have successfully registered for the course: <strong>${course}</strong>.</p>
                    <h3>Your Registration Details:</h3>
                    <ul>
                      <li><b>Name:</b> ${name}</li>
                      <li><b>CNIC:</b> ${cnic}</li>
                      <li><b>Email:</b> ${email}</li>
                      <li><b>Phone:</b> ${phone}</li>
                      <li><b>Address:</b> ${address}</li>
                      <li><b>Course:</b> ${course}</li>
                    </ul>
                    <p>Your ID card is attached below.</p>
                    <br/>
                    <p>Regards,<br/>SMIT Admissions Team</p>
                `,
                attachments: [
                    {
                        filename: `IDCard_${digitalIdNumber}.pdf`,
                        path: pdfPath,
                    },
                ],
            });

            // Clean up temporary PDF after sending
            fs.unlinkSync(pdfPath);

            agent.add(`✅ Thank you, dear! You've registered for "${course}". A confirmation email with your ID card was sent to ${email}.`);

        } catch (error) {
            console.error("Error in registration:", error);
            agent.add("⚠️ There was an issue with registration. Please try again.");
        }
    }

    // 💝 Donation intent
    async function donation(agent) {
        const { name, email, number } = agent.parameters;

        try {
            const donation = new Donation({
                person: name,
                email,
                number,
            });

            await donation.save();

            await transporter.sendMail({
                from: '"SMIT Team" <' + process.env.EMAIL + '>',
                to: email,
                subject: "🙏 SMIT Donation Confirmation",
                html: `
                    <h2>Dear ${name},</h2>
                    <p>Thank you for your generous donation! 🙏</p>
                    <h3>Donation Details:</h3>
                    <ul>
                      <li><b>Name:</b> ${name}</li>
                      <li><b>Email:</b> ${email}</li>
                      <li><b>Amount/Quantity:</b> ${number}</li>
                    </ul>
                    <p>Your support helps us build a better future.</p>
                    <br/>
                    <p>Warm regards,<br/>SMIT Donations Team</p>
                `,
            });

            agent.add(`🎁 Thank you, dear, for donating ${number}! We’ve sent a confirmation email to ${email}.`);

        } catch (error) {
            console.error("Error in donation:", error);
            agent.add("⚠️ There was an issue processing your donation. Please try again.");
        }
    }

    // 🤖 Gemini-powered fallback
    async function defaultFallback(agent) {
        const userMessage = agent.query;

        try {
            const GEMINI_ENDPOINT = "YOUR_GEMINI_ENDPOINT_HERE"; // replace appropriately
            const payload = {
                contents: [{
                    parts: [{
                        text: `You are a helpful assistant for SMIT. Answer politely: ${userMessage}`
                    }]
                }]
            };

            const geminiResponse = await axios.post(GEMINI_ENDPOINT, payload, {
                headers: { 'Content-Type': 'application/json' },
            });

            const geminiReply = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't understand that.";
            agent.add(geminiReply);
        } catch (error) {
            console.error("Gemini Error:", error.response?.data || error.message);
            agent.add("⚠️ Sorry, I couldn't understand that. Please try again.");
        }
    }

    // Intent Mapping
    let intentMap = new Map();
    intentMap.set('welcome', welcome);
    intentMap.set('registration', registration);
    intentMap.set('donation', donation);
    intentMap.set('Default Fallback Intent', defaultFallback);

    try {
        await agent.handleRequest(intentMap);
    } catch (error) {
        console.error('Webhook error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }
});

connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log("🚀 Server running on port", process.env.PORT);
        });
    })
    .catch((err) => {
        console.error("DB Connection Error:", err);
    });
