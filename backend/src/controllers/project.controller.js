import Project from '../models/Project.js';
import User from '../models/User.js';
import Column from '../models/Column.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { isNonEmptyString, validateEmail } from '../utils/validators.js';

// =========== Project Controllers ===========
//create a new project
export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!isNonEmptyString(name)) {
      return sendError(res, 'Project name is required', 400);
    }

    const newProject = new Project({
      name: name.trim(),
      description: isNonEmptyString(description) ? description.trim() : '',
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin', status: 'active' }],
    });
    await newProject.save();

    const projectColumns = [
      { project: newProject._id, title: 'To Do', order: 0 },
      { project: newProject._id, title: 'In Progress', order: 1 },
      { project: newProject._id, title: 'Done', order: 2 },
    ];
    await Column.insertMany(projectColumns);

    const populatedProject = await Project.findById(newProject._id)
      .populate('owner', 'username email')
      .populate('members.user', 'username email');

    return sendSuccess(res, { project: populatedProject }, 'Project created successfully', 201);
  } catch (error) {
    console.error('Error creating project:', error.message);
    return sendError(res, 'Server error', 500);
  }
};

// get all projects of the user
export const getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id, 'members.status': 'active' })
      .populate('owner', 'username email')
      .populate('members.user', 'username email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, { projects }, 'User projects fetched successfully');
  } catch (error) {
    console.error('Error fetching user projects:', error.message);
    return sendError(res, 'Server error', 500);
  }
};

// get project by id
export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId)
      .populate('owner', 'username email')
      .populate('members.user', 'username email');

    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    const isMember = project.members.some(
      (member) => member.user._id.toString() === req.user._id.toString() && member.status === 'active'
    );
    if (!isMember) {
      return sendError(res, 'Access denied', 403);
    }

    return sendSuccess(res, { project }, 'Project fetched successfully');
  } catch (error) {
    console.error('Error fetching project by id:', error.message);
    return sendError(res, 'Server error', 500);
  }
};

//update project details (only admins can update)
//update name or description of the project
export const updateProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = req.project;

    if (!project) {
      return sendError(res, 'Project not found', 404);
    }
    if (name !== undefined) {
      if (!isNonEmptyString(name)) {
        return sendError(res, 'Project name cannot be empty', 400);
      }
      project.name = name.trim();
    }
    if (description !== undefined) {
      project.description = description.trim();
    }

    await project.save();
    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'username email')
      .populate('members.user', 'username email');

    return sendSuccess(res, { project: populatedProject }, 'Project updated successfully');
  } catch (error) {
    console.error('Error updating project:', error.message);
    return sendError(res, 'Server error', 500);
  }
};

// delete a project
export const deleteProject = async (req, res) => {
  try {
    const project = req.project;
    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    await Project.findByIdAndDelete(project._id);
    return sendSuccess(res, {}, 'Project deleted successfully');
  } catch (error) {
    console.error('Error deleting project:', error.message);
    return sendError(res, 'Server error', 500);
  }
};

// =========== Project Member Controllers ===========
// get all members of the project
export const getProjectMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.project._id)
      .populate('members.user', 'username email')
      .populate('owner', 'username email');

    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    return sendSuccess(res, { members: project.members }, 'Project members fetched successfully');
  } catch (error) {
    console.error('Error fetching project members:', error.message);
    return sendError(res, 'Server error', 500);
  }
};

// add a member to the project
export const addProjectMember = async (req, res) => {
  try {
    const { email } = req.body;
    if (!validateEmail(email)) {
      return sendError(res, 'A valid email is required', 400);
    }

    const userToAdd = await User.findOne({ email: email.trim().toLowerCase() });
    if (!userToAdd) {
      return sendError(res, 'User not found', 404);
    }

    const project = req.project;
    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    const existingMember = project.members.find(
      (member) => member.user.toString() === userToAdd._id.toString()
    );
    if (existingMember) {
      if (existingMember.status === 'invited') {
        return sendError(res, 'User has already been invited to the project', 400);
      }
      return sendError(res, 'User is already a member of the project', 400);
    }

    project.members.push({ user: userToAdd._id, role: 'member', status: 'invited' });
    await project.save();
    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'username email')
      .populate('members.user', 'username email');

    return sendSuccess(res, { project: populatedProject }, 'Member invited successfully');
  } catch (error) {
    console.error('Error adding project member:', error.message);
    return sendError(res, 'Server error', 500);
  }
};

export const acceptProjectInvitation = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    if (req.user._id.toString() !== userId) {
      return sendError(res, 'You can only accept your own invitations', 403);
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    const member = project.members.find(
      (member) => member.user.toString() === userId && member.status === 'invited'
    );
    if (!member) {
      return sendError(res, 'Invitation not found', 404);
    }

    member.status = 'active';
    member.joinedAt = new Date();
    await project.save();
    const populatedProject = await Project.findById(project._id)
      .populate('members.user', 'username email')
      .populate('owner', 'username email');

    return sendSuccess(res, { project: populatedProject }, 'Invitation accepted successfully');
  } catch (error) {
    console.error('Error accepting project invitation:', error.message);
    return sendError(res, 'Server error', 500);
  }
};

//remove a member from the project
export const removeProjectMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    const memberIndex = project.members.findIndex(
      (member) => member.user.toString() === userId
    );
    if (memberIndex === -1) {
      return sendError(res, 'Member not found in the project', 404);
    }

    if (project.members[memberIndex].role === 'admin') {
      return sendError(res, 'Cannot remove project owner', 400);
    }

    project.members.splice(memberIndex, 1);
    await project.save();
    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'username email')
      .populate('members.user', 'username email');

    return sendSuccess(res, { project: populatedProject }, 'Member removed successfully');
  } catch (error) {
    console.error('Error removing project member:', error.message);
    return sendError(res, 'Server error', 500);
  }
};