// middleware to check which project the column belongs to 
// and if the user is a member of that project
// request -> columnId-> find col -> get project id -> check user belongs to project or not
import Project from "../models/Project.js";
import Column from "../models/Column.js";

export const requireColumnProjectMember = async (req, res, next) => {
    try {
        const { columnId } = req.params;
        const column = await Column.findById(columnId);
        if (!column) {
            return res.status(404).json({ message: "Column not found" });
        }
        const project = await Project.findById(column.project);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        const isMember = project.members.find(
            (member) => member.user.toString() === req.user._id.toString() && member.status === "active"
        );
        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this project" });
        }
        req.column = column; // Attach the column to the request object for use in the controller
        req.project = project; // Attach the project to the request object for use in the controller
        req.projectMember = isMember;
        next();
    } catch (error) {
        console.error("Error checking project membership:", error.message);
        res.status(500).json({ message: "Server error" });
    }
}



export const requireColumnProjectAdmin = async (req, res, next) => {
    try {
        const { columnId } = req.params;
        const column = await Column.findById(columnId);
        if (!column) {
            return res.status(404).json({ message: "Column not found" });
        }
        const project = await Project.findById(column.project);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        const isAdmin = project.members.find(
            (member) => member.user.toString() === req.user._id.toString() && member.role === "admin" && member.status === "active"
        );
        if (!isAdmin) {
            return res.status(403).json({ message: "You are not an admin of this project" });
        }
        req.column = column; // Attach the column to the request object for use in the controller
        req.project = project; // Attach the project to the request object for use in the controller
        req.projectAdmin = isAdmin;
        next();
    } catch (error) {
        console.error("Error checking project admin status:", error.message);
        res.status(500).json({ message: "Server error" });
    }

}

