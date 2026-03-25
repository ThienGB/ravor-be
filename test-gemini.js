const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: 'c:/Work/Freelancer/ravor-be/.env' });

async function testGemini() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Using API Key:", key ? key.substring(0, 5) + "..." : "MISSING");
    
    if (!key) return;

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const result = await model.generateContent("Hello, are you there?");
        const response = await result.response;
        console.log("Success! Response:", response.text());
    } catch (error) {
        console.error("Gemini Test Failed!");
        console.error("Error Message:", error.message);
        if (error.response) {
            console.error("Error Details:", JSON.stringify(error.response, null, 2));
        }
    }
}

testGemini();
