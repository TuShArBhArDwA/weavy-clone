
import { z } from "zod";

// Base Node Schema
export const baseNodeSchema = z.object({
    id: z.string(),
    type: z.string(),
    position: z.object({
        x: z.number(),
        y: z.number(),
    }),
    data: z.record(z.any()),
    width: z.number().optional(),
    height: z.number().optional(),
    selected: z.boolean().optional(),
    dragging: z.boolean().optional(),
});

// Edge Schema
export const edgeSchema = z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    sourceHandle: z.string().optional().nullable(),
    targetHandle: z.string().optional().nullable(),
    type: z.string().optional(),
    animated: z.boolean().optional(),
    data: z.record(z.any()).optional(),
    style: z.record(z.any()).optional(),
});

// Save Workflow Params Schema
export const saveWorkflowSchema = z.object({
    id: z.string().nullable().optional(),
    name: z.string().min(1, "Workflow name is required"),
    nodes: z.array(baseNodeSchema),
    edges: z.array(edgeSchema),
});

// Workflow Data Schema (for Import/Export)
export const workflowDataSchema = z.object({
    name: z.string(),
    nodes: z.array(baseNodeSchema),
    edges: z.array(edgeSchema),
    version: z.string().optional(),
    exportedAt: z.string().optional(),
});

export type SaveWorkflowInput = z.infer<typeof saveWorkflowSchema>;
export type WorkflowData = z.infer<typeof workflowDataSchema>;
