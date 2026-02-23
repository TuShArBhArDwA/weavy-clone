"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "@xyflow/react";
import { Film, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExtractFrameNodeType, VideoNodeData } from "@/lib/types";
import { useWorkflowStore } from "@/store/workflowStore";
import { executeNodeAction } from "@/app/actions/workflowActions";
import { Loader2 } from "lucide-react";

export default function ExtractFrameNode({ id, data, isConnectable, selected }: NodeProps<ExtractFrameNodeType>) {
    const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
    const deleteNode = useWorkflowStore((state) => state.deleteNode);
    const { getEdges } = useReactFlow();

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [hoveredHandle, setHoveredHandle] = useState<string | null>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Check connected handles to disable manual inputs
    const edges = getEdges();
    const isVideoConnected = edges.some(edge => edge.target === id && edge.targetHandle === "video_url");
    const isTimestampConnected = edges.some(edge => edge.target === id && edge.targetHandle === "timestamp");

    const handleRun = useCallback(async () => {
        updateNodeData(id, { status: "loading" });
        try {
            // Resolve Input Video
            const allNodes = useWorkflowStore.getState().nodes;
            const allEdges = useWorkflowStore.getState().edges;
            const incomingEdge = allEdges.find(e => e.target === id && e.targetHandle === "video_url");

            let inputVideoUrl = "";

            if (incomingEdge) {
                const sourceNode = allNodes.find(n => n.id === incomingEdge.source);
                if (sourceNode && sourceNode.type === "videoNode") {
                    const data = sourceNode.data as VideoNodeData;
                    inputVideoUrl = data.file?.url as string;
                }
            }

            // Resolve Timestamp Input
            const getParamValue = (handleId: string, defaultValue: number | string) => {
                const edge = allEdges.find(e => e.target === id && e.targetHandle === handleId);
                if (edge) {
                    const sourceNode = allNodes.find(n => n.id === edge.source);
                    if (sourceNode && sourceNode.type === "textNode") {
                        const val = (sourceNode.data as any).text;
                        return val;
                    }
                }
                return defaultValue;
            };

            const timestampVal = isTimestampConnected ? getParamValue("timestamp", data.timestamp || 0) : (data.timestamp || 0);

            if (!inputVideoUrl) {
                // If manual Video URL entry allowed? No, currently only upload via VideoNode
                throw new Error("No input video connected. Connect a Video Node.");
            }

            // Get workflowId from store
            const workflowId = useWorkflowStore.getState().workflowId;
            if (!workflowId) {
                throw new Error("Workflow ID not found.");
            }

            const payload = {
                videoUrl: inputVideoUrl,
                timestamp: timestampVal,
                workflowId: parseInt(workflowId)
            };

            const result = await executeNodeAction("extractFrameNode", payload);

            if (result.success && result.output) {
                updateNodeData(id, {
                    status: "success",
                    outputUrl: result.output.url
                });
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            console.error("Extract Failed:", error);
            updateNodeData(id, { status: "error", errorMessage: error.message });
        }
    }, [id, data, updateNodeData, isTimestampConnected]);

    return (
        <div
            className={cn(
                "rounded-xl border bg-[#1a1a1a] min-w-[280px] shadow-xl transition-all duration-200 flex flex-col",
                selected ? "border-[#dfff4f] ring-1 ring-[#dfff4f]/50" : "border-white/10 hover:border-white/30",
                data.status === "error" && "border-red-500 ring-1 ring-red-500/50"
            )}>
            {/* Glow effect */}
            {data.status === "loading" && (
                <div className="absolute -inset-[1px] rounded-xl border-2 border-[#dfff4f] shadow-[0_0_30px_rgba(223,255,79,0.3)] animate-pulse pointer-events-none z-50" />
            )}

            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5 bg-[#111] rounded-t-xl">
                <div className="flex items-center gap-2">
                    <Film size={14} className="text-white/50" />
                    <span className="text-xs font-semibold text-white/70">{data.label || "Extract Frame"}</span>
                </div>

                {/* Menu Button */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className={cn("p-1 rounded transition-colors", showMenu ? "bg-white/10 text-white" : "hover:bg-white/5 text-white/50")}>
                        <MoreHorizontal size={14} />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-6 w-32 bg-[#222] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNode(id);
                                }}
                                className="w-full text-left px-3 py-2 text-[10px] text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2 transition-colors font-medium">
                                <Trash2 size={10} />
                                Delete Node
                            </button>
                        </div>
                    )}
                </div>
            </div>


            {/* Output Preview & Run */}
            {/* Body */}
            <div className="p-4 space-y-4">
                <div className="flex justify-end">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleRun(); }}
                        disabled={data.status === "loading"}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-medium transition-all",
                            data.status === "loading"
                                ? "bg-white/5 text-white/30 cursor-not-allowed"
                                : "bg-[#dfff4f] text-black hover:bg-[#ccee4c]"
                        )}>
                        {data.status === "loading" ? <Loader2 size={12} className="animate-spin" /> : "Extract Frame"}
                    </button>
                </div>
                {/* Output Preview */}
                <div className="bg-[#2a2a2a] rounded-lg border border-white/10 p-2 min-h-[60px] flex items-center justify-center">
                    {data.status === "success" && data.outputUrl ? (
                        <img src={data.outputUrl} alt="Extracted Frame" className="max-h-[150px] rounded object-contain" />
                    ) : (
                        <span className="text-[10px] text-white/30">Frame will appear here</span>
                    )}
                </div>

                {/* Parameters */}
                <div className="relative">
                    <Handle type="target" position={Position.Left} id="timestamp" className="!bg-blue-400" style={{ left: -18, top: '65%' }} />
                    <label className="text-[10px] text-white/50 block mb-1">Timestamp (seconds or %)</label>
                    <input
                        type="text"
                        placeholder="e.g. 5.5 or 50%"
                        value={data.timestamp || ""}
                        disabled={isTimestampConnected}
                        onChange={(e) => updateNodeData(id, { timestamp: e.target.value })}
                        className={cn("w-full bg-[#0a0a0a] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#dfff4f]/50", isTimestampConnected && "opacity-50 cursor-not-allowed")}
                    />
                </div>

                <div className="text-[10px] text-white/30 italic">
                    {isVideoConnected ? "Video input connected" : "Waiting for video input..."}
                </div>
            </div>

            {/* Input Handle */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
                <Handle
                    type="target"
                    position={Position.Left}
                    id="video_url"
                    isConnectable={isConnectable}
                    onMouseEnter={() => setHoveredHandle("video_url")}
                    onMouseLeave={() => setHoveredHandle(null)}
                    className="!w-2.5 !h-2.5 !bg-[#1a1a1a] !border-2 !border-cyan-400"
                />
                {hoveredHandle === "video_url" && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/90 text-cyan-400 text-[10px] px-2 py-1 rounded z-50 pointer-events-none whitespace-nowrap">
                        Video Input
                    </div>
                )}
            </div>

            {/* Output Handle */}
            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2">
                <Handle
                    type="source"
                    position={Position.Right}
                    id="output"
                    isConnectable={isConnectable}
                    className="!w-3 !h-3 !bg-[#1a1a1a] !border-2 !border-cyan-400 hover:!bg-cyan-400 transition-colors"
                />
            </div>
        </div >
    );
}
