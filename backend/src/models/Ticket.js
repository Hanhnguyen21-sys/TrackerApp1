import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    project:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    column:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Column',
        required: true, 
    },
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        default: '',
        trim: true,
    },
    type:{
        type: String,
        enum: ['Task', 'Bug', 'Feature'],
        default: 'Task',
    },
    priority:{
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium',
    },
    reporter:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    assignee:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    dueDate: {
        type: Date,
    default: null,
    },
    reminderSent: {
        type: Boolean,
        default: false,
    },
    order:{
        type: Number,
        required: true,
        default: 0,
    },
    completed: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

export default mongoose.model('Ticket', ticketSchema);

