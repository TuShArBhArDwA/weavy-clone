import { AppNode, AppNodeData } from "@/lib/types";
import { Edge } from "@xyflow/react";

export const PRODUCT_MARKETING_KIT_WORKFLOW = {
    nodes: [
        // --- Branch A: Image Processing ---
        {
            id: "node-image-upload",
            type: "imageNode",
            position: { x: 50, y: 50 },
            data: { label: "Upload Product Image", status: "idle", inputType: "upload" },
        },
        {
            id: "node-crop",
            type: "cropImageNode",
            position: { x: 350, y: 50 },
            data: { label: "Crop Product", status: "idle", xPercent: 10, yPercent: 10, widthPercent: 80, heightPercent: 80 },
        },
        {
            id: "node-text-sys",
            type: "textNode",
            position: { x: 50, y: 250 },
            data: { label: "System Prompt", text: "You are a professional marketing copywriter. Generate a compelling one-paragraph product description.", status: "idle" },
        },
        {
            id: "node-text-product",
            type: "textNode",
            position: { x: 50, y: 400 },
            data: { label: "Product Details", text: "Product: Wireless Bluetooth Headphones. Features: Noise cancellation, 30-hour battery, foldable design.", status: "idle" },
        },
        {
            id: "node-llm-desc",
            type: "llmNode",
            position: { x: 650, y: 150 },
            data: {
                label: "Generate Description",
                status: "idle",
                model: "gemini-1.5-flash",
                temperature: 0.7,
                imageHandleCount: 1,
                outputs: []
            },
        },

        // --- Branch B: Video Processing ---
        {
            id: "node-video-upload",
            type: "videoNode",
            position: { x: 50, y: 600 },
            data: { label: "Upload Demo Video", status: "idle", inputType: "upload" },
        },
        {
            id: "node-extract-frame",
            type: "extractFrameNode",
            position: { x: 350, y: 600 },
            data: { label: "Extract Key Frame", status: "idle", timestamp: 5.0 }, // 50% roughly or just 5s
        },

        // --- Convergence: Final Marketing Post ---
        {
            id: "node-text-social",
            type: "textNode",
            position: { x: 650, y: 500 },
            data: { label: "Social Media Goal", text: "You are a social media manager. Create a tweet-length marketing post based on the product image and video frame.", status: "idle" },
        },
        {
            id: "node-llm-final",
            type: "llmNode",
            position: { x: 1000, y: 350 },
            data: {
                label: "Final Marketing Post",
                status: "idle",
                model: "gemini-1.5-flash",
                temperature: 0.8,
                imageHandleCount: 2, // Accepts Crop + Extract Frame
                outputs: []
            },
        },
    ] as AppNode[],
    edges: [
        // Branch A Connections
        { id: "e1", source: "node-image-upload", target: "node-crop", targetHandle: "image_url", sourceHandle: "output", type: "animatedEdge" },
        { id: "e2", source: "node-crop", target: "node-llm-desc", targetHandle: "image-0", sourceHandle: "output", type: "animatedEdge" },
        { id: "e3", source: "node-text-sys", target: "node-llm-desc", targetHandle: "system-prompt", sourceHandle: "output", type: "animatedEdge" },
        { id: "e4", source: "node-text-product", target: "node-llm-desc", targetHandle: "prompt", sourceHandle: "output", type: "animatedEdge" },

        // Branch B Connections
        { id: "e5", source: "node-video-upload", target: "node-extract-frame", targetHandle: "video_url", sourceHandle: "output", type: "animatedEdge" },

        // Convergence Connections
        { id: "e6", source: "node-llm-desc", target: "node-llm-final", targetHandle: "prompt", sourceHandle: "response", type: "animatedEdge" }, // Pass description as prompt context
        { id: "e7", source: "node-text-social", target: "node-llm-final", targetHandle: "system-prompt", sourceHandle: "output", type: "animatedEdge" },
        { id: "e8", source: "node-crop", target: "node-llm-final", targetHandle: "image-0", sourceHandle: "output", type: "animatedEdge" }, // Reuse cropped image
        { id: "e9", source: "node-extract-frame", target: "node-llm-final", targetHandle: "image-1", sourceHandle: "output", type: "animatedEdge" }, // Add video frame
    ] as Edge[]
};
