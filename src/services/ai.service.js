const { GoogleGenerativeAI } = require('@google/generative-ai');
const ApiError = require('../utils/ApiError');

const generatePlan = async (goal) => {
  if (!process.env.GEMINI_API_KEY) {
      throw new ApiError(500, 'Gemini API key is missing');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
User goal: "${goal}"

Return ONLY JSON. Do not add any backticks or markdown formatting. The JSON must follow this exact format:

{
  "title": "A short expressive title for the goal",
  "duration": "Duration required, e.g., '3 months'",
  "tasks": [
    {
      "title": "Task title",
      "description": "Task description",
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
    // Sometimes AI tries to wrap inside \`\`\`json ... \`\`\` despite explicit instructions
    const parsedData = JSON.parse(content.replace(/```json|```/g, '').trim());
    return parsedData;
  } catch (error) {
    console.error("AI Service Error:", error);
    if (error instanceof SyntaxError) {
        throw new ApiError(500, 'AI generated invalid JSON format');
    }
    throw new ApiError(500, 'Failed to connect to AI or generate plan');
  }
};

module.exports = {
  generatePlan,
};
