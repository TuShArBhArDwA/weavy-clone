"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateContent(
    model: string,
    prompt: string,
    imageUrls: string[] = []
) {
    try {
        const geminiModel = genAI.getGenerativeModel({ model });

        if (imageUrls.length > 0) {
            const imageParts = imageUrls.map((base64String) => {
                // Safe split to get data
                const base64Data = base64String.split(',')[1] || base64String;
                const mimeMatch = base64String.match(/data:(.*?);base64/);
                const mimeType = mimeMatch ? mimeMatch[1] : "image/png";

                return {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType,
                    },
                };
            });

            const parts = [{ text: prompt }, ...imageParts];
            const result = await geminiModel.generateContent(parts);
            const response = await result.response;

            return { success: true, text: response.text() };
        } else {
            const result = await geminiModel.generateContent(prompt);
            const response = await result.response;

            return { success: true, text: response.text() };
        }
    } catch (error: unknown) {
        console.error("Gemini API Error:", error);

        // Fix: Type-safe error handling
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred during generation";

        return {
            success: false,
            error: errorMessage,
        };
    }
}   