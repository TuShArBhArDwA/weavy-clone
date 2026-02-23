import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';
import { temporal } from "zundo";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    Connection,
    Edge,
    EdgeChange,
    NodeChange,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
} from "@xyflow/react";

import { AppNode } from '@/lib/types';

type WorkflowState = {
    userId: string | null;
    nodes: AppNode[];
    edges: Edge[];
    workflowId: string | null;
    workflowName: string;


    // Actions
    setUserId: (userId: string | null) => void;
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    updateNodeData: (id: string, data: Partial<AppNode['data']>) => void;
    resetWorkflow: () => void;
    addNode: (node: AppNode) => void;
    deleteNode: (id: string) => void;
    setWorkflowId: (id: string) => void;
    setWorkflowName: (name: string) => void;
    setNodes: (nodes: AppNode[]) => void;
    setEdges: (edges: Edge[]) => void;
    clearUserData: () => void;
    lastRunTimestamp: number | null;
    setLastRunTimestamp: (timestamp: number) => void;
};

// Initial Data - Empty canvas
const initialNodesData: AppNode[] = [];
const initialEdges: Edge[] = [];

export const useWorkflowStore = create<WorkflowState>()(
    temporal(
        persist(
            (set, get) => ({
                userId: null,
                workflowId: null,
                nodes: initialNodesData,
                edges: initialEdges,
                workflowName: "Untitled Workflow",

                setUserId: (userId: string | null) => {
                    const currentUserId = get().userId;

                    // If switching users, clear the workflow data
                    if (currentUserId !== userId) {
                        set({
                            userId,
                            nodes: initialNodesData,
                            edges: initialEdges,
                            workflowId: null,
                            workflowName: "Untitled Workflow",
                        });
                    } else {
                        set({ userId });
                    }
                },

                onNodesChange: (changes: NodeChange[]) => {
                    set({
                        nodes: applyNodeChanges(changes, get().nodes) as AppNode[],
                    });
                },

                onEdgesChange: (changes: EdgeChange[]) => {
                    set({
                        edges: applyEdgeChanges(changes, get().edges),
                    });
                },

                onConnect: (connection: Connection) => {
                    // Force the new connection to use our custom type
                    const edge = {
                        ...connection,
                        type: 'animatedEdge', // Matches the key we will define in FlowEditor
                        animated: true,       // Adds the "marching ants" animation automatically
                        style: { strokeWidth: 3 },
                    };

                    set({
                        edges: addEdge(edge, get().edges),
                    });
                },

                updateNodeData: (id: string, newData: Partial<AppNode['data']>) => {
                    set({
                        nodes: get().nodes.map((node) => {
                            if (node.id === id) {
                                return {
                                    ...node,
                                    data: { ...node.data, ...newData },
                                };
                            }
                            return node;
                        }),
                    });
                },

                resetWorkflow: () => {
                    set({
                        nodes: initialNodesData,
                        edges: initialEdges,
                        workflowId: null,
                        workflowName: "Untitled Workflow",
                    });
                },

                addNode: (node: AppNode) => {
                    set({
                        nodes: [...get().nodes, node],
                    });
                },

                deleteNode: (id: string) => {
                    set((state) => ({
                        // 1. Remove the node
                        nodes: state.nodes.filter((node) => node.id !== id),
                        // 2. Remove any edges connected to this node
                        edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
                    }));
                },
                setWorkflowId: (id: string) => {
                    set({ workflowId: id });
                },
                setWorkflowName: (name: string) => {
                    set({ workflowName: name });
                },
                setNodes: (nodes: AppNode[]) => {
                    set({ nodes });
                },
                setEdges: (edges: Edge[]) => {
                    set({ edges });
                },
                clearUserData: () => {
                    set({
                        userId: null,
                        nodes: initialNodesData,
                        edges: initialEdges,
                        workflowId: null,
                        workflowName: "Untitled Workflow",
                    });
                },
                lastRunTimestamp: null,
                setLastRunTimestamp: (timestamp: number) => {
                    set({ lastRunTimestamp: timestamp });
                },
            }),
            {
                name: 'workflow-storage',
                version: 4, // Incremented to clear old cached nodes

                // Partition storage by user ID
                partialize: (state) => ({
                    userId: state.userId,
                    nodes: state.nodes,
                    edges: state.edges,
                    workflowId: state.workflowId,
                    workflowName: state.workflowName,
                }),

                migrate: (persistedState: any, version: number) => {
                    if (version < 4) {
                        // Clear old data when migrating
                        return {
                            userId: null,
                            nodes: initialNodesData,
                            edges: initialEdges,
                            workflowId: null,
                            workflowName: "Untitled Workflow",
                        } as WorkflowState;
                    }
                    return persistedState as WorkflowState;
                },

                // Use dynamic storage key based on user ID
                storage: {
                    getItem: (name: string) => {
                        const str = localStorage.getItem(name);
                        if (!str) return null;
                        const { state } = JSON.parse(str);
                        return state;
                    },
                    setItem: (name: string, value: any) => {
                        const userId = value.userId;
                        // Store with user-specific key if user is logged in
                        const key = userId ? `${name}-${userId}` : name;
                        localStorage.setItem(
                            key,
                            JSON.stringify({
                                state: value,
                                version: 4,
                            })
                        );
                    },
                    removeItem: (name: string) => {
                        // Remove both generic and user-specific keys
                        localStorage.removeItem(name);
                        const keys = Object.keys(localStorage);
                        keys.forEach(key => {
                            if (key.startsWith(name)) {
                                localStorage.removeItem(key);
                            }
                        });
                    },
                },
            }
        ),
        {
            limit: 100,
            partialize: (state) => {
                const { nodes, edges, workflowId } = state;
                return { nodes, edges, workflowId };
            },
            // Equality: THIS is where we exclude position from TRIGGERING a save.
            // If the only difference between 'past' and 'current' is position/selection, we say "They are Equal" -> No Save.
            equality: (pastState, currentState) => {
                // Helper to strip out volatile properties (position, selection, dimensions)
                const stripVolatile = (state: Partial<WorkflowState>) => {
                    if (!state.nodes || !state.edges) return {};
                    return {
                        edges: state.edges, // Edges rarely change randomly, so we keep them full
                        nodes: state.nodes.map((node) => {
                            // Destructure out the fields we want to IGNORE during comparison
                            const { position, measured, selected, dragging, ...stableData } = node;
                            return stableData;
                        }),
                    };
                };

                // Compare the "Cleaned" versions
                return JSON.stringify(stripVolatile(pastState)) === JSON.stringify(stripVolatile(currentState));
            },
        }
    )
);

