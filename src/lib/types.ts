import { Node, Edge } from "@xyflow/react";

// =========================================
// 1. LANDING PAGE TYPES (Marketing)
// =========================================

export interface HeroNodeData extends Record<string, unknown> {
    label?: string;
    type?: string;       // e.g., "3D", "Image", "Text"
    image?: string;      // URL for the image content
    text?: string;       // Content for text nodes
    width?: string;      // Tailwind class override (e.g., "w-[300px]")
    height?: string;     // Tailwind class override (e.g., "aspect-video")
    gradientClass?: string; // For the Color Reference node
}

// The specific Node type for the Hero section
export type HeroNode = Node<HeroNodeData>;


// =========================================
// 2. EDITOR APP TYPES (The Actual Tool)
// =========================================

// Common properties shared by ALL nodes in the editor
export interface BaseNodeData extends Record<string, unknown> {
    label?: string;
    status: 'idle' | 'loading' | 'success' | 'error';
    errorMessage?: string;

    // UI State
    isLocked?: boolean;      // Prevent dragging/editing
    isRenaming?: boolean;    // Toggle input field for header
}

// -- Text Input Node --
export interface TextNodeData extends BaseNodeData {
    text: string;
    isExpandable?: boolean;
}

// -- Image Upload Node --
export interface ImageNodeData extends BaseNodeData {
    file?: {
        name: string;
        type: string;
        url: string;           // Blob URL or S3 link
    };
    inputType: 'upload' | 'url';
}

// -- LLM / Generation Node --
export interface LLMNodeData extends BaseNodeData {
    // Configuration
    model: 'gemini-2.5-flash';
    temperature: number;
    systemInstruction?: string;
    maxTokens?: number;

    // Dynamic Input Handles
    imageHandleCount: number; // Track number of image input handles

    // History / Results
    outputs: Array<{
        id: string;
        type: 'text' | 'image';
        content: string;       // The text response or Image URL
        timestamp: number;
        meta?: {
            creditsCost?: number;
            seed?: number;
        };
    }>;

    // View State
    activeOutputId?: string; // Currently displayed generation
    viewMode: 'single' | 'list';
}

// -- Video Upload Node --
export interface VideoNodeData extends BaseNodeData {
    file?: {
        name: string;
        type: string;
        url: string;           // Transloadit CDN URL
    };
    inputType: 'upload' | 'url';
}

// -- Crop Image Node (FFmpeg via Trigger.dev) --
export interface CropImageNodeData extends BaseNodeData {
    imageUrl?: string;         // Input image URL (from connection or manual)
    xPercent: number;          // 0-100, default 0
    yPercent: number;          // 0-100, default 0
    widthPercent: number;      // 0-100, default 100
    heightPercent: number;     // 0-100, default 100
    outputUrl?: string;        // Cropped image CDN URL (result)
}

// -- Extract Frame from Video Node (FFmpeg via Trigger.dev) --
export interface ExtractFrameNodeData extends BaseNodeData {
    videoUrl?: string;         // Input video URL (from connection or manual)
    timestamp: number | string;         // Seconds into the video or percentage (e.g. "50%")
    outputUrl?: string;        // Extracted frame image URL (result)
}


// 1. Define the Full Node Types (This fixes the NodeProps error)
export type TextNodeType = Node<TextNodeData, 'textNode'>;
export type ImageNodeType = Node<ImageNodeData, 'imageNode'>;
export type LLMNodeType = Node<LLMNodeData, 'llmNode'>;
export type VideoNodeType = Node<VideoNodeData, 'videoNode'>;
export type CropImageNodeType = Node<CropImageNodeData, 'cropImageNode'>;
export type ExtractFrameNodeType = Node<ExtractFrameNodeData, 'extractFrameNode'>;
// Union type for the Editor
export type AppNodeData = TextNodeData | ImageNodeData | LLMNodeData | VideoNodeData | CropImageNodeData | ExtractFrameNodeData;
export type AppNode = Node<AppNodeData>;





export type SaveWorkflowParams = {
    id?: string | null;
    name: string;
    nodes: AppNode[];
    edges: Edge[];
};

// TypeScript interface for Workflow
export interface Workflow {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface CanvasControlsProps {
    isHandMode: boolean;
    toggleMode: (isHand: boolean) => void;
}

export interface LoadWorkflowModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export interface SidebarProps {
    children: React.ReactNode;
    defaultCollapsed?: boolean;
}