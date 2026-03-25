const { GoogleGenerativeAI } = require('@google/generative-ai');
const ApiError = require('../utils/ApiError');

const generatePlan = async (options) => {
  const { goal, timeframe, pace, preferences } = options;
  if (!process.env.GEMINI_API_KEY) {
      throw new ApiError(500, 'Gemini API key is missing');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
  "tasks": [
    {
      "title": "Task title",
      "description": "Task description, tailored to the user's pace",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD",
      "priority": "low | medium | high"
    }
  ]
}
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
      }
    });

    const response = await result.response;
    const content = response.text().trim();
    
    // Find the first '{' and the last '}' to extract only the JSON part
    const startIdx = content.indexOf('{');
    const endIdx = content.lastIndexOf('}');
    
    if (startIdx === -1 || endIdx === -1) {
        throw new ApiError(500, 'AI response does not contain valid JSON format: ' + content);
    }
    
    const jsonStr = content.substring(startIdx, endIdx + 1);
    const parsedData = JSON.parse(jsonStr);
    return parsedData;
  } catch (error) {
    console.error("AI Service Error:", error);
    if (error instanceof SyntaxError) {
        throw new ApiError(500, 'AI generated invalid JSON (Parse error): ' + error.message);
    }
    const message = error.response ? (error.response.data?.error?.message || error.message) : error.message;
    throw new ApiError(500, 'AI Service connectivity error: ' + message);
  }
};

module.exports = {
  generatePlan,
};
