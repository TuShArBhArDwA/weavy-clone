"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "@xyflow/react";
import { Crop, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CropImageNodeType, ImageNodeData, ExtractFrameNodeData, CropImageNodeData } from "@/lib/types";
import { useWorkflowStore } from "@/store/workflowStore";

import { executeNodeAction } from "@/app/actions/workflowActions";

export default function CropImageNode({ id, data, isConnectable, selected }: NodeProps<CropImageNodeType>) {
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
    const isImageConnected = edges.some(edge => edge.target === id && edge.targetHandle === "image_url");
    const isXConnected = edges.some(edge => edge.target === id && edge.targetHandle === "xPercent");
    const isYConnected = edges.some(edge => edge.target === id && edge.targetHandle === "yPercent");
    const isWidthConnected = edges.some(edge => edge.target === id && edge.targetHandle === "widthPercent");
    const isHeightConnected = edges.some(edge => edge.target === id && edge.targetHandle === "heightPercent");

    const handleRun = useCallback(async () => {
        updateNodeData(id, { status: "loading" });
        try {
            // ... (rest of logic same until payload)
            // Resolve Input Image
            const allNodes = useWorkflowStore.getState().nodes;
            const allEdges = useWorkflowStore.getState().edges;
            const incomingEdge = allEdges.find(e => e.target === id && (e.targetHandle === "image_url" || e.targetHandle === "input"));

            let inputImageUrl = "";

            if (incomingEdge) {
                const sourceNode = allNodes.find(n => n.id === incomingEdge.source);
                if (sourceNode) {
                    if (sourceNode.type === "imageNode") {
                        const data = sourceNode.data as ImageNodeData;
                        inputImageUrl = data.file?.url || ((data as any).image as string);
                    } else if (sourceNode.type === "cropImageNode" || sourceNode.type === "extractFrameNode") {
                        const data = sourceNode.data as CropImageNodeData | ExtractFrameNodeData;
                        inputImageUrl = data.outputUrl as string;
                    }
                }
            }

            // Resolve Parameter Inputs (from TextNodes if connected)
            const getParamValue = (handleId: string, defaultValue: number) => {
                const edge = allEdges.find(e => e.target === id && e.targetHandle === handleId);
                if (edge) {
                    const sourceNode = allNodes.find(n => n.id === edge.source);
                    if (sourceNode && sourceNode.type === "textNode") {
                        return parseFloat((sourceNode.data as any).text) || defaultValue;
                    }
                }
                return defaultValue;
            };

            const xVal = isXConnected ? getParamValue("xPercent", data.xPercent) : data.xPercent;
            const yVal = isYConnected ? getParamValue("yPercent", data.yPercent) : data.yPercent;
            const wVal = isWidthConnected ? getParamValue("widthPercent", data.widthPercent) : data.widthPercent;
            const hVal = isHeightConnected ? getParamValue("heightPercent", data.heightPercent) : data.heightPercent;


            if (!inputImageUrl) {
                throw new Error("No input image connected or available.");
            }

            // Get workflowId from store
            const workflowId = useWorkflowStore.getState().workflowId;
            if (!workflowId) {
                throw new Error("Workflow ID not found.");
            }

            const payload = {
                imageUrl: inputImageUrl,
                xPercent: xVal,
                yPercent: yVal,
                widthPercent: wVal,
                heightPercent: hVal,
                workflowId: parseInt(workflowId) // Ensure it's passed as number if action expects it, or string. Action expects string ID actually? 
                // Wait, prisma IDs are strings (cuid) usually, but executeNodeAction logic might parse it?
                // executeNodeAction in workflowActions.ts: "const workflowId = data.workflowId ? parseInt(data.workflowId) : null;"
                // This implies the DB uses Integer IDs for workflows?
                // Let me check prisma schema.
            };

            const result = await executeNodeAction("cropImageNode", payload);

            if (result.success && result.output) {
                updateNodeData(id, {
                    status: "success",
                    outputUrl: result.output.url
                });
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            console.error("Crop Failed:", error);
            updateNodeData(id, { status: "error", errorMessage: error.message });
        }
    }, [id, data, updateNodeData, isXConnected, isYConnected, isWidthConnected, isHeightConnected]);

    const updateParam = (param: 'xPercent' | 'yPercent' | 'widthPercent' | 'heightPercent', value: string) => {
        const numValue = Math.min(100, Math.max(0, Number(value) || 0));
        updateNodeData(id, { [param]: numValue });
    };

    return (
        <div
            className={cn(
                "rounded-xl border bg-[#1a1a1a] min-w-[280px] shadow-xl transition-all duration-200 flex flex-col",
                selected ? "border-[#dfff4f] ring-1 ring-[#dfff4f]/50" : "border-white/10 hover:border-white/30",
                data.status === "error" && "border-red-500 ring-1 ring-red-500/50"
            )}>
            {/* ... (Header and Glow same) ... */}
            {data.status === "loading" && (
                <div className="absolute -inset-[1px] rounded-xl border-2 border-[#dfff4f] shadow-[0_0_30px_rgba(223,255,79,0.3)] animate-pulse pointer-events-none z-50" />
            )}

            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5 bg-[#111] rounded-t-xl">
                <div className="flex items-center gap-2">
                    <Crop size={14} className="text-white/50" />
                    <span className="text-xs font-semibold text-white/70">{data.label || "Crop Image"}</span>
                </div>
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
                        {data.status === "loading" ? <Loader2 size={12} className="animate-spin" /> : "Crop Now"}
                    </button>
                </div>

                {/* Input Image Preview */}
                <div className="bg-[#2a2a2a] rounded-lg border border-white/10 p-2 min-h-[60px] flex items-center justify-center relative">
                    {data.status === "success" && data.outputUrl ? (
                        <img src={data.outputUrl} alt="Cropped" className="max-h-[150px] rounded object-contain" />
                    ) : (
                        <span className="text-[10px] text-white/30">Output will appear here</span>
                    )}
                </div>

                {/* Parameters */}
                <div className="grid grid-cols-2 gap-2 relative">
                    <div className="relative">
                        <Handle type="target" position={Position.Left} id="xPercent" className="!bg-blue-400" style={{ left: -18, top: '65%' }} />
                        <label className="text-[10px] text-white/50 block mb-1">X %</label>
                        <input
                            type="number" min="0" max="100"
                            value={data.xPercent || 0}
                            disabled={isXConnected}
                            onChange={(e) => updateParam('xPercent', e.target.value)}
                            className={cn("w-full bg-[#0a0a0a] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#dfff4f]/50", isXConnected && "opacity-50 cursor-not-allowed")}
                        />
                    </div>
                    <div className="relative">
                        <Handle type="target" position={Position.Left} id="yPercent" className="!bg-blue-400" style={{ left: -7, top: '65%' }} />
                        <label className="text-[10px] text-white/50 block mb-1">Y %</label>
                        <input
                            type="number" min="0" max="100"
                            value={data.yPercent || 0}
                            disabled={isYConnected}
                            onChange={(e) => updateParam('yPercent', e.target.value)}
                            className={cn("w-full bg-[#0a0a0a] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#dfff4f]/50", isYConnected && "opacity-50 cursor-not-allowed")}
                        />
                    </div>
                    <div className="relative">
                        <Handle type="target" position={Position.Left} id="widthPercent" className="!bg-blue-400" style={{ left: -18, top: '65%' }} />
                        <label className="text-[10px] text-white/50 block mb-1">Width %</label>
                        <input
                            type="number" min="0" max="100"
                            value={data.widthPercent ?? 100}
                            disabled={isWidthConnected}
                            onChange={(e) => updateParam('widthPercent', e.target.value)}
                            className={cn("w-full bg-[#0a0a0a] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#dfff4f]/50", isWidthConnected && "opacity-50 cursor-not-allowed")}
                        />
                    </div>
                    <div className="relative">
                        <Handle type="target" position={Position.Left} id="heightPercent" className="!bg-blue-400" style={{ left: -7, top: '65%' }} />
                        <label className="text-[10px] text-white/50 block mb-1">Height %</label>
                        <input
                            type="number" min="0" max="100"
                            value={data.heightPercent ?? 100}
                            disabled={isHeightConnected}
                            onChange={(e) => updateParam('heightPercent', e.target.value)}
                            className={cn("w-full bg-[#0a0a0a] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#dfff4f]/50", isHeightConnected && "opacity-50 cursor-not-allowed")}
                        />
                    </div>
                </div>

                <div className="text-[10px] text-white/30 italic">
                    {isImageConnected ? "Image input connected" : "Waiting for image input..."}
                </div>
            </div>

            {/* Input Handle */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
                <Handle
                    type="target"
                    position={Position.Left}
                    id="image_url"
                    isConnectable={isConnectable}
                    onMouseEnter={() => setHoveredHandle("image_url")}
                    onMouseLeave={() => setHoveredHandle(null)}
                    className="!w-2.5 !h-2.5 !bg-[#1a1a1a] !border-2 !border-orange-400"
                />
            </div>

            {/* Output Handle */}
            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2">
                <Handle
                    type="source"
                    position={Position.Right}
                    id="output"
                    isConnectable={isConnectable}
                    className="!w-3 !h-3 !bg-[#1a1a1a] !border-2 !border-orange-400 hover:!bg-orange-400 transition-colors"
                />
            </div>
        </div >
    );
}
