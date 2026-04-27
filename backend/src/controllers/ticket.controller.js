import Ticket from "../models/Ticket.js";
import Comment from "../models/Comment.js";
import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";
import { isNonEmptyString, validateOrder } from "../utils/validators.js";

const extractMentionUsernames = (text) => {
  const mentionRegex = /@([a-zA-Z0-9_.-]+)/g;
  const mentions = new Set();
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.add(match[1]);
  }

  return Array.from(mentions);
};

const createAuditEntry = async ({ ticket, actorId, action, details, meta = {} }) => {
  try {
    const log = new AuditLog({
      ticket: ticket._id,
      project: ticket.project,
      actor: actorId,
      action,
      details,
      meta,
    });
    await log.save();
  } catch (error) {
    console.error('Error creating audit log entry:', error);
  }
};

const createMentionNotifications = async ({ ticket, actorId, mentionedUsers, commentBody }) => {
  try {
    const notifications = mentionedUsers.map((user) => ({
      recipient: user._id,
      sender: actorId,
      type: 'mention',
      message: `${commentBody.substring(0, 80)}...`,
      targetProject: ticket.project,
      targetTicket: ticket._id,
      meta: {
        ticketTitle: ticket.title,
      },
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Error creating mention notifications:', error);
  }
};

const buildTicketResponse = async (ticket) => {
  return Ticket.findById(ticket._id)
    .populate('assignee', 'username email')
    .populate('reporter', 'username email');
};

// create a new ticket
// POST /api/projects/:projectId/tickets
export const createTicket = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { columnId, title, description, type, priority, assignee, dueDate } = req.body;

        if (!isNonEmptyString(title) || !isNonEmptyString(columnId)) {
            return sendError(res, 'Title and column are required', 400);
        }

        const lastTicket = await Ticket.findOne({ project: projectId, column: columnId }).sort({ order: -1 });
        const newOrder = lastTicket ? lastTicket.order + 1 : 0;
        const ticket = new Ticket({
            project: projectId,
            column: columnId.trim(),
            title: title.trim(),
            description: isNonEmptyString(description) ? description.trim() : '',
            type: isNonEmptyString(type) ? type.trim() : 'Task',
            priority: isNonEmptyString(priority) ? priority.trim() : 'Medium',
            reporter: req.user._id,
            assignee: assignee || null,
            dueDate: dueDate || null,
            order: newOrder,
        });
        await ticket.save();
        await createAuditEntry({
          ticket,
          actorId: req.user._id,
          action: 'created',
          details: `Ticket created with title: ${ticket.title}`,
        });
        const populatedTicket = await buildTicketResponse(ticket);
        return sendSuccess(res, { ticket: populatedTicket }, 'Ticket created successfully', 201);
    } catch (error) {
        console.error('Error creating ticket:', error);
        return sendError(res, 'Server error', 500);
    }
};

// get all tickets for a project
// GET /api/projects/:projectId/tickets
export const getTicketsByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const tickets = await Ticket.find({ project: projectId })
            .populate('assignee', 'username email')
            .populate('reporter', 'username email')
            .sort({ order: 1 });
        return sendSuccess(res, { tickets }, 'Project tickets fetched successfully');
    } catch (error) {
        console.error('Error getting project tickets:', error);
        return sendError(res, 'Server error', 500);
    }
};

// get all tickets by column
// GET /api/columns/:columnId/tickets
export const getTicketsByColumn = async (req, res) => {
    try {
        const { columnId } = req.params;
        const tickets = await Ticket.find({ column: columnId })
            .populate('assignee', 'username email')
            .populate('reporter', 'username email')
            .sort({ order: 1 });
        return sendSuccess(res, { tickets }, 'Column tickets fetched successfully');
    } catch (error) {
        console.error('Error getting tickets by column:', error);
        return sendError(res, 'Server error', 500);
    }
};

// search tickets by title or description within a project
// GET /api/projects/:projectId/tickets/search
export const searchTickets = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { query } = req.query;
        if (!isNonEmptyString(query)) {
            return sendError(res, 'Search query is required', 400);
        }
        const tickets = await Ticket.find({
            project: projectId,
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
            ],
        })
            .populate('assignee', 'username email')
            .populate('reporter', 'username email')
            .sort({ order: 1 });
        return sendSuccess(res, { tickets }, 'Ticket search completed successfully');
    } catch (error) {
        console.error('Error searching tickets:', error);
        return sendError(res, 'Server error', 500);
    }
};

// update a ticket
// PUT /api/tickets/:ticketId
export const updateTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { title, description, type, priority, assignee, dueDate } = req.body;
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return sendError(res, 'Ticket not found', 404);
        }
        if (title !== undefined) {
            if (!isNonEmptyString(title)) {
                return sendError(res, 'Title cannot be empty', 400);
            }
            ticket.title = title.trim();
        }
        if (description !== undefined) ticket.description = description.trim();
        if (type !== undefined) ticket.type = type;
        if (priority !== undefined) ticket.priority = priority;
        if (assignee !== undefined) ticket.assignee = assignee;
        if (dueDate !== undefined) ticket.dueDate = dueDate;
        await ticket.save();
        await createAuditEntry({
          ticket,
          actorId: req.user._id,
          action: 'updated',
          details: 'Ticket details updated',
        });
        const populatedTicket = await buildTicketResponse(ticket);
        return sendSuccess(res, { ticket: populatedTicket }, 'Ticket updated successfully');
    } catch (error) {
        console.error('Error updating ticket:', error);
        return sendError(res, 'Server error', 500);
    }
};

// delete a ticket
// DELETE /api/tickets/:ticketId
export const deleteTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return sendError(res, 'Ticket not found', 404);
        }
        await createAuditEntry({
          ticket,
          actorId: req.user._id,
          action: 'deleted',
          details: `Ticket deleted: ${ticket.title}`,
        });
        await Ticket.findByIdAndDelete(ticketId);
        return sendSuccess(res, {}, 'Ticket deleted successfully');
    } catch (error) {
        console.error('Error deleting ticket:', error);
        return sendError(res, 'Server error', 500);
    }
};

// move a ticket to another column (drag and drop feature)
// PUT /api/tickets/:ticketId/move
export const moveTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { destinationColumnId, destinationOrder } = req.body;

        if (!isNonEmptyString(destinationColumnId) || !validateOrder(destinationOrder)) {
            return sendError(res, 'Destination column and valid order are required', 400);
        }

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return sendError(res, 'Ticket not found', 404);
        }
        ticket.column = destinationColumnId.trim();
        ticket.order = destinationOrder;
        await ticket.save();
        await createAuditEntry({
          ticket,
          actorId: req.user._id,
          action: 'moved',
          details: `Moved ticket to column ${destinationColumnId} with order ${destinationOrder}`,
        });
        const populatedTicket = await buildTicketResponse(ticket);
        return sendSuccess(res, { ticket: populatedTicket }, 'Ticket moved successfully');
    } catch (error) {
        console.error('Error moving ticket:', error);
        return sendError(res, 'Server error', 500);
    }
};

export const getTicketDetails = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findById(ticketId)
      .populate('assignee', 'username email')
      .populate('reporter', 'username email')
      .populate('project', 'name');

    if (!ticket) {
      return sendError(res, 'Ticket not found', 404);
    }

    const comments = await Comment.find({ ticket: ticketId })
      .populate('author', 'username email')
      .populate('mentions', 'username email')
      .sort({ createdAt: 1 });

    const activity = await AuditLog.find({ ticket: ticketId })
      .populate('actor', 'username email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, { ticket, comments, activity }, 'Ticket details fetched successfully');
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    return sendError(res, 'Server error', 500);
  }
};

export const addTicketComment = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { body } = req.body;

    if (!isNonEmptyString(body)) {
      return sendError(res, 'Comment body is required', 400);
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return sendError(res, 'Ticket not found', 404);
    }

    const mentionNames = extractMentionUsernames(body);
    const mentionedUsers = mentionNames.length
      ? await User.find({ username: { $in: mentionNames } }).select('username email')
      : [];

    const comment = new Comment({
      ticket: ticketId,
      author: req.user._id,
      body: body.trim(),
      mentions: mentionedUsers.map((user) => user._id),
    });
    await comment.save();

    if (mentionedUsers.length > 0) {
      await createMentionNotifications({
        ticket,
        actorId: req.user._id,
        mentionedUsers,
        commentBody: body.trim(),
      });
    }

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username email')
      .populate('mentions', 'username email');

    await createAuditEntry({
      ticket,
      actorId: req.user._id,
      action: 'commented',
      details: `Comment added: ${body.trim().substring(0, 120)}`,
    });

    return sendSuccess(res, { comment: populatedComment }, 'Comment added successfully', 201);
  } catch (error) {
    console.error('Error adding ticket comment:', error);
    return sendError(res, 'Server error', 500);
  }
};