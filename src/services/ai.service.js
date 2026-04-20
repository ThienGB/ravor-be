const { GoogleGenAI } = require('@google/genai');
const ApiError = require('../utils/ApiError');

/**
 * Calls Gemini with a prioritized model chain.
 * Falls back to the next model if the current one fails (quota / permission error).
 */
const callWithFallback = async (client, prompt) => {
  const modelChain = [
    // Primary: flash with Google Search grounding → real, up-to-date links
    {
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      tools: [{ googleSearch: {} }],
    },
    // Fallback: lite without grounding (links sourced from training data)
    {
      model: 'gemini-2.5-flash-lite',
      tools: [],
    },
  ];

  let lastError;

  for (const config of modelChain) {
    try {
      console.log(`AI: Trying model "${config.model}"...`);
      const response = await client.models.generateContent({
        model: config.model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        ...(config.tools.length > 0 && { tools: config.tools }),
      });
      console.log(`AI: Success with model "${config.model}".`);
      return response;
    } catch (err) {
      console.warn(`AI: Model "${config.model}" failed — ${err.message}. Trying next...`);
      lastError = err;
    }
  }

  throw lastError;
};

const generatePlan = async (options) => {
  const { goal, startDate, timeframe, pace, preferences } = options;
  if (!process.env.GEMINI_API_KEY) {
    throw new ApiError(500, 'Gemini API key is missing (Check GEMINI_API_KEY in env)');
  }

  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
Role: You are a "Success Architect AI". Your mission is to project-manage the user's life by designing hyper-personalized, realistic, and deeply inspiring roadmaps.

Goal: "${goal}"
Desired Start Date: "${startDate || 'Today'}"
Timeframe: "${timeframe}"
Pace: "${pace}"
Preferences: Weekends Off: ${preferences?.weekendsOff}, Early Bird: ${preferences?.earlyBird}, Fundamentals: ${preferences?.focusFundamentals}.

CRITICAL SYSTEM RULES:
1. LANGUAGE HARMONY: Auto-detect the language of the Goal: "${goal}". You MUST respond using that EXACT LANGUAGE for all visible text (title, task names, descriptions).
2. SAFETY FIRST: If the user's goal is illegal, harmful, unethical, violent, or sexually explicit, STOP. Return only the rejection JSON below.
3. QUALITY FILTER: If the goal is pure gibberish or has no clear intent, STOP. Return only the rejection JSON below.
4. REJECTION PROTOCOL: { "error": "A polite, localized message explaining why the suggestion cannot be processed." }
5. CONTENT ENRICHMENT: For EVERY task, write a captivating "description" that explains the "Why" and "How".
6. DYNAMIC DENSITY: Adjust task volume based on pace and timeframe:
    - Aggressive pace → 3-5 intensive tasks/day.
    - Casual pace → 1-2 tasks/day with rest days.
    - Short timeframe (≤1 week) → higher density.

RESOURCE LINK RULES (MANDATORY - THIS IS THE MOST IMPORTANT RULE):
- You MUST use your Google Search tool to find real, working, up-to-date URLs for EVERY task.
- EVERY task MUST have a "resourceLink" that is a real, clickable URL.
- NO placeholder links (e.g., "https://example.com", "https://youtube.com/search?q=..."). The URL must point to a SPECIFIC video, article, or documentation page.
- Search priority: YouTube tutorial > Official Docs > High-quality article (freeCodeCamp, Medium, dev.to).
- If no specific resource is found for a task, find a closely related one. A "resourceLink" field must NEVER be empty or null.

OUTPUT FORMAT (STRICT JSON — no markdown, no backticks, raw JSON only):
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
      "resourceLink": "https://www.youtube.com/watch?v=REAL_VIDEO_ID"
    }
  ]
}
`;

  try {
    const response = await callWithFallback(client, prompt);
    const content = response.text.trim();

    // Strip potential markdown code fences from model output
    const stripped = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    const startIdx = stripped.indexOf('{');
    const endIdx = stripped.lastIndexOf('}');

    if (startIdx === -1 || endIdx === -1) {
      throw new ApiError(500, 'AI failed to produce a valid roadmap format.');
    }

    const jsonStr = stripped.substring(startIdx, endIdx + 1);
    const parsedData = JSON.parse(jsonStr);

    if (parsedData.error) {
      throw new ApiError(400, parsedData.error);
    }

    return parsedData;

  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('AI Service Error:', error);
    throw new ApiError(500, 'AI System Error: ' + error.message);
  }
};

module.exports = {
  generatePlan,
};
