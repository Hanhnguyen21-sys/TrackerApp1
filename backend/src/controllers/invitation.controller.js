import Invitation from "../models/Invitation.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

export const createInvitation = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isAdmin = project.members.some((member) => {
      const memberUserId = member.user.toString();
      return memberUserId === req.user._id.toString() && member.role === "admin";
    });

    if (!isAdmin) {
      return res.status(403).json({ message: "Only project admins can send invitations" });
    }

    const receiver = await User.findOne({ email: email.trim() });
    if (!receiver) {
      return res.status(404).json({ message: "User with that email was not found" });
    }

    const alreadyMember = project.members.some(
      (member) => member.user.toString() === receiver._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ message: "User is already a project member" });
    }

    const existingPendingInvite = await Invitation.findOne({
      project: projectId,
      receiver: receiver._id,
      status: "pending",
    });

    if (existingPendingInvite) {
      return res.status(400).json({ message: "An invitation is already pending for this user" });
    }

    const invitation = await Invitation.create({
      project: projectId,
      sender: req.user._id,
      receiver: receiver._id,
    });

    const populatedInvitation = await Invitation.findById(invitation._id)
      .populate("project", "name")
      .populate("sender", "username email")
      .populate("receiver", "username email");

    res.status(201).json({
      message: "Invitation sent successfully",
      invitation: populatedInvitation,
    });
  } catch (error) {
    console.error("createInvitation error:", error);
    res.status(500).json({ message: "Failed to send invitation" });
  }
};

export const getMyInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({
      receiver: req.user._id,
      status: "pending",
    })
      .populate("project", "name description")
      .populate("sender", "username email")
      .sort({ createdAt: -1 });

    res.json({ invitations });
  } catch (error) {
    console.error("getMyInvitations error:", error);
    res.status(500).json({ message: "Failed to load invitations" });
  }
};

export const acceptInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (invitation.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to accept this invitation" });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({ message: "Invitation has already been handled" });
    }

    const project = await Project.findById(invitation.project);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const alreadyMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!alreadyMember) {
      project.members.push({
        user: req.user._id,
        role: "member",
        status: "active",
      });
      await project.save();
    }

    invitation.status = "accepted";
    await invitation.save();

    res.json({ message: "Invitation accepted successfully" });
  } catch (error) {
    console.error("acceptInvitation error:", error);
    res.status(500).json({ message: "Failed to accept invitation" });
  }
};

export const rejectInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (invitation.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to reject this invitation" });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({ message: "Invitation has already been handled" });
    }

    invitation.status = "rejected";
    await invitation.save();

    res.json({ message: "Invitation rejected successfully" });
  } catch (error) {
    console.error("rejectInvitation error:", error);
    res.status(500).json({ message: "Failed to reject invitation" });
  }
};