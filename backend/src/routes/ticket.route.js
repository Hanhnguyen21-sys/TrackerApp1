import express from 'express';
import protect from '../middleware/auth.middleware.js';
import {requireProjectMember, requireTicketProjectMember} from '../middleware/project.middleware.js';
import {requireColumnProjectMember} from '../middleware/column.middleware.js';
import {createTicket, getTicketsByProject, updateTicket, deleteTicket, moveTicket, getTicketsByColumn, searchTickets, getTicketDetails, addTicketComment} from '../controllers/ticket.controller.js';

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
router.put('/tickets/:ticketId', protect, requireTicketProjectMember, updateTicket);

// delete a ticket
// DELETE /api/tickets/:ticketId
router.delete('/tickets/:ticketId', protect, requireTicketProjectMember, deleteTicket);         

//move a ticket to another column
// PUT /api/tickets/:ticketId/move
router.put('/tickets/:ticketId/move', protect, requireTicketProjectMember, moveTicket);
// get ticket details with comments and activity
// GET /api/tickets/:ticketId/details
router.get('/tickets/:ticketId/details', protect, requireTicketProjectMember, getTicketDetails);

// add a comment to a ticket
// POST /api/tickets/:ticketId/comments
router.post('/tickets/:ticketId/comments', protect, requireTicketProjectMember, addTicketComment);
// search tickets in a project
// GET /api/projects/:projectId/tickets/search
router.get('/projects/:projectId/tickets/search', protect, requireProjectMember, searchTickets);

export default router;