import { task, runs } from "@trigger.dev/sdk/v3";
import { aiGenerator, cropImageTask, extractFrameTask } from "./workflow-nodes";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// --- Types ---
interface NodeData {
    id: string;
    type: string;
    data: any;
}

interface EdgeData {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
}

// Memory to store outputs of previous nodes
interface ExecutionContext {
    [nodeId: string]: {
        text?: string;
        imageUrls?: string[];
        videoUrl?: string;
    };
}

// --- Algorithm: Parallel Execution Layers ---
// Returns an array of arrays. Each inner array is a "layer" of nodes that can run in parallel.
function getExecutionLayers(nodes: NodeData[], edges: EdgeData[]): NodeData[][] {
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    // Init
    nodes.forEach((n) => {
        inDegree.set(n.id, 0);
        adj.set(n.id, []);
    });

    // Build Graph
    edges.forEach((edge) => {
        if (adj.has(edge.source) && adj.has(edge.target)) {
            adj.get(edge.source)!.push(edge.target);
            inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
        }
    });

    const layers: NodeData[][] = [];
    let queue: string[] = [];

    // Find Layer 0 (Start Nodes)
    inDegree.forEach((degree, id) => {
        if (degree === 0) queue.push(id);
    });

    while (queue.length > 0) {
        const currentLayerIds = [...queue];
        queue = []; // Reset for next layer

        const currentLayerNodes = currentLayerIds
            .map(id => nodes.find(n => n.id === id))
            .filter((n): n is NodeData => !!n);

        layers.push(currentLayerNodes);

        // Process this layer to find the next layer
        for (const id of currentLayerIds) {
            const neighbors = adj.get(id) || [];
            for (const neighbor of neighbors) {
                inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
                if (inDegree.get(neighbor) === 0) {
                    queue.push(neighbor);
                }
            }
        }
    }

    return layers;
}

export const orchestrator = task({
    id: "workflow-orchestrator",
    retry: {
        maxAttempts: 1, // Prevent auto-retries of the workflow itself
    },
    run: async (payload: { runId: string }) => {
        // 1. Load Workflow
        const run = await prisma.workflowRun.findUnique({
            where: { id: payload.runId },
            include: { workflow: true },
        });
        if (!run) throw new Error("Run not found");

        const graph = run.workflow.data as any;
        const nodes: NodeData[] = graph.nodes || [];
        const edges: EdgeData[] = graph.edges || [];

        // 2. Plan Execution Layers
        const layers = getExecutionLayers(nodes, edges);

        console.log(`🚀 [Orchestrator] Starting Run: ${run.id}`);
        console.log(`📋 [Orchestrator] Layers: ${layers.length}`);

        // 3. Context (Memory)
        const context: ExecutionContext = {};

        // 4. Update Run Status
        await prisma.workflowRun.update({
            where: { id: run.id },
            data: { status: "RUNNING", startedAt: new Date() }
        });

        let workflowFailed = false;

        try {
            try {
                // 5. Execution Loop (True DAG Parallel Execution)
                // Instead of rigid "layers", we map every node to a Promise.
                // A node's Promise simply awaits the Promises of its specific incoming dependencies,
                // then executes itself. This allows independent branches to run completely unblocked.

                const sortedNodes = layers.flat(); // Topologically sorted flat list
                const nodePromises = new Map<string, Promise<void>>();

                const executeNodeAsync = async (node: NodeData): Promise<void> => {
                    // 1. Wait for specific dependencies to finish
                    const incomingEdges = edges.filter((e) => e.target === node.id);
                    for (const edge of incomingEdges) {
                        const depPromise = nodePromises.get(edge.source);
                        if (depPromise) {
                            try {
                                await depPromise;
                            } catch (e) {
                                // If a strictly required dependency failed, we cannot continue.
                                // We throw to propagate the failure cascade down this specific branch.
                                throw new Error(`Dependency ${edge.source} failed.`);
                            }
                        }
                    }

                    if (workflowFailed) return; // Fast abort if global failure triggered

                    console.log(`⚡ [Orchestrator] Executing Node: ${node.type} (${node.id})`);

                    // --- A. PASSIVE NODES (Immediate Memory Write) ---
                    if (node.type === "textNode") {
                        context[node.id] = { text: node.data.text };
                        return;
                    }
                    if (node.type === "imageNode") {
                        const url = node.data.file?.url || node.data.image;
                        if (url) context[node.id] = { imageUrls: [url] };
                        return;
                    }
                    if (node.type === "videoNode") {
                        const url = node.data.file?.url;
                        if (url) context[node.id] = { videoUrl: url };
                        return;
                    }

                    // --- B. ACTIVE NODES (Trigger.dev Subtasks) ---
                    const executionRecord = await prisma.nodeExecution.create({
                        data: {
                            runId: run.id,
                            nodeId: node.id,
                            nodeType: node.type,
                            status: "RUNNING",
                            startedAt: new Date(),
                            inputData: node.data
                        }
                    });

                    try {
                        let handle: any = null;
                        let taskType: "llm" | "crop" | "extract" | null = null;

                        if (node.type === "llmNode") {
                            // Gather Inputs from Context
                            let aggregatedText = "";
                            let aggregatedImages: string[] = [];

                            for (const edge of incomingEdges) {
                                const sourceData = context[edge.source];
                                if (!sourceData) continue;
                                if (sourceData.text) {
                                    if (edge.targetHandle === "system-prompt") {
                                        aggregatedText = `[System Context]: ${sourceData.text}\n\n` + aggregatedText;
                                    } else {
                                        aggregatedText += `\n[Context]: ${sourceData.text}`;
                                    }
                                }
                                if (sourceData.imageUrls) aggregatedImages.push(...sourceData.imageUrls);
                            }

                            handle = await aiGenerator.trigger({
                                prompt: node.data.prompt || "Analyze this.",
                                systemPrompt: aggregatedText,
                                imageUrls: aggregatedImages,
                                model: node.data.model || "gemini-1.5-flash",
                                temperature: node.data.temperature
                            });
                            taskType = "llm";
                        }

                        else if (node.type === "cropImageNode") {
                            let inputImageUrl = node.data.imageUrl;
                            for (const edge of incomingEdges) {
                                const sourceData = context[edge.source];
                                if (sourceData?.imageUrls?.[0]) {
                                    inputImageUrl = sourceData.imageUrls[0];
                                    break;
                                }
                            }
                            if (!inputImageUrl) throw new Error("No input image");

                            handle = await cropImageTask.trigger({
                                imageUrl: inputImageUrl,
                                x: node.data.xPercent || 0,
                                y: node.data.yPercent || 0,
                                width: node.data.widthPercent || 100,
                                height: node.data.heightPercent || 100
                            });
                            taskType = "crop";
                        }

                        else if (node.type === "extractFrameNode") {
                            let inputVideoUrl = node.data.videoUrl;
                            for (const edge of incomingEdges) {
                                const sourceData = context[edge.source];
                                if (sourceData?.videoUrl) {
                                    inputVideoUrl = sourceData.videoUrl;
                                    break;
                                }
                            }
                            if (!inputVideoUrl) throw new Error("No input video");

                            handle = await extractFrameTask.trigger({
                                videoUrl: inputVideoUrl,
                                timestamp: node.data.timestamp || 0
                            });
                            taskType = "extract";
                        }

                        if (handle && taskType) {
                            // Poll sequentially within this specific Node's branch timeline
                            // @ts-ignore
                            const result = await runs.poll(handle);

                            if (result.status === "COMPLETED") {
                                // Save payload to Context memory for downstream nodes
                                if (taskType === "llm") {
                                    context[node.id] = { text: result.output.text };
                                } else if (taskType === "crop" || taskType === "extract") {
                                    context[node.id] = { imageUrls: [result.output.url] };
                                }

                                await prisma.nodeExecution.update({
                                    where: { id: executionRecord.id },
                                    data: { status: "SUCCESS", finishedAt: new Date(), outputData: result.output as any }
                                });
                            } else if (result.status === "FAILED" || result.status === "CRASHED" || result.status === "TIMED_OUT") {
                                throw new Error(result.error ? String(JSON.stringify(result.error)) : "Task failed with status " + result.status);
                            } else {
                                throw new Error("Task ended with unexpected status: " + result.status);
                            }
                        }

                    } catch (error) {
                        console.error(`❌ Node ${node.id} Failed:`, error);
                        await prisma.nodeExecution.update({
                            where: { id: executionRecord.id },
                            data: { status: "FAILED", finishedAt: new Date(), error: String(error) }
                        });
                        workflowFailed = true; // Global flag to stop new nodes
                        throw error; // Reject Promise to cascade failure downstream
                    }
                };

                // 6. Launch all nodes concurrently. 
                // Because they await their dependencies internally, they will orchestrate themselves perfectly.
                for (const node of sortedNodes) {
                    nodePromises.set(node.id, executeNodeAsync(node));
                }

                // 7. Await the entire graph
                await Promise.allSettled(Array.from(nodePromises.values()));

                // 8. Complete Global Run
                if (workflowFailed) {
                    console.log("🛑 [Orchestrator] Run marked as FAILED due to node errors.");
                    await prisma.workflowRun.update({
                        where: { id: run.id },
                        data: { status: "FAILED", finishedAt: new Date() }
                    });
                    return { success: false, error: "Workflow failed due to node errors" };
                } else {
                    await prisma.workflowRun.update({
                        where: { id: run.id },
                        data: { status: "COMPLETED", finishedAt: new Date() }
                    });
                    return { success: true };
                }

            } catch (error) {
                console.error("Workflow Run Warning/Error:", error);
                await prisma.workflowRun.update({
                    where: { id: run.id },
                    data: { status: "FAILED", finishedAt: new Date() }
                });
                // Do NOT throw to prevent Orchestrator Retry
                return { success: false, error: String(error) };
            }
        } catch (error) {
            console.error("Top-level Error:", error);
            return { success: false, error: String(error) };
        }
    },
});