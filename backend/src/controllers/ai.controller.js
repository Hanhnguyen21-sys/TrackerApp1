import OpenAI from "openai";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

export const generateProjectBoard = async (req, res) => {
  try {
    

    const { name } = req.body;

    if (!name || !name.trim()) {
      return sendError(res, "Project name is required", 400);
    }

    

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
Generate a project board for: "${name}".

Return ONLY valid JSON. No markdown. No explanation.

Format:
{
  "columns": [
    {
      "title": "Column name",
      "tasks": [
        {
          "title": "Task title",
          "description": "Short description",
          "priority": "Low"
        }
      ]
    }
  ]
}

Rules:
- Create 3 to 5 columns.
- Each column should have 2 to 4 tasks.
- priority must be only "Low", "Medium", or "High".
`;

    

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    

    const text = completion.choices[0].message.content;
  

    const parsed = JSON.parse(text);

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