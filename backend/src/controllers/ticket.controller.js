import Ticket from "../models/Ticket.js";
import Project from "../models/Project.js";

// helper: validate assignee IDs against project members
const validateAssignees = (project, assignees) => {
  const memberIds = project.members.map((member) => member.user.toString());
  return assignees.every((userId) => memberIds.includes(userId.toString()));
};

// create a new ticket
// POST /api/projects/:projectId/tickets
export const createTicket = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      columnId,
      title,
      description,
      type,
      priority,
      assignees = [],
    } = req.body;

    if (!title || !columnId) {
      return res.status(400).json({
        message: "Title and column are required",
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const normalizedAssignees = Array.isArray(assignees)
      ? assignees.filter(Boolean)
      : [];

    if (!validateAssignees(project, normalizedAssignees)) {
      return res.status(400).json({
        message: "All assignees must be members of this project",
      });
    }

    const lastTicket = await Ticket.findOne({
      project: projectId,
      column: columnId,
    }).sort({ order: -1 });

    const newOrder = lastTicket ? lastTicket.order + 1 : 0;

    const ticket = new Ticket({
      project: projectId,
      column: columnId,
      title: title.trim(),
      description: description ? description.trim() : "",
      type: type || "Task",
      priority: priority || "Medium",
      reporter: req.user._id,
      assignees: normalizedAssignees,
      order: newOrder,
    });

    await ticket.save();

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("assignees", "username email")
      .populate("reporter", "username email");

    res.status(201).json(populatedTicket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// get all tickets for a project
// GET /api/projects/:projectId/tickets
export const getTicketsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const tickets = await Ticket.find({ project: projectId })
      .populate("assignees", "username email")
      .populate("reporter", "username email")
      .sort({ order: 1 });

    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error getting tickets by project:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// get all tickets by column
// GET /api/columns/:columnId/tickets
export const getTicketsByColumn = async (req, res) => {
  try {
    const { columnId } = req.params;

    const tickets = await Ticket.find({ column: columnId })
      .populate("assignees", "username email")
      .populate("reporter", "username email")
      .sort({ order: 1 });

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
    const { title, description, type, priority, assignees } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const project = await Project.findById(ticket.project);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (title) ticket.title = title.trim();
    if (description !== undefined) {
      ticket.description = description ? description.trim() : "";
    }
    if (type) ticket.type = type;
    if (priority) ticket.priority = priority;

    if (assignees !== undefined) {
      const normalizedAssignees = Array.isArray(assignees)
        ? assignees.filter(Boolean)
        : [];

      if (!validateAssignees(project, normalizedAssignees)) {
        return res.status(400).json({
          message: "All assignees must be members of this project",
        });
      }

      ticket.assignees = normalizedAssignees;
    }

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("assignees", "username email")
      .populate("reporter", "username email");

    res.status(200).json({
      message: "Ticket updated successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// delete a ticket
// DELETE /api/tickets/:ticketId
export const deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    await Ticket.findByIdAndDelete(ticketId);

    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// move a ticket to another column
// PUT /api/tickets/:ticketId/move
export const moveTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { destinationColumnId, destinationOrder } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.column = destinationColumnId;
    ticket.order = destinationOrder;
    await ticket.save();

    res.status(200).json({
      message: "Ticket moved successfully",
      ticket,
    });
  } catch (error) {
    console.error("Error moving ticket:", error);
    res.status(500).json({ message: "Server error" });
  }
};