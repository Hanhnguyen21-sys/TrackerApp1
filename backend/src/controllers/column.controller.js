import Column from "../models/Column.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";
import { isNonEmptyString } from "../utils/validators.js";

// =========== Column Controllers ===========
//get all columns of a project
// GET    /api/projects/:projectId/columns
export const getColumnsByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;
    const columns = await Column.find({ project: projectId }).sort({ order: 1 });
    return sendSuccess(res, { columns }, 'Project columns fetched successfully');
  } catch (error) {
    console.error("Error fetching columns by project id:", error.message);
    return sendError(res, 'Server error', 500);
  }
};

// create a new column
// POST   /api/projects/:projectId/column
//since project-based, middleware can access by using projectId
export const createColumn = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title } = req.body;
    if (!isNonEmptyString(title)) {
      return sendError(res, 'Title is required', 400);
    }
    const lastColumn = await Column.findOne({ project: projectId }).sort({ order: -1 });
    const newOrder = lastColumn ? lastColumn.order + 1 : 0;
    const newColumn = await Column.create({
      project: projectId,
      title: title.trim(),
      order: newOrder,
    });
    return sendSuccess(res, { column: newColumn }, 'Column created successfully', 201);
  } catch (error) {
    console.error("Error creating column:", error.message);
    return sendError(res, 'Server error', 500);
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
        if (!isNonEmptyString(title)) {
            return sendError(res, 'Title is required', 400);
        }
        const column = await Column.findById(columnId);
        if (!column) {
            return sendError(res, 'Column not found', 404);
        }
        column.title = title.trim();
        await column.save();
        return sendSuccess(res, { column }, 'Column title updated successfully');
    }
    catch (error) {
        console.error("Error updating column title:", error.message);
        return sendError(res, 'Server error', 500);
    }   
}

// delete a column
// DELETE  /api/columns/:columnId
export const deleteColumn = async (req, res) => {
    try {
        const { columnId } = req.params;
        const column = await Column.findById(columnId);
        if (!column) {
            return sendError(res, 'Column not found', 404);
        }
        await Column.findByIdAndDelete(columnId);
        return sendSuccess(res, {}, 'Column deleted successfully');
    }
    catch (error) {
        console.error("Error deleting column:", error.message);
        return sendError(res, 'Server error', 500);
    }   
}