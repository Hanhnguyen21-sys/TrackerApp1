import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: ['invite', 'mention'],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    targetProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    targetTicket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
    },
    read: {
      type: Boolean,
      default: false,
    },
    meta: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Notification', notificationSchema);
