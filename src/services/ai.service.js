const { GoogleGenAI } = require('@google/genai');
const ApiError = require('../utils/ApiError');

const generatePlan = async (options) => {
  const { goal, startDate, timeframe, pace, preferences } = options;
  if (!process.env.GEMINI_API_KEY) {
      throw new ApiError(500, 'Gemini API key is missing (Check GEMINI_API_KEY in env)');
  }

  // Khởi tạo SDK mới theo doc
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

  const prompt = `
Role: You are a "Success Architect AI". Your mission is to project-manage the user's life by designing hyper-personalized, realistic, and deeply inspiring roadmaps.

Goal: "${goal}"
Desired Start Date: "${startDate || 'Today'}"
Timeframe: "${timeframe}"
Pace: "${pace}"
Preferences: Weekends Off: ${preferences?.weekendsOff}, Early Bird: ${preferences?.earlyBird}, Fundamentals: ${preferences?.focusFundamentals}.

CRITICAL SYSTEM RULES:
1. LANGUAGE HARMONY: Auto-detect the language of the Goal: "${goal}". You MUST respond using that EXACT LANGUAGE for all visible text (title, task names, descriptions).
2. SAFETY FIRST: If the user's goal is illegal, harmful, unethical, violent, or sexually explicit, STOP. Do not generate a plan.
3. QUALITY FILTER: If the goal is pure gibberish, nonsensical (e.g., "zxcvbnm"), or has no clear intent, STOP.
4. REJECTION PROTOCOL: Upon stopping due to Rule 2 or 3, return ONLY this JSON: { "error": "A polite, localized message explaining why the suggestion cannot be processed." }
5. CONTENT ENRICHMENT: For EVERY task, write a captivating "description" (hay, truyền cảm hứng) that explains the "Why" and "How".
6. RESOURCES: Prioritize providing a "resourceLink" for complex tasks. Use real, high-quality URLs (YouTube tutorials, documentation, tools, or educational sites).
7. DYNAMIC DENSITY: ABANDON any fixed "2-tasks-per-day" pattern. Adjust the volume and density of tasks based on context:
    - PACE: If pace is "Aggressive", schedule 3-5 intensive tasks per day. If "Casual", schedule only 1-2 tasks and include "rest/review" days.
    - COMPLEXITY: Break down complex goals into many small, actionable steps.
    - TIMEFRAME: If the timeframe is short (e.g., 1 week), density should be higher to achieve the goal.

OUTPUT FORMAT (STRICT JSON):
{
  "title": "A short, powerful title in the user's language",
  "timeframe": "${timeframe}",
  "pace": "${pace}",
  "tasks": [
    {
      "day": 1,
      "timeOfDay": "Morning/Afternoon/Evening",
      "startTime": "HH:mm",
      "task": "Action-oriented task name",
      "description": "Engaging and detailed tips in user's language",
      "duration": "1-2h",
      "priority": "low/medium/high",
      "resourceLink": "https://..."
    }
  ]
}
`;

  try {
    const response = await client.models.generateContent({
      model: geminiModel,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const content = response.text.trim();
    
    // Find JSON
    const startIdx = content.indexOf('{');
    const endIdx = content.lastIndexOf('}');
    
    if (startIdx === -1 || endIdx === -1) {
        throw new ApiError(500, 'AI failed to produce a valid roadmap format.');
    }
    
    const jsonStr = content.substring(startIdx, endIdx + 1);
    const parsedData = JSON.parse(jsonStr);

    if (parsedData.error) {
        throw new ApiError(400, parsedData.error);
    }

    return parsedData;

  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("AI Service Error:", error);
    throw new ApiError(500, 'AI System Error: ' + error.message);
  }
};

module.exports = {
  generatePlan,
};
