import mongoose from "mongoose";

const projectMemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  status: { type: String, enum: ['active', 'invited'], default: 'active' },
  joinedAt: { type: Date, default: Date.now },
}, { _id: false });


const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: " ", trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [projectMemberSchema],
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

export default Project;