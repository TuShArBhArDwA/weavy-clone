"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
import { Handle, Position, NodeProps, useReactFlow, useUpdateNodeInternals } from "@xyflow/react";
import { Bot, Plus, Loader2, MoreHorizontal, Check, Copy, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LLMNodeData, LLMNodeType, TextNodeData, ImageNodeData, CropImageNodeData, ExtractFrameNodeData } from "@/lib/types";
import { useWorkflowStore } from "@/store/workflowStore";
import { useAuth } from "@clerk/nextjs";
import { executeNodeAction } from "@/app/actions/workflowActions";

// Helper to fetch base64
async function urlToBase64(url: string): Promise<string> {
	try {
		const response = await fetch(url);
		const blob = await response.blob();
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	} catch (error) {
		console.error("Failed to convert URL to base64:", error);
		throw error;
	}
}

export default function LLMNode({ id, data, isConnectable, selected }: NodeProps<LLMNodeType>) {
	const { userId } = useAuth();
	const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
	const deleteNode = useWorkflowStore((state) => state.deleteNode);
	const { getNodes, getEdges, setEdges } = useReactFlow();
	const updateNodeInternals = useUpdateNodeInternals();

	const [hoveredHandle, setHoveredHandle] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [showMenu, setShowMenu] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const [model, setModel] = useState<string>(data.model || "gemini-1.5-flash");

	const imageHandleCount = data.imageHandleCount ?? 1;

	// Layout constants
	const BASE_HEIGHT = 400;
	const HANDLE_START_Y = 270;
	const HANDLE_SPACING = 40;
	const requiredHeight = Math.max(BASE_HEIGHT, HANDLE_START_Y + imageHandleCount * HANDLE_SPACING + 60);

	// FIX 1: Remove 'requiredHeight' from dependencies
	useEffect(() => {
		updateNodeInternals(id);
	}, [id, imageHandleCount, updateNodeInternals]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setShowMenu(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const onModelChange = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			setModel(e.target.value);
			updateNodeData(id, { model: e.target.value as LLMNodeData["model"] });
		},
		[id, updateNodeData],
	);

	const handleCopy = useCallback(async () => {
		if (data.outputs && data.outputs.length > 0) {
			const textToCopy = data.outputs[data.outputs.length - 1].content;
			await navigator.clipboard.writeText(textToCopy);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	}, [data.outputs]);

	const handleAddImageInput = useCallback(() => {
		updateNodeData(id, { imageHandleCount: imageHandleCount + 1 });
	}, [id, imageHandleCount, updateNodeData]);

	const handleRemoveImageInput = useCallback(
		(index: number) => {
			if (imageHandleCount <= 1) return;
			setEdges((edges) =>
				edges.filter((edge) => {
					if (edge.target !== id) return true;
					if (!edge.targetHandle?.startsWith("image")) return true;
					const handleIndex = parseInt(edge.targetHandle.split("-")[1]);
					return handleIndex < imageHandleCount - 1;
				}),
			);
			updateNodeData(id, { imageHandleCount: imageHandleCount - 1 });
		},
		[imageHandleCount, id, updateNodeData, setEdges],
	);

	const handleRun = useCallback(async () => {
		if (!userId) {
			updateNodeData(id, { status: "error", errorMessage: "You must be signed in." });
			return;
		}

		updateNodeData(id, { status: "loading", errorMessage: undefined });
		try {
			const allNodes = getNodes();
			const allEdges = getEdges();
			const incomingEdges = allEdges.filter((edge) => edge.target === id);

			let systemPromptBase = "";
			let userPromptBase = "";
			let incomingContext = "";
			const imageUrls: string[] = [];

			for (const edge of incomingEdges) {
				const sourceNode = allNodes.find((n) => n.id === edge.source);
				if (!sourceNode) continue;

				if (sourceNode.type === "textNode") {
					const text = (sourceNode.data as TextNodeData).text;
					if (edge.targetHandle === "system-prompt") {
						systemPromptBase = text || "";
					} else if (edge.targetHandle === "prompt") {
						userPromptBase = text || "";
					}
				}

				if (sourceNode.type === "llmNode") {
					const outputs = (sourceNode.data as LLMNodeData).outputs;
					if (outputs && outputs.length > 0) {
						const lastOutput = outputs[outputs.length - 1].content || "";
						if (edge.targetHandle === "system-prompt") {
							incomingContext += `\n\n--- CONTEXT ---\n${lastOutput}`;
						} else if (edge.targetHandle === "prompt") {
							userPromptBase = lastOutput; // Overwrite or append? Usually LLM chaining means prompt is previous output
						}
					}
				}

				if (sourceNode.type === "imageNode" && edge.targetHandle?.startsWith("image")) {
					const imageData = sourceNode.data as ImageNodeData;
					const imageUrl = imageData.file?.url || imageData.image;
					if (imageUrl) imageUrls.push(imageUrl as string);
				}

				// NEW: Handle inputs from Crop/Extract/Video nodes
				if (sourceNode.type === "cropImageNode" && edge.targetHandle?.startsWith("image")) {
					const data = sourceNode.data as CropImageNodeData;
					const url = data.outputUrl; // Assuming this field exists and public URL is stored
					// If outputUrl not available in data (it should be if run previously), we might miss it.
					// The orchestrator stores it in `context`. But here for single run we rely on node data state.
					// IMPORTANT: Previous nodes must have been run for their data to be available here in the editor state!
					if (url) imageUrls.push(url);
				}

				if (sourceNode.type === "extractFrameNode" && edge.targetHandle?.startsWith("image")) {
					const data = sourceNode.data as ExtractFrameNodeData;
					const url = data.outputUrl;
					if (url) imageUrls.push(url);
				}

				if (sourceNode.type === "videoNode") {
					// Video usually goes to extract/crop, but Gemini 1.5 Pro accepts video too!
					// If edge connects to image handle, treat as video input? Gemini API handles mixed media?
					// Our `aiGenerator` task expects `imageUrls`. Gemini supports video parts too.
					// For now, let's assume videoNode connects to ExtractFrame mostly.
					// If we want to support direct video, we need to update `aiGenerator` task to accept `videoUrls`.
				}
			}

			const finalSystemPrompt = systemPromptBase + (incomingContext || "");
			const finalUserPrompt = userPromptBase || "Process this request.";

			if (!finalUserPrompt) {
				// throw new Error("No prompt provided. Connect a Text Node or enter a prompt.");
				// Allow running with just images? Usually needs some prompt.
			}

			// Get workflowId from store
			const workflowId = useWorkflowStore.getState().workflowId;
			if (!workflowId) {
				throw new Error("Workflow ID not found.");
			}

			const payload = {
				model: data.model,
				prompt: finalUserPrompt,
				systemPrompt: finalSystemPrompt || undefined,
				imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
				temperature: data.temperature || 0.7,
				workflowId: parseInt(workflowId)
			};

			// Call Server Action
			const result = await executeNodeAction("llmNode", payload);

			if (!result.success || !result.output) {
				throw new Error(result.error || "Failed to generate content");
			}

			// Output format from Trigger.dev task
			const finalContent = result.output.text || JSON.stringify(result.output);

			updateNodeData(id, {
				status: "success",
				outputs: [
					{
						id: crypto.randomUUID(),
						type: "text",
						content: finalContent,
						timestamp: Date.now(),
					},
				],
			});
		} catch (error: any) {
			console.error("Run Failed:", error);
			updateNodeData(id, { status: "error", errorMessage: error.message || "Unknown error" });
		}
	}, [id, updateNodeData, getNodes, getEdges, data.model, data.temperature, userId]);

	return (
		<div
			style={{ minHeight: `${requiredHeight}px` }}
			className={cn(
				"relative rounded-xl border bg-[#1a1a1a] min-w-[320px] max-w-[400px] shadow-2xl transition-all duration-300 flex flex-col",
				selected ? "border-[#dfff4f] ring-1 ring-[#dfff4f]/50" : "border-white/10 hover:border-white/30",
				data.status === "error" && "border-red-500 ring-1 ring-red-500/50",
			)}>
			{/* Glow effect */}
			{data.status === "loading" && (
				<div className="absolute -inset-[1px] rounded-xl border-2 border-[#dfff4f] shadow-[0_0_30px_rgba(223,255,79,0.3)] animate-pulse pointer-events-none z-50" />
			)}

			{/* Header */}
			<div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5 bg-[#111] rounded-t-xl">
				<div className="flex items-center gap-2">
					<span className="text-xs font-semibold text-white">{data.model || "gemini-2.5-flash"}</span>
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
			<div className="p-4 flex-1 flex flex-col">
				<label className="block text-xs text-white/60 mb-1">Model</label>
				<select
					value={model}
					onChange={onModelChange}
					className="w-full bg-[#0a0a0a] text-xs text-white rounded-lg border border-white/10 p-2 focus:outline-none focus:border-[#dfff4f]/50 cursor-pointer mb-3">
					<option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
					<option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Next Gen)</option>
					<option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
				</select>

				<div className="bg-[#2a2a2a] rounded-lg border border-white/10 flex flex-col flex-1 min-h-[150px]">
					{data.status === "success" && data.outputs && data.outputs.length > 0 && (
						<div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
							<span className="text-[10px] text-white/40 uppercase font-semibold">Output</span>
							<button
								onClick={handleCopy}
								className="flex items-center gap-1 px-2 py-1 text-[10px] text-white/60 hover:text-white/90 hover:bg-white/5 rounded transition-colors">
								{copied ? (
									<>
										<Check size={11} /> Copied!
									</>
								) : (
									<>
										<Copy size={11} /> Copy
									</>
								)}
							</button>
						</div>
					)}

					<div className="p-3 overflow-y-auto custom-scrollbar flex-1">
						{data.status === "loading" ? (
							<div className="flex items-center justify-center h-full">
								<Loader2 size={20} className="animate-spin text-white/30" />
							</div>
						) : data.status === "success" && data.outputs && data.outputs.length > 0 ? (
							<div className="w-full text-xs text-white/80 font-mono leading-relaxed whitespace-pre-wrap break-words">
								{data.outputs[data.outputs.length - 1].content}
							</div>
						) : (
							<div className="flex items-center justify-center h-full">
								<span className="text-xs text-white/30">The generated text will appear here</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="px-6 mb-6 pb-3 flex items-center justify-between gap-2">
				<button
					onClick={handleAddImageInput}
					className="flex items-center gap-1.5 text-[11px] text-white/50 hover:text-white/80 transition-colors font-medium">
					<Plus size={12} />
					Add image
				</button>

				<button
					onClick={handleRun}
					disabled={data.status === "loading"}
					className={cn(
						"flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all",
						data.status === "loading" ? "bg-white/5 text-white/30 cursor-not-allowed" : "bg-white/90 text-black hover:bg-white active:scale-95",
					)}>
					{data.status === "loading" ? (
						<>
							<Loader2 size={12} className="animate-spin" />
						</>
					) : (
						<>
							<Bot size={12} />
							Run Model
						</>
					)}
				</button>
			</div>

			{/* Handles */}
			<div className="absolute left-0" style={{ top: "160px" }}>
				<Handle
					type="target"
					position={Position.Left}
					id="system-prompt"
					isConnectable={isConnectable}
					onMouseEnter={() => setHoveredHandle("system-prompt")}
					onMouseLeave={() => setHoveredHandle(null)}
					className="!w-2.5 !h-2.5 !bg-[#1a1a1a] !border-2 !border-emerald-400"
				/>
				{hoveredHandle === "system-prompt" && (
					<div className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/90 text-emerald-400 text-[10px] px-2 py-1 rounded z-50 pointer-events-none whitespace-nowrap">
						System Prompt
					</div>
				)}
			</div>
			<div className="absolute left-0" style={{ top: "210px" }}>
				<Handle
					type="target"
					position={Position.Left}
					id="prompt"
					isConnectable={isConnectable}
					onMouseEnter={() => setHoveredHandle("prompt")}
					onMouseLeave={() => setHoveredHandle(null)}
					className="!w-2.5 !h-2.5 !bg-[#1a1a1a] !border-2 !border-pink-400"
				/>
				{hoveredHandle === "prompt" && (
					<div className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/90 text-pink-400 text-[10px] px-2 py-1 rounded z-50 pointer-events-none whitespace-nowrap">
						Prompt
					</div>
				)}
			</div>
			{Array.from({ length: imageHandleCount }).map((_, index) => {
				const topPosition = HANDLE_START_Y + index * HANDLE_SPACING;
				return (
					<div key={`image-${index}`} className="absolute left-0 flex items-center" style={{ top: `${topPosition}px` }}>
						<Handle
							type="target"
							position={Position.Left}
							id={`image-${index}`}
							isConnectable={isConnectable}
							onMouseEnter={() => setHoveredHandle(`image-${index}`)}
							onMouseLeave={() => setHoveredHandle(null)}
							className="!w-2.5 !h-2.5 !bg-[#1a1a1a] !border-2 !border-purple-400"
						/>
						{hoveredHandle === `image-${index}` && (
							<div className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/90 text-purple-400 text-[10px] px-2 py-1 rounded z-50 pointer-events-none flex items-center gap-2 whitespace-nowrap">
								Image {index + 1}
								{imageHandleCount > 1 && (
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleRemoveImageInput(index);
										}}
										className="hover:text-red-400 transition-colors pointer-events-auto">
										<X size={10} />
									</button>
								)}
							</div>
						)}
					</div>
				);
			})}
			<div className="absolute right-0 top-1/2 -translate-y-1/2">
				<Handle
					type="source"
					position={Position.Right}
					id="response"
					isConnectable={isConnectable}
					onMouseEnter={() => setHoveredHandle("response")}
					onMouseLeave={() => setHoveredHandle(null)}
					className="!w-3 !h-3 !bg-[#1a1a1a] !border-2 !border-[#dfff4f] hover:!bg-[#dfff4f] transition-colors"
				/>
				{hoveredHandle === "response" && (
					<div className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/90 text-[#dfff4f] text-[10px] font-semibold px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none">
						Response Output
					</div>
				)}
			</div>
		</div>
	);
}
