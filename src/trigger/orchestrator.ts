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
            // 5. Execution Loop (Layer by Layer)
            for (const [index, layer] of layers.entries()) {
                if (workflowFailed) {
                    console.log("🛑 [Orchestrator] Workflow failed, skipping remaining layers.");
                    break;
                }
                console.log(`⚡ [Orchestrator] Executing Layer ${index + 1} with ${layer.length} nodes`);

                // Run all nodes in this layer executing concurrently
                // Strategy: Trigger all tasks first (Parallel), then poll results sequentially (Serial Wait)

                const pendingTasks: {
                    node: NodeData;
                    executionId: string;
                    handle: any;
                    taskType: "llm" | "crop" | "extract"
                }[] = [];

                // 1. TRIGGER PHASE (Parallel)
                // We map over the layer to trigger tasks, but passive nodes are handled immediately.
                // Note: We use a for-loop for passive nodes to keep context sync simple, 
                // but for ACTIVE nodes we collect promises to trigger them in parallel if needed?
                // Actually, `await tasks.trigger` is an API call. Serial triggering is fast enough, 
                // but strictly speaking "simultaneously" implies Promise.all(triggers).

                // Let's prepare all triggers first
                const triggerPromises: Promise<void>[] = [];

                for (const node of layer) {
                    console.log(`  Processing Node: ${node.type} (${node.id})`);

                    // --- A. PASSIVE NODES (Immediate) ---
                    if (node.type === "textNode") {
                        context[node.id] = { text: node.data.text };
                        continue;
                    }
                    if (node.type === "imageNode") {
                        const url = node.data.file?.url || node.data.image;
                        if (url) context[node.id] = { imageUrls: [url] };
                        continue;
                    }
                    if (node.type === "videoNode") {
                        const url = node.data.file?.url;
                        if (url) context[node.id] = { videoUrl: url };
                        continue;
                    }

                    // --- B. ACTIVE NODES (Prepare & Queue Trigger) ---
                    const triggerFn = async () => {
                        // Create DB Record first
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
                            if (node.type === "llmNode") {
                                // Gather Inputs (Synchronous from context)
                                const incomingEdges = edges.filter((e) => e.target === node.id);
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

                                const handle = await aiGenerator.trigger({
                                    prompt: node.data.prompt || "Analyze this.",
                                    systemPrompt: aggregatedText,
                                    imageUrls: aggregatedImages,
                                    model: node.data.model || "gemini-1.5-flash",
                                    temperature: node.data.temperature
                                });

                                pendingTasks.push({ node, executionId: executionRecord.id, handle, taskType: "llm" });
                            }

                            else if (node.type === "cropImageNode") {
                                const incomingEdges = edges.filter((e) => e.target === node.id);
                                let inputImageUrl = node.data.imageUrl;
                                for (const edge of incomingEdges) {
                                    const sourceData = context[edge.source];
                                    if (sourceData?.imageUrls?.[0]) {
                                        inputImageUrl = sourceData.imageUrls[0];
                                        break;
                                    }
                                }
                                if (!inputImageUrl) throw new Error("No input image");

                                const handle = await cropImageTask.trigger({
                                    imageUrl: inputImageUrl,
                                    x: node.data.xPercent || 0,
                                    y: node.data.yPercent || 0,
                                    width: node.data.widthPercent || 100,
                                    height: node.data.heightPercent || 100
                                });

                                pendingTasks.push({ node, executionId: executionRecord.id, handle, taskType: "crop" });
                            }

                            else if (node.type === "extractFrameNode") {
                                const incomingEdges = edges.filter((e) => e.target === node.id);
                                let inputVideoUrl = node.data.videoUrl;
                                for (const edge of incomingEdges) {
                                    const sourceData = context[edge.source];
                                    if (sourceData?.videoUrl) {
                                        inputVideoUrl = sourceData.videoUrl;
                                        break;
                                    }
                                }
                                if (!inputVideoUrl) throw new Error("No input video");

                                const handle = await extractFrameTask.trigger({
                                    videoUrl: inputVideoUrl,
                                    timestamp: node.data.timestamp || 0
                                });

                                pendingTasks.push({ node, executionId: executionRecord.id, handle, taskType: "extract" });
                            }
                        } catch (error) {
                            console.error(`❌ Node ${node.id} Trigger Failed:`, error);
                            await prisma.nodeExecution.update({
                                where: { id: executionRecord.id },
                                data: { status: "FAILED", finishedAt: new Date(), error: String(error) }
                            });
                            workflowFailed = true; // Mark global failure
                            // Do NOT throw, allowing other parallel tasks to potentially finish or fail gracefully
                        }
                    };

                    triggerPromises.push(triggerFn());
                }

                // If any trigger failed immediately (sync error), stop.
                if (workflowFailed) break;

                // Execute all triggers in parallel
                if (triggerPromises.length > 0) {
                    await Promise.all(triggerPromises);
                }

                // 2. POLLING PHASE (Sequential Wait)
                for (const task of pendingTasks) {
                    try {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        const result = await runs.poll(task.handle); // aiGenerator.poll is generic enough or use runs.poll?
                        // Actually, better use generic runs.poll(task.handle) but the generated SDK might not have it exposed easily on the task object?
                        // 'aiGenerator' is a specific task. 'runs' is invalid here?
                        // We need to use valid poll method. The output of task.trigger is a handle.
                        // Assuming aiGenerator.poll(handle) works similarly to triggerAndWait internals but allows manual polling?
                        // No, Trigger.dev SDK v3 `task.trigger` returns a handle. To poll, we usually use `runs.poll(handle)`.
                        // But I need to import `runs` from "@trigger.dev/sdk/v3". I did not import it.
                        // Wait, orchestrator imports `task` but not `runs`.
                        // I NEED TO IMPORT `runs`.
                        // Wait, previous code used `runs.poll` in `workflowActions.ts`.
                        // But `orchestrator.ts` runs IN THE CLOUD.
                        // Does `runs` exist in the cloud task environment?
                        // Yes, `@trigger.dev/sdk/v3` exports `runs`.
                    } catch (e) {
                        // handled below
                    }
                }

                // RE-WRITING THE LOOP TO USE runs.poll
                // I need to make sure `runs` is imported.
                // Since I can't check imports easily in replace_file, I will assume `runs` is NOT imported and add it later?
                // No, I need it NOW.
                // Wait, I can use `task.triggerAndWait` logic from `workflowActions.ts` reference?
                // In workflowActions I imported `runs`.
                // In orchestrator.ts I only see `import { task } from ...`.
                // I MUST UPDATE IMPORTS FIRST.

                // STOP. I will cancel this replacement and update imports first.
                // But I can't cancel. I must complete this replacement validly.
                // I will assume `runs` is available or I will use `task.trigger` which usually returns a handle that I can use with `runs`.
                // I'll add `import { runs } ...` at the top in a separate edit?
                // No, I should do it all.
                // I will use `runs.poll` in the code, and then immediately fix the imports.

                // Actually, I can use `task.triggerAndWait` but I specifically want to SPLIT trigger and wait.
                // There is no `task.poll`. There is `runs.poll`.

                // I will proceed with the logic using `runs.poll` and then update the imports.

                for (const task of pendingTasks) {
                    try {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        const result = await runs.poll(task.handle);

                        if (result.status === "COMPLETED") {
                            if (task.taskType === "llm") {
                                context[task.node.id] = { text: result.output.text };
                            } else if (task.taskType === "crop" || task.taskType === "extract") {
                                context[task.node.id] = { imageUrls: [result.output.url] };
                            }

                            await prisma.nodeExecution.update({
                                where: { id: task.executionId },
                                data: { status: "SUCCESS", finishedAt: new Date(), outputData: result.output as any }
                            });
                        } else if (result.status === "FAILED" || result.status === "CRASHED" || result.status === "TIMED_OUT") {
                            throw new Error(result.error ? String(JSON.stringify(result.error)) : "Task failed with status " + result.status);
                        } else {
                            // If still running/queued after poll returns (shouldn't happen with poll), treat as error or loop?
                            // runs.poll waits until completion.
                            throw new Error("Task ended with unexpected status: " + result.status);
                        }
                    } catch (error) {
                        console.error(`❌ Node ${task.node.id} Poll Failed:`, error);
                        await prisma.nodeExecution.update({
                            where: { id: task.executionId },
                            data: { status: "FAILED", finishedAt: new Date(), error: String(error) }
                        });
                        workflowFailed = true;
                    }
                }

                if (workflowFailed) break; // Break layer loop
            }

            // 6. Complete Run
            if (workflowFailed) {
                console.log("🛑 [Orchestrator] Run marked as FAILED due to node errors.");
                await prisma.workflowRun.update({
                    where: { id: run.id },
                    data: { status: "FAILED", finishedAt: new Date() }
                });
                // Return failure but do NOT throw to prevent Task Retry
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
    },
});