import Donation from "../models/donation.models.js";

export const createDonation = async (req, res) => {
    try {
        const { person, email, number } = req.body;

        if (!person || !email || !number) {
            return res.status(400).json({ error: "Please provide all required fields" });
        }

        const donation = new Donation({ person, email, number });
        await donation.save();

        res.status(201).json({ message: "Donation created successfully", donation });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

export const getDonations = async (req, res) => {
    try {
        const donations = await Donation.find().sort({ createdAt: -1 });
        res.json(donations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};
