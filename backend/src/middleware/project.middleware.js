import Project from "../models/Project.js";
// check whether the user is a member of the project
export const requireProjectMember = async (req, res, next) => {
    try{
        const { projectId } = req.params; // from API endpoint
        const project = await Project.findById(projectId); // from database
        if(!project){
            return res.status(404).json({ message: "Project not found" });
        }
        const member = project.members.find(member => member.user.toString() === req.user._id.toString() && member.status === 'active');
        if(!member){
            return res.status(403).json({ message: "Access denied, not a project member" });
        }
        req.project = project; // Attach the project to the request object for use in controllers
        req.projectMember = member; // Attach the member info to the request object for use in controllers
        next();
    } catch (error) {
        console.error("Error in project middleware:", error.message);
        res.status(500).json({ message: "Server error" });
    }
}

export const requireProjectAdmin = async (req, res, next) => {
    try{
        const { projectId } = req.params;
        const project = await Project.findById(projectId);
        if(!project){
            return res.status(404).json({ message: "Project not found" });
        }
        const member = project.members.find(member => member.user.toString() === req.user._id.toString() && member.status === 'active');
        if(member.role !== 'admin'){
            return res.status(403).json({ message: "Access denied, not a project admin" });
        }
        req.project = project; // Attach the project to the request object for use in controllers
        req.projectMember = member; // Attach the member info to the request object for use in controllers
        next();
    } catch (error) {
        console.error("Error in project middleware:", error.message);
        res.status(500).json({ message: "Server error" });
    }
}

