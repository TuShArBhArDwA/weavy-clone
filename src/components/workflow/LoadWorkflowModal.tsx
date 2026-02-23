"use client";

import React, {useState, useEffect} from "react";
import {X, Loader2, Upload} from "lucide-react";
import {useWorkflowStore} from "@/store/workflowStore";
import {loadWorkflowAction} from "@/app/actions/workflowActions";
import type {LoadWorkflowModalProps} from "@/lib/types";

export default function LoadWorkflowModal({isOpen, onClose}: LoadWorkflowModalProps) {
    const {nodes: currentNodes, edges: currentEdges} = useWorkflowStore();
    const [workflowIdInput, setWorkflowIdInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Reset input when modal opens
    useEffect(() => {
        if (isOpen) {
            setWorkflowIdInput("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // LOAD FROM DATABASE
    const handleLoadFromDB = async () => {
        if (!workflowIdInput.trim()) {
            alert("Please enter a workflow ID!");
            return;
        }

        setIsLoading(true);

        try {
            const result = await loadWorkflowAction(workflowIdInput);

            if (result.success && result.data) {
                // Confirm before overwriting
                if (currentNodes.length > 0 || currentEdges.length > 0) {
                    const confirmed = window.confirm("This will replace your current workflow. Continue?");
                    if (!confirmed) {
                        setIsLoading(false);
                        return;
                    }
                }

                // FIX: Cast to 'any' to satisfy TypeScript strict checks
                const flowData = result.data as any;
                const nodes = flowData.nodes || [];
                const edges = flowData.edges || [];

                useWorkflowStore.setState({
                    nodes: nodes as any, // Double cast ensuring compatibility with AppNode[]
                    edges: edges as any,
                    workflowId: workflowIdInput,
                });

                alert("Workflow loaded successfully!");
                onClose();
            } else {
                alert(`${result.error || "Failed to load workflow"}`);
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong while loading.");
        } finally {
            setIsLoading(false);
        }
    };

    // IMPORT FROM JSON FILE
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const workflowData = JSON.parse(content);

                // Validate structure
                if (!workflowData.nodes || !workflowData.edges) {
                    alert("Invalid workflow file format!");
                    return;
                }

                // Confirm before overwriting
                if (currentNodes.length > 0 || currentEdges.length > 0) {
                    const confirmed = window.confirm("This will replace your current workflow. Continue?");
                    if (!confirmed) return;
                }

                // Load the workflow
                useWorkflowStore.setState({
                    nodes: workflowData.nodes as any, // Cast to any
                    edges: workflowData.edges as any, // Cast to any
                    workflowId: null, // Clear ID since it's imported
                });

                alert("Workflow imported successfully!");
                onClose();
            } catch (error) {
                console.error(error);
                alert("Failed to parse workflow file!");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Load Workflow</h2>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Load from Database */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-white/70 mb-2">Load from Database</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={workflowIdInput}
                            onChange={(e) => setWorkflowIdInput(e.target.value)}
                            placeholder="Enter Workflow ID"
                            className="flex-1 bg-[#222] text-white px-3 py-2 rounded-lg border border-white/10 focus:border-[#dfff4f] focus:outline-none text-sm"
                        />
                        <button
                            onClick={handleLoadFromDB}
                            disabled={isLoading}
                            className="px-4 py-2 bg-[#dfff4f] text-black font-bold rounded-lg hover:bg-white transition-all disabled:opacity-50 text-sm">
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : "LOAD"}
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="bg-[#1a1a1a] px-2 text-white/50">OR</span>
                    </div>
                </div>

                {/* Import from File */}
                <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Import from File</label>
                    <label className="flex items-center justify-center gap-2 px-4 py-3 bg-[#222] border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-[#dfff4f] hover:bg-white/5 transition-all">
                        <Upload size={16} className="text-white/70" />
                        <span className="text-sm font-medium text-white/70">Choose JSON File</span>
                        <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                    </label>
                </div>
            </div>
        </div>
    );
}
