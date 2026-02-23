import { AppNode } from "./types";
import { Edge } from "@xyflow/react";

export const DEMO_WORKFLOWS = [
    {
        id: "demo-product-listing",
        name: "Product Listing Generator",
        description: "Generate SEO, Social, and Description from product images.",
        thumbnail: "🎯",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
        getGraph: (): { nodes: AppNode[], edges: Edge[] } => {
            const nodes: AppNode[] = [
                // 1. INPUTS (3 Images) - Using local demo images

                {
                    id: 'img-1',
                    type: 'imageNode',
                    position: { x: 0, y: 0 },
                    data: {
                        label: 'Front View',
                        status: 'success',
                        inputType: 'upload',
                        image: '/demo/shoe-front.jpg'
                    }
                },
                {
                    id: 'img-2',
                    type: 'imageNode',
                    position: { x: 0, y: 350 },
                    data: {
                        label: 'Side View',
                        status: 'success',
                        inputType: 'upload',
                        image: '/demo/shoe-side.jpg'
                    }
                },
                {
                    id: 'img-3',
                    type: 'imageNode',
                    position: { x: 0, y: 700 },
                    data: {
                        label: 'Detail View',
                        status: 'success',
                        inputType: 'upload',
                        image: '/demo/shoe-detail.jpg'
                    }
                },

                // -----------------------------------------------------------
                // 2. THE PROMPTS (Instructions as Text Nodes) 
                // -----------------------------------------------------------
                {
                    id: 'prompt-merger',
                    type: 'textNode',
                    position: { x: 250, y: 150 },
                    data: {
                        label: 'Analyst Instructions',
                        status: 'idle',
                        text: `You are a Senior Product Analyst. Analyze these 3 product images (Front, Side, Detail). 
                        
Output a detailed technical specification of this product. Include:
1. Color palette and Materials (be specific).
2. Design features (sole type, stitching, branding).
3. Functional benefits (breathability, support).
4. Target demographic and style category.

Do not write marketing copy yet. Just output the raw facts and visual details.`
                    }
                },

                {
                    id: 'prompt-amazon',
                    type: 'textNode',
                    position: { x: 750, y: 0 },
                    data: {
                        label: 'Write Amazon Listing',
                        status: 'idle',
                        text: `Write a compelling Amazon product listing based on the product analysis provided. Include:
- A catchy product title (60-80 characters)
- 5-7 bullet points highlighting key features and benefits
- Use persuasive, customer-focused language
- Focus on value proposition and unique selling points`
                    }
                },

                {
                    id: 'prompt-instagram',
                    type: 'textNode',
                    position: { x: 750, y: 350 },
                    data: {
                        label: 'Write Instagram Caption',
                        status: 'idle',
                        text: `Create an engaging Instagram caption based on the product details provided:
- Keep it under 150 words
- Include relevant emojis
- Add a strong call-to-action
- Use 3-5 relevant hashtags
- Make it trendy and shareable`
                    }
                },

                {
                    id: 'prompt-seo',
                    type: 'textNode',
                    position: { x: 750, y: 700 },
                    data: {
                        label: 'Write SEO Meta Description',
                        status: 'idle',
                        text: `Write an SEO-optimized meta description based on the product analysis:
- Keep it between 150-160 characters
- Include primary keywords naturally
- Make it compelling and click-worthy
- Include a call-to-action
- Focus on benefits and unique features`
                    }
                },

                // -----------------------------------------------------------
                // 3. THE LLMs
                // -----------------------------------------------------------
                {
                    id: 'llm-merger',
                    type: 'llmNode',
                    position: { x: 500, y: 300 },
                    data: {
                        label: 'Vision Analyst',
                        status: 'idle',
                        model: 'gemini-2.5-flash',
                        imageHandleCount: 3,
                        outputs: [],
                        temperature: 0.4,
                        viewMode: 'single',
                        systemPrompt: ""
                    }
                },

                {
                    id: 'llm-amazon',
                    type: 'llmNode',
                    position: { x: 1000, y: 0 },
                    data: {
                        label: 'Amazon Listing',
                        status: 'idle',
                        model: 'gemini-2.5-flash',
                        outputs: [],
                        temperature: 0.7,
                        viewMode: 'single',
                        imageHandleCount: 0,
                        systemPrompt: ""
                    }
                },
                {
                    id: 'llm-instagram',
                    type: 'llmNode',
                    position: { x: 1000, y: 350 },
                    data: {
                        label: 'Instagram Caption',
                        status: 'idle',
                        model: 'gemini-2.5-flash',
                        outputs: [],
                        temperature: 0.9,
                        viewMode: 'single',
                        imageHandleCount: 0,
                        systemPrompt: ""
                    }
                },
                {
                    id: 'llm-seo',
                    type: 'llmNode',
                    position: { x: 1000, y: 700 },
                    data: {
                        label: 'SEO Meta Description',
                        status: 'idle',
                        model: 'gemini-2.5-flash',
                        outputs: [],
                        temperature: 0.5,
                        viewMode: 'single',
                        imageHandleCount: 0,
                        systemPrompt: ""
                    }
                },
            ];

            const edges: Edge[] = [
                // Connect Images to Merger
                { id: 'e1', source: 'img-1', target: 'llm-merger', targetHandle: 'image-0', type: 'animatedEdge', animated: true },
                { id: 'e2', source: 'img-2', target: 'llm-merger', targetHandle: 'image-1', type: 'animatedEdge', animated: true },
                { id: 'e3', source: 'img-3', target: 'llm-merger', targetHandle: 'image-2', type: 'animatedEdge', animated: true },

                // Connect PROMPTS to LLMs (System Instructions)
                { id: 'p1', source: 'prompt-merger', target: 'llm-merger', targetHandle: 'system-prompt', type: 'default' },
                { id: 'p2', source: 'prompt-amazon', target: 'llm-amazon', targetHandle: 'system-prompt', type: 'default' },
                { id: 'p3', source: 'prompt-instagram', target: 'llm-instagram', targetHandle: 'system-prompt', type: 'default' },
                { id: 'p4', source: 'prompt-seo', target: 'llm-seo', targetHandle: 'system-prompt', type: 'default' },

                // Connect Merger Output to Downstream LLMs (Data Context)
                { id: 'e4', source: 'llm-merger', sourceHandle: 'response', target: 'llm-amazon', targetHandle: 'prompt', type: 'animatedEdge', animated: true },
                { id: 'e5', source: 'llm-merger', sourceHandle: 'response', target: 'llm-instagram', targetHandle: 'prompt', type: 'animatedEdge', animated: true },
                { id: 'e6', source: 'llm-merger', sourceHandle: 'response', target: 'llm-seo', targetHandle: 'prompt', type: 'animatedEdge', animated: true },
            ];

            return { nodes, edges };
        }
    }
];