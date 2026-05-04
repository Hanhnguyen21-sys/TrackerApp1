import Groq from "groq-sdk";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

export const generateProjectBoard = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return sendError(res, "Project name is required", 400);
    }

    const prompt = `
                    Generate a project board for: "${name}".
                    Project Description: "${description || "No description provided."}"

                    Return ONLY valid JSON format. No markdown. No explanation.

                    Format: {
                      "refinedName": "A more professional or catchy name for the project",
                      "refinedDescription": "A professional and detailed description based on the user's intent",
                      "columns": [
                        {
                          "title": "Phase name (e.g., Phase 1: Planning)",
                          "tasks": [
                            {
                              "title": "Task title",
                              "description": "Short description",
                              "priority": "Low",
                              "effortPoints": 3,
                              "dueDate": "YYYY-MM-DD",
                              "status": "Task status (e.g., Grooming, To-Do, In Progress, Testing, Done)"
                            }
                          ]
                        }
                      ]
                    }

                    Rules:
                    - Current Date: ${new Date().toISOString().split('T')[0]} (Today is in ${new Date().getFullYear()}).
                    - refinedName: A professional name for the project.
                    - refinedDescription: A detailed brief of the project.
                    - Columns: Generate 3 to 5 phases representing the project timeline.
                    - Tasks: Each task MUST have a "status" relevant to the project (e.g., "Grooming", "To-Do", "In Progress", "Testing", "Done").
                    - The default status for early-stage tasks should be "Grooming".
                    - All tasks should be distributed across phases logically.
                    - priority must be only "Low", "Medium", or "High".
                    - effortPoints should be a number (ideally 1, 2, 3, 5, or 8).
                    - tasks must have a dueDate within 2026.
                  `;

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
    
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const parsed = JSON.parse(response.choices[0].message.content);

    return sendSuccess(
      res,
      parsed,
      "AI project board generated successfully"
    );
  } catch (error) {
    console.error("AI generation error:", error);
    return sendError(res, "Failed to generate AI project board", 500);
  }
};