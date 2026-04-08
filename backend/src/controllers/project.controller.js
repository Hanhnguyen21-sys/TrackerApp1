import Project from '../models/Project.js';
import User from '../models/User.js';

// =========== Project Controllers ===========
//create a new project
export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }
    const newProject = new Project({
      name: name.trim(),
      description: description ? description.trim() : " ",
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin', status: 'active' }],
    });
    await newProject.save(); 
    const populatedProject = await Project.findById(newProject._id).populate('owner', 'username email').populate('members.user', 'username email');
    res.status(201).json({ message: "Project created successfully", project: populatedProject });
  } catch (error) {
    console.error("Error creating project:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}


// get all projects of the user
export const getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id , "members.status": "active" })
        .populate('owner', 'username email')
        .populate('members.user', 'username email')
        .sort({ createdAt: -1 });
    res.status(200).json({ projects });
  } catch (error) {
    console.error("Error fetching user projects:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

// get project by id
export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId)
        .populate('owner', 'username email')
        .populate('members.user', 'username email');
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    // check if user is a member of the project
    const isMember = project.members.some(member => member.user._id.toString() === req.user._id.toString() && member.status === 'active');
    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }
    res.status(200).json({ project });
  } catch (error) {
    console.error("Error fetching project by id:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

//update project details (only owner can update)
//update name or description of the project
export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description } = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    // only owner can update the project
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (name) project.name = name.trim();
    if (description !== undefined) project.description = description.trim();
    await project.save();
    const populatedProject = await Project.findById(project._id).populate('owner', 'username email').populate('members.user', 'username email');
    res.status(200).json({ message: "Project updated successfully", project: populatedProject });
  } catch (error) {
    console.error("Error updating project:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}


// delete a project
export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    // only owner can delete the project
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    await Project.findByIdAndDelete(projectId);
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}


// =========== Project Member Controllers ===========
// get all members of the project
export const getProjectMembers = async (req, res) => {
  try{
    const project = await Project.findById(req.project._id)
    .populate('members.user', 'username email')
    .populate('owner', 'username email');
    if(!project){
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ members: project.members });
  } catch (error) {
    console.error("Error fetching project members:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

// add a member to the project
export const addProjectMember = async (req, res) => {
  try{
    const {email} = req.body;
    const {projectId} = req.params;
    if(!email){
      return res.status(400).json({ message: "Email is required" });
    }
    const userToAdd = await User.findOne({ email: email.trim() });
    if(!userToAdd){
      return res.status(404).json({ message: "User not found" });
    }
    const project = await Project.findById(projectId);
    if(!project){
      return res.status(404).json({ message: "Project not found" });
    }
    // check if user is already a member
    const existingMember = project.members.find(member => member.user.toString() === userToAdd._id.toString());
    if(existingMember){
      return res.status(400).json({ message: "User is already a member of the project" });
    }
    project.members.push({ user: userToAdd._id, role: 'member', status: 'active' });
    await project.save();
    const populatedProject = await Project.findById(project._id).populate('owner', 'username email').populate('members.user', 'username email');
    res.status(200).json({ message: "Member added successfully", project: populatedProject });
  } catch (error) {
    console.error("Error adding project member:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

//remove a member from the project
export const removeProjectMember = async (req, res) => {
  try{
   const {projectId, userId} = req.params;
    const project = await Project.findById(projectId);
    if(!project){
      return res.status(404).json({ message: "Project not found" });
    }
    const memberIndex = project.members.findIndex(member => member.user.toString() === userId);
    if(memberIndex === -1){
      return res.status(404).json({ message: "Member not found in the project" });
    }
    // prevent removing the owner
    if(project.members[memberIndex].role === 'admin'){
      return res.status(400).json({ message: "Cannot remove project owner" });
    }
    project.members.splice(memberIndex, 1);
    await project.save();
    const populatedProject = await Project.findById(project._id).populate('owner', 'username email').populate('members.user', 'username email');
    res.status(200).json({ message: "Member removed successfully", project: populatedProject });
  }
  catch (error) {
    console.error("Error removing project member:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}