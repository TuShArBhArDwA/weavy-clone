"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getWorkflowHistoryAction(workflowId: string) {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        const numericId = parseInt(workflowId);
        if (isNaN(numericId)) return { success: false, error: "Invalid Workflow ID" };

        // Fetch runs with detailed node executions
        const runs = await prisma.workflowRun.findMany({
            where: {
                workflowId: numericId,
            },
            include: {
                nodeExecutions: {
                    orderBy: { startedAt: "asc" },
                },
            },
            orderBy: { startedAt: "desc" },
            take: 20, // Limit to last 20 runs to keep it fast
        });

        // Format for Frontend
        const formattedRuns = runs.map((run) => ({
            id: run.id,
            status: run.status,
            triggerType: run.triggerType,
            startedAt: run.startedAt.toISOString(),
            finishedAt: run.finishedAt?.toISOString() || null,
            duration: run.finishedAt
                ? Math.round((run.finishedAt.getTime() - run.startedAt.getTime()) / 1000) + "s"
                : "...",
            nodes: run.nodeExecutions.map((node) => ({
                id: node.id,
                nodeId: node.nodeId, // The React Flow Node ID
                type: node.nodeType,
                status: node.status,
                input: node.inputData,
                output: node.outputData,
                error: node.error,
                duration: node.finishedAt
                    ? ((node.finishedAt.getTime() - node.startedAt.getTime()) / 1000).toFixed(2) + "s"
                    : null
            })),
        }));

        return { success: true, runs: formattedRuns };

    } catch (error) {
        console.error("Fetch History Error:", error);
        return { success: false, error: "Failed to fetch history" };
    }
}