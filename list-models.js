const https = require('https');
require('dotenv').config({ path: 'c:/Work/Freelancer/ravor-be/.env' });

const listModels = async () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("GEMINI_API_KEY is missing in .env");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1/models?key=${key}`;
  
  https.get(url, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        console.log("Available Models:");
        if (parsedData.models) {
            parsedData.models.forEach(m => {
                if (m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name} (${m.displayName})`);
                }
            });
        } else {
            console.log("Error or No models found:", JSON.stringify(parsedData, null, 2));
        }
      } catch (e) {
        console.error("Parse error:", e.message);
      }
    });
  }).on('error', (e) => {
    console.error("HTTP error:", e.message);
  });
};

listModels();
