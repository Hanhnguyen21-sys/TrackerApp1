import express from 'express';
import { createProject, getUserProjects, getProjectById } from '../controllers/project.controller.js';
import { getProjectMembers, addProjectMember, removeProjectMember, deleteProject, updateProject, acceptProjectInvitation } from '../controllers/project.controller.js';
import protect from '../middleware/auth.middleware.js';
import {
  requireProjectMember,
  requireProjectAdmin,
} from "../middleware/project.middleware.js";
const router = express.Router();

// Create a new project
router.post('/', protect, createProject);

// Get all projects of the user
router.get('/', protect, getUserProjects);

// Get project by id
router.get('/:projectId', protect, getProjectById);

//update project details (only admins can update)
router.put('/:projectId', protect, requireProjectAdmin, updateProject);

// Delete a project
router.delete('/:projectId', protect, requireProjectAdmin, deleteProject);

// Get all members of a project
router.get('/:projectId/members', protect, requireProjectMember, getProjectMembers);

// Add a member to a project
router.post('/:projectId/members', protect, requireProjectAdmin, addProjectMember);

// Accept a project invitation
router.post('/:projectId/members/:userId/accept', protect, acceptProjectInvitation);

// Remove a member from a project
router.delete('/:projectId/members/:userId', protect, requireProjectAdmin, removeProjectMember);

export default router;