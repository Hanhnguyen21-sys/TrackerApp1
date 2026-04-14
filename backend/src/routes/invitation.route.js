import express from "express";
import {
  createInvitation,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
} from "../controllers/invitation.controller.js";
import Protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", Protect, getMyInvitations);
router.post("/:projectId", Protect, createInvitation);
router.put("/:invitationId/accept", Protect, acceptInvitation);
router.put("/:invitationId/reject", Protect, rejectInvitation);

export default router;