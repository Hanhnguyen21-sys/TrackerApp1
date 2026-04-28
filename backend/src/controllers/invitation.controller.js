import Invitation from "../models/Invitation.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";
import { validateEmail } from "../utils/validators.js";

export const createInvitation = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;

    if (!validateEmail(email)) {
      return sendError(res, 'A valid email is required', 400);
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    const isAdmin = project.members.some((member) => {
      const memberUserId = member.user.toString();
      return memberUserId === req.user._id.toString() && member.role === 'admin';
    });

    if (!isAdmin) {
      return sendError(res, 'Only project admins can send invitations', 403);
    }

    const receiver = await User.findOne({ email: email.trim().toLowerCase() });
    if (!receiver) {
      return sendError(res, 'User with that email was not found', 404);
    }

    const alreadyMember = project.members.some(
      (member) => member.user.toString() === receiver._id.toString()
    );

    if (alreadyMember) {
      return sendError(res, 'User is already a project member', 400);
    }

    const existingPendingInvite = await Invitation.findOne({
      project: projectId,
      receiver: receiver._id,
      status: 'pending',
    });

    if (existingPendingInvite) {
      return sendError(res, 'An invitation is already pending for this user', 400);
    }

    const invitation = await Invitation.create({
      project: projectId,
      sender: req.user._id,
      receiver: receiver._id,
    });

    const populatedInvitation = await Invitation.findById(invitation._id)
      .populate('project', 'name')
      .populate('sender', 'username email')
      .populate('receiver', 'username email');

    return sendSuccess(res, { invitation: populatedInvitation }, 'Invitation sent successfully', 201);
  } catch (error) {
    console.error('createInvitation error:', error);
    return sendError(res, 'Failed to send invitation', 500);
  }
};

export const getMyInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({
      receiver: req.user._id,
      status: 'pending',
    })
      .populate('project', 'name description')
      .populate('sender', 'username email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, { invitations }, 'Invitations fetched successfully');
  } catch (error) {
    console.error('getMyInvitations error:', error);
    return sendError(res, 'Failed to load invitations', 500);
  }
};

export const acceptInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return sendError(res, 'Invitation not found', 404);
    }

    if (invitation.receiver.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not allowed to accept this invitation', 403);
    }

    if (invitation.status !== 'pending') {
      return sendError(res, 'Invitation has already been handled', 400);
    }

    const project = await Project.findById(invitation.project);
    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    const alreadyMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!alreadyMember) {
      project.members.push({
        user: req.user._id,
        role: 'member',
        status: 'active',
      });
      await project.save();
    }

    invitation.status = 'accepted';
    await invitation.save();

    return sendSuccess(res, {}, 'Invitation accepted successfully');
  } catch (error) {
    console.error('acceptInvitation error:', error);
    return sendError(res, 'Failed to accept invitation', 500);
  }
};

export const rejectInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return sendError(res, 'Invitation not found', 404);
    }

    if (invitation.receiver.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not allowed to reject this invitation', 403);
    }

    if (invitation.status !== 'pending') {
      return sendError(res, 'Invitation has already been handled', 400);
    }

    invitation.status = 'rejected';
    await invitation.save();

    return sendSuccess(res, {}, 'Invitation rejected successfully');
  } catch (error) {
    console.error('rejectInvitation error:', error);
    return sendError(res, 'Failed to reject invitation', 500);
  }
};