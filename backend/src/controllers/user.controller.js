import User from "../models/User.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";
import { isNonEmptyString, validateEmail } from "../utils/validators.js";

export const searchUsers = async (req, res) => {
    try {
        const { query, email } = req.query;

        if (isNonEmptyString(email)) {
            if (!validateEmail(email)) {
                return sendError(res, "A valid email query parameter is required", 400);
            }
            const user = await User.findOne({ email: email.trim().toLowerCase() }).select('username email');
            if (!user) {
                return sendError(res, "User not found", 404);
            }
            return sendSuccess(res, { users: [user] }, "User fetched successfully");
        }

        if (!isNonEmptyString(query)) {
            return sendError(res, "Search query is required", 400);
        }

        const regex = new RegExp(query.trim(), 'i');
        const users = await User.find({
            $or: [{ username: regex }, { email: regex }],
        })
            .select('username email')
            .limit(12);

        return sendSuccess(res, { users }, "Users fetched successfully");
    } catch (error) {
        console.error("Error searching users:", error.message);
        return sendError(res, "Server error", 500);
    }
};