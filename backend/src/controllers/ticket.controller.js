import Ticket from "../models/Ticket.js";


// create a new ticket
// POST /api/projects/:projectId/tickets
export const createTicket = async (req, res) => {
    try{
        const {projectId} = req.params;
        const {columnId, title, description, type, priority, assignee} = req.body;
        if(!title || !columnId){
            return res.status(400).json({message: 'Title and column are required'});
        }
        const lastTicket = await Ticket.findOne({project: projectId, column: columnId}).sort({order: -1});
        const newOrder = lastTicket ? lastTicket.order + 1 : 0;
        const ticket = new Ticket({
            project: projectId,
            column: columnId,
            title: title.trim(),
            description: description ? description.trim() : '',
            type: type || 'Task',
            priority: priority || 'Medium',
            reporter: req.user._id,
            assignee: assignee || null,
            order: newOrder,
        });
        await ticket.save();
        const populatedTicket = await Ticket.findById(ticket._id)
        .populate('assignee', 'username email')
        .populate('reporter', 'username email');
        res.status(201).json(populatedTicket);
    }
    catch(error){   
        console.error('Error creating ticket:', error);
        res.status(500).json({message: 'Server error'});
    }
}
// get all tickets for a project
// GET /api/projects/:projectId/tickets
export const getTicketsByProject = async (req, res) => {
    try{
        const {projectId} = req.params;
        const tickets = await Ticket.find({project: projectId})
        .populate('assignee', 'username email')
        .populate('reporter', 'username email')
        .sort({order: 1});
        res.status(201).json(tickets);
    }
    catch(error){
        console.error('Error creating ticket:', error);
        res.status(500).json({message: 'Server error'});
    }   
}

//get all tickets by column
// GET /api/columns/:columnId/tickets
export const getTicketsByColumn = async (req, res) => {
  try {
    const { columnId } = req.params;

    const tickets = await Ticket.find({ column: columnId })
      .populate("assignee", "name email")
      .populate("reporter", "name email")
      .sort({ order: 1 });

    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error getting tickets by column:", error);
    res.status(500).json({ message: error.message });
  }
};
// update a ticket
// PUT /api/tickets/:ticketId
export const updateTicket = async (req, res) => {
    try{
        const {ticketId} = req.params;
        const {title, description, type, priority, assignee} = req.body;
        const ticket = await Ticket.findById(ticketId);
        if(!ticket){
            return res.status(404).json({message: 'Ticket not found'});
        }
        if(title) ticket.title = title.trim();
        if(description !== undefined) ticket.description = description.trim();
        if(type) ticket.type = type;
        if(priority) ticket.priority = priority;
        if(assignee !== undefined) ticket.assignee = assignee;
        await ticket.save();
        
        res.status(200).json({message: 'Ticket updated successfully', ticket});
    }
    catch(error){
        console.error('Error updating ticket:', error);
        res.status(500).json({message: 'Server error'});
    }
}


//delete a ticket
// DELETE /api/tickets/:ticketId
export const deleteTicket = async (req, res) => {
    try{
        const {ticketId} = req.params;
        const ticket = await Ticket.findById(ticketId);
        if(!ticket){
            return res.status(404).json({message: 'Ticket not found'});
        }
        await Ticket.findByIdAndDelete(ticketId);
        res.status(200).json({message: 'Ticket deleted successfully'});
    }
    catch(error){
        console.error('Error deleting ticket:', error);
        res.status(500).json({message: 'Server error'});
    }
}

// move a ticket to another column (drag and drop feature)
// PUT /api/tickets/:ticketId/move
export const moveTicket = async (req, res) => {
    try{
        const {ticketId} = req.params;
        const {destinationColumnId, destinationOrder} = req.body;
        const ticket = await Ticket.findById(ticketId);
        if(!ticket){
            return res.status(404).json({message: 'Ticket not found'});
        }
        ticket.column = destinationColumnId;
        ticket.order = destinationOrder;
        await ticket.save();
        
        res.status(200).json({message: 'Ticket moved successfully', ticket});
    }
    catch(error){   
        console.error('Error moving ticket:', error);
        res.status(500).json({message: 'Server error'});
    }
}