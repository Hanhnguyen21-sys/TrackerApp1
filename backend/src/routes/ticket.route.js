import express from 'express';
import protect from '../middleware/auth.middleware.js';
import {requireProjectMember} from '../middleware/project.middleware.js';
import {requireColumnProjectMember} from '../middleware/column.middleware.js';
import {createTicket, getTicketsByProject, updateTicket, deleteTicket, moveTicket, getTicketsByColumn} from '../controllers/ticket.controller.js';

const router = express.Router();

// create a new ticket
// POST /api/projects/:projectId/tickets
router.post('/projects/:projectId/tickets', protect, requireProjectMember, createTicket);

// get all tickets for a project
// GET /api/projects/:projectId/tickets
router.get('/projects/:projectId/tickets', protect, requireProjectMember, getTicketsByProject);

//get all tickets by column
// GET /api/columns/:columnId/tickets
router.get('/columns/:columnId/tickets', protect, requireColumnProjectMember, getTicketsByColumn);

// update a ticket
// PUT /api/tickets/:ticketId
router.put('/tickets/:ticketId', protect, updateTicket);

// delete a ticket
// DELETE /api/tickets/:ticketId
router.delete('/tickets/:ticketId', protect, deleteTicket);         

//move a ticket to another column
// PUT /api/tickets/:ticketId/move
router.put('/tickets/:ticketId/move', protect, moveTicket);

export default router;