require("dotenv").config({ path: ".env" });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // The SDK doesn't always expose getModels easily, so we can try calling list_models via the REST API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        const flashModels = data.models.filter(m => m.name.includes("flash")).map(m => m.name);
        console.log("Available Flash Models:");
        console.log(flashModels);
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
