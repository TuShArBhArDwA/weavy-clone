"use client";

import React, {useCallback, useState, useEffect, useRef} from "react";
import {Handle, Position, NodeProps} from "@xyflow/react";
import {Type, MoreHorizontal, Trash2} from "lucide-react";
import {cn} from "@/lib/utils";
import {TextNodeType} from "@/lib/types";
import {useWorkflowStore} from "@/store/workflowStore";

export default function TextNode({id, data, isConnectable, selected}: NodeProps<TextNodeType>) {
    // 1. Select the update action from the store
    const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
    const deleteNode = useWorkflowStore((state) => state.deleteNode);

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

    const onChange = useCallback(
        (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newValue = evt.target.value;
            // 2. Dispatch the update
            updateNodeData(id, {text: newValue});
        },
        [id, updateNodeData]
    );

    return (
        <div
            className={cn(
                "rounded-xl border bg-[#1a1a1a] min-w-[250px] shadow-xl transition-all duration-200",
                selected ? "border-[#dfff4f] ring-1 ring-[#dfff4f]/50" : "border-white/10 hover:border-white/30",
                data.status === "error" && "border-red-500 ring-1 ring-red-500/50"
            )}>
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5 bg-[#111] rounded-t-xl">
                <div className="flex items-center gap-2">
                    <Type size={14} className="text-white/50" />
                    <span className="text-xs font-semibold text-white/70">{data.label}</span>
                </div>

                {/* Menu Button with Dropdown */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className={cn("p-1 rounded transition-colors", showMenu ? "bg-white/10 text-white" : "hover:bg-white/5 text-white/50")}>
                        <MoreHorizontal size={14} />
                    </button>

                    {/* Dropdown Menu */}
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
                <textarea
                    id={`text-${id}`}
                    name="text"
                    onChange={onChange}
                    value={data.text || ""}
                    placeholder="Enter your text here..."
                    className="nodrag w-full bg-[#0a0a0a] text-white text-xs rounded-lg border border-white/10 p-3 focus:outline-none focus:border-[#dfff4f]/50 resize-none"
                    rows={4}
                />
            </div>

            {/* Output Handle */}
            <Handle type="source" position={Position.Right} id="output" isConnectable={isConnectable} className="!w-2.5 !h-2.5 !bg-[#dfff4f]" />
        </div>
    );
}
