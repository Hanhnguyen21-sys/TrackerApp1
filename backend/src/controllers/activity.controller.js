import AuditLog from "../models/AuditLog.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

export const getProjectActivity = async (req, res) => {
  try {
    const { projectId } = req.params;

    const activity = await AuditLog.find({ project: projectId })
      .populate("actor", "username email")
      .populate("ticket", "title")
      .sort({ createdAt: -1 })
      .limit(50);

    return sendSuccess(
      res,
      { activity },
      "Project activity fetched successfully"
    );
  } catch (error) {
    console.error("Error getting project activity:", error);
    return sendError(res, "Server error", 500);
  }
};