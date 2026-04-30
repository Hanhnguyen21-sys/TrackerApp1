import express from "express";
import protect from "../middleware/auth.middleware.js";
import { requireProjectMember } from "../middleware/project.middleware.js";
import { getProjectActivity } from "../controllers/activity.controller.js";

const router = express.Router();

router.get(
  "/projects/:projectId/activity",
  protect,
  requireProjectMember,
  getProjectActivity
);

export default router;