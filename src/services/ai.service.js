const { GoogleGenAI } = require('@google/genai');
const ApiError = require('../utils/ApiError');

const generatePlan = async (options) => {
  const { goal, timeframe, pace, preferences } = options;
  if (!process.env.GEMINI_API_KEY) {
      throw new ApiError(500, 'Gemini API key is missing (Check GEMINI_API_KEY in env)');
  }

  // Khởi tạo SDK mới theo doc
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const geminiModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  const prompt = `
User goal: "${goal}"
Timeframe: "${timeframe}"
Intensity/Pace: "${pace}"
Specific Preferences:
- Weekends off: ${preferences?.weekendsOff ? 'Yes' : 'No'}
- Early bird (AM tasks preference): ${preferences?.earlyBird ? 'Yes' : 'No'}
- Focus on fundamentals: ${preferences?.focusFundamentals ? 'Yes' : 'No'}

Role: You are an AI Architect of Success. Based on the user constraints, design a hyper-personalized roadmap. 
If user wants "Aggressive" pace, add more tasks per week. If "Casual", space them out. 
If "Weekends off" is Yes, do not schedule tasks on Saturday or Sunday.

Return ONLY JSON. Do not add any backticks or markdown formatting. The JSON must follow this exact format:

{
  "title": "A short expressive title for the goal",
  "timeframe": "${timeframe}",
  "pace": "${pace}",
  "tasks": [
    {
      "day": "Day 1",
      "timeOfDay": "Morning",
      "startTime": "09:00",
      "task": "Task description",
      "duration": "1-2h",
      "priority": "High"
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
    
    // Tìm dấu ngoặc nhọn để trích xuất JSON
    const startIdx = content.indexOf('{');
    const endIdx = content.lastIndexOf('}');
    
    if (startIdx === -1 || endIdx === -1) {
        console.error("AI response:", content);
        throw new ApiError(500, 'AI response does not contain valid JSON format');
    }
    
    const jsonStr = content.substring(startIdx, endIdx + 1);
    const parsedData = JSON.parse(jsonStr);
    return parsedData;

  } catch (error) {
    console.error("AI Service Error:", error);
    const message = error.message || 'Failed to connect to AI or generate plan';
    throw new ApiError(500, 'AI Service connectivity error: ' + message);
  }
};

module.exports = {
  generatePlan,
};
