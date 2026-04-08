import Column from "../models/Column.js";
import Project from "../models/Project.js";

// =========== Column Controllers ===========
//get all columns of a project
// GET    /api/projects/:projectId/columns
export const getColumnsByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;
    const columns = await Column.find({ project: projectId }).sort({ order: 1 });
    res.status(200).json({columns});
  } catch (error) {
    console.error("Error fetching columns by project id:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

// create a new column
// POST   /api/projects/:projectId/column
//since project-based, middleware can access by using projectId
export const createColumn = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    const lastColumn = await Column.findOne({ project: projectId }).sort({ order: -1 });
    const newOrder = lastColumn ? lastColumn.order + 1 : 0;
    const newColumn = await Column.create({ 
        project : projectId,
        title: title.trim(),
        order: newOrder
    });
    res.status(201).json({ column: newColumn });
  } catch (error) {
    console.error("Error creating column:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// update column title
// PUT    /api/columns/:columnId
// since column-based, middleware can access by using columnId
// column must be existed to update and change title
export const updateColumnTitle = async (req, res) => {
    try {
        const { columnId } = req.params;
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }
        const column = await Column.findById(columnId);
        if (!column) {
            return res.status(404).json({ message: "Column not found" });
        }
        column.title = title.trim();
        await column.save();
        res.status(200).json({ message: "Column title updated successfully", column });
    }
    catch (error) {
        console.error("Error updating column title:", error.message);
        res.status(500).json({ message: "Server error" });
    }   
}

// delete a column
// DELETE  /api/columns/:columnId
export const deleteColumn = async (req, res) => {
    try {
        const { columnId } = req.params;
        const column = await Column.findById(columnId);
        if (!column) {
            return res.status(404).json({ message: "Column not found" });
        }
        await Column.findByIdAndDelete(columnId);
        res.status(200).json({ message: "Column deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting column:", error.message);
        res.status(500).json({ message: "Server error" });
    }   
}