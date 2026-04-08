import express from 'express';
import protect from '../middleware/auth.middleware.js';
import {
  createColumn,
  getColumnsByProjectId,
  updateColumnTitle,
  deleteColumn,
} from '../controllers/column.controller.js';
import {
  requireProjectMember,
  requireProjectAdmin,
} from "../middleware/project.middleware.js";
import{ requireColumnProjectAdmin } from "../middleware/column.middleware.js";
const router = express.Router();
// only admin can create a column in a project, but all members can view columns of a project
// need add middleware to make sure admin 
// project scope: get all columns of a project, create a new column in a project
router.get('/projects/:projectId/columns', protect, requireProjectMember, getColumnsByProjectId);
router.post('/projects/:projectId/columns', protect, requireProjectAdmin, createColumn);

// column scope: update column title, delete column
router.put('/columns/:columnId', protect, requireColumnProjectAdmin, updateColumnTitle);
router.delete('/columns/:columnId', protect, requireColumnProjectAdmin, deleteColumn);

export default router;