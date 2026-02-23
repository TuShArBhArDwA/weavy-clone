"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Video, Upload, X, Loader2, AlertCircle, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoNodeType } from "@/lib/types";
import { useWorkflowStore } from "@/store/workflowStore";
import { uploadToTransloadit } from "@/lib/transloadit";

export default function VideoNode({ id, data, isConnectable, selected }: NodeProps<VideoNodeType>) {
    const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
    const deleteNode = useWorkflowStore((state) => state.deleteNode);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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

    const onFileChange = useCallback(
        async (evt: React.ChangeEvent<HTMLInputElement>) => {
            const file = evt.target.files?.[0];
            if (!file) return;

            try {
                updateNodeData(id, { status: "loading" });

                // Upload to Transloadit
                const url = await uploadToTransloadit(file);

                updateNodeData(id, {
                    file: {
                        url: url,
                        name: file.name,
                        type: file.type,
                    },
                    status: "success",
                });
            } catch (error) {
                console.error("Transloadit error:", error);
                updateNodeData(id, {
                    status: "error",
                    errorMessage: "Failed to upload video",
                });
            }
        },
        [id, updateNodeData]
    );

    const clearVideo = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            updateNodeData(id, { file: undefined, status: "idle" });
            if (fileInputRef.current) fileInputRef.current.value = "";
        },
        [id, updateNodeData]
    );

    return (
        <div
            className={cn(
                "rounded-xl border bg-[#1a1a1a] min-w-[280px] shadow-xl transition-all duration-200",
                selected ? "border-[#dfff4f] ring-1 ring-[#dfff4f]/50" : "border-white/10 hover:border-white/30",
                data.status === "error" && "border-red-500 ring-1 ring-red-500/50"
            )}>
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5 bg-[#111] rounded-t-xl">
                <div className="flex items-center gap-2">
                    <Video size={14} className="text-white/50" />
                    <span className="text-xs font-semibold text-white/70">{data.label || "Video Input"}</span>
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

            {/* Body */}
            <div className="p-3">
                <input ref={fileInputRef} type="file" accept="video/*" onChange={onFileChange} className="hidden" id={`video-upload-${id}`} />

                {data.file?.url ? (
                    <div className="relative group">
                        <video
                            src={data.file.url}
                            controls
                            className="w-full h-40 object-cover rounded-lg border border-white/10"
                        />

                        <button
                            onClick={clearVideo}
                            className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-500/80 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100 z-10">
                            <X size={14} />
                        </button>

                        <div className="mt-2 text-[10px] text-white/40 truncate">
                            {data.file.name}
                        </div>
                    </div>
                ) : (
                    <label
                        htmlFor={`video-upload-${id}`}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-all",
                            data.status === "loading" ? "border-white/20 bg-white/5" : "border-white/10 hover:border-white/30 hover:bg-white/5"
                        )}>
                        {data.status === "loading" ? (
                            <Loader2 size={24} className="animate-spin text-white/30" />
                        ) : data.status === "error" ? (
                            <>
                                <AlertCircle size={24} className="text-red-400 mb-2" />
                                <span className="text-xs text-red-400">{data.errorMessage}</span>
                            </>
                        ) : (
                            <>
                                <Upload size={24} className="text-white/30 mb-2" />
                                <span className="text-xs text-white/50">Click to upload video</span>
                            </>
                        )}
                    </label>
                )}
            </div>

            {/* Output Handle */}
            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 z-50">
                <Handle
                    type="source"
                    position={Position.Right}
                    id="output"
                    isConnectable={isConnectable}
                    className="!w-3 !h-3 !bg-[#1a1a1a] !border-2 !border-green-400 hover:!bg-green-400 transition-colors"
                />
            </div>
        </div>
    );
}
