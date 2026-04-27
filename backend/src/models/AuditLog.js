import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      trim: true,
      default: '',
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

export default mongoose.model('AuditLog', auditLogSchema);
