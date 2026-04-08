import User from "../models/User.js";


export const searchUserByEmail = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ message: "Email query parameter is required" });
        }
        const user = await User.findOne({ email: email.trim() }).select('username email');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error("Error searching user by email:", error.message);
        res.status(500).json({ message: "Server error" });
    }
}