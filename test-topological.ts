
// Mock types
type NodeData = { id: string; type: string };
type EdgeData = { source: string; target: string };

function getExecutionLayers(nodes: NodeData[], edges: EdgeData[]): NodeData[][] {
    // 1. Build Adjacency List & In-Degree Map
    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    nodes.forEach(node => {
        adj.set(node.id, []);
        inDegree.set(node.id, 0);
    });

    edges.forEach(edge => {
        if (adj.has(edge.source) && adj.has(edge.target)) {
            adj.get(edge.source)!.push(edge.target);
            inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
        }
    });

    // 2. Find Initial Layer (In-Degree 0)
    let queue: string[] = [];
    inDegree.forEach((degree, id) => {
        if (degree === 0) queue.push(id);
    });

    const layers: NodeData[][] = [];

    // 3. Process Layers (Kahn's Algorithm adapted for layers)
    while (queue.length > 0) {
        const currentLayerIds = [...queue];
        queue = []; // Reset for next layer

        const currentLayerNodes = currentLayerIds
            .map(id => nodes.find(n => n.id === id))
            .filter((n): n is NodeData => !!n);

        layers.push(currentLayerNodes);

        // Process this layer to find the next layer
        for (const nodeId of currentLayerIds) {
            const neighbors = adj.get(nodeId) || [];
            for (const neighbor of neighbors) {
                const newDegree = (inDegree.get(neighbor) || 0) - 1;
                inDegree.set(neighbor, newDegree);

                if (newDegree === 0) {
                    queue.push(neighbor);
                }
            }
        }
    }

    return layers;
}

// --- Test Case 1: Simple Linear ---
// A -> B -> C
const nodes1 = [{ id: "A", type: "start" }, { id: "B", type: "mid" }, { id: "C", type: "end" }];
const edges1 = [{ source: "A", target: "B" }, { source: "B", target: "C" }];
console.log("Test 1 (Linear):", JSON.stringify(getExecutionLayers(nodes1, edges1).map(l => l.map(n => n.id))));

// --- Test Case 2: Parallel Branches ---
// A -> B
// A -> C
// B -> D
// C -> D
const nodes2 = [{ id: "A", type: "start" }, { id: "B", type: "mid1" }, { id: "C", type: "mid2" }, { id: "D", type: "end" }];
const edges2 = [{ source: "A", target: "B" }, { source: "A", target: "C" }, { source: "B", target: "D" }, { source: "C", target: "D" }];
console.log("Test 2 (Parallel):", JSON.stringify(getExecutionLayers(nodes2, edges2).map(l => l.map(n => n.id))));

// --- Test Case 3: Independent starts ---
// A -> C
// B -> C
const nodes3 = [{ id: "A", type: "start1" }, { id: "B", type: "start2" }, { id: "C", type: "end" }];
const edges3 = [{ source: "A", target: "C" }, { source: "B", target: "C" }];
console.log("Test 3 (Independent):", JSON.stringify(getExecutionLayers(nodes3, edges3).map(l => l.map(n => n.id))));
