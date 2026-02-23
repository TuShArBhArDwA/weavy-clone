import { task } from "@trigger.dev/sdk/v3";
import { GoogleGenerativeAI } from "@google/generative-ai";
export { cropImageTask, extractFrameTask } from "./ffmpeg-tasks";

// Initialize Gemini
// 1. Define the Input Payload Type strictly
interface AIJobPayload {
    prompt: string;
    systemPrompt?: string;
    imageUrls?: string[]; // Array of Base64 strings or URLs
    model?: string;       // e.g., "gemini-1.5-flash"
    temperature?: number;
}

export const aiGenerator = task({
    id: "generate-text",
    run: async (payload: AIJobPayload) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
        const genAI = new GoogleGenerativeAI(apiKey);

        // Default to 1.5-flash if model is missing or invalid
        const modelName = payload.model || "gemini-1.5-flash";

        console.log(`🤖 [Worker] Starting AI Task using model: ${modelName}`);
        console.log(`   - Prompt length: ${payload.prompt.length}`);
        console.log(`   - Images: ${payload.imageUrls?.length || 0}`);

        const model = genAI.getGenerativeModel({ model: modelName });

        try {
            // Prepare Content Parts for Multimodal Input
            const parts: any[] = [];

            // Add System Prompt if exists (prepend to text)
            let fullText = payload.prompt;
            if (payload.systemPrompt) {
                fullText = `System Instructions: ${payload.systemPrompt}\n\nUser Request: ${payload.prompt}`;
            }
            parts.push({ text: fullText });

            // Add Images
            if (payload.imageUrls && payload.imageUrls.length > 0) {
                for (const url of payload.imageUrls) {
                    // Handle Base64
                    if (url.startsWith("data:")) {
                        const base64Data = url.split(",")[1];
                        const mimeType = url.substring(url.indexOf(":") + 1, url.indexOf(";"));
                        parts.push({
                            inlineData: {
                                data: base64Data,
                                mimeType: mimeType
                            }
                        });
                    }
                    // Handle Remote URLs (fetch them)
                    else {
                        const resp = await fetch(url);
                        const buf = await resp.arrayBuffer();
                        parts.push({
                            inlineData: {
                                data: Buffer.from(buf).toString("base64"),
                                mimeType: "image/jpeg"
                            }
                        });
                    }
                }
            }

            // Execute Gemini
            const result = await model.generateContent(parts);
            const response = await result.response;
            const text = response.text();

            return {
                success: true,
                text: text,
            };

        } catch (error) {
            console.error(`[Worker] Gemini Failed:`, error);
            throw error; // Throwing allows Trigger.dev to show it as "Failed" in dashboard
        }
    },
});