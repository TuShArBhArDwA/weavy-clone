"use client";

import React, { useState, useCallback, useRef } from "react";
import { Save, Loader2, Share2, FolderOpen, Play, Upload } from "lucide-react";
import { useWorkflowStore } from "@/store/workflowStore";
import { saveWorkflowAction, runWorkflowAction } from "@/app/actions/workflowActions";
import LoadWorkflowModal from "./LoadWorkflowModal";
import { WorkflowData } from "@/lib/schemas";

export default function Header() {
	const { nodes, edges, workflowId, workflowName, isGlobalRunning, setWorkflowId, setWorkflowName, setNodes, setEdges, setLastRunTimestamp } = useWorkflowStore();
	const [isSaving, setIsSaving] = useState(false);
	const [isRunning, setIsRunning] = useState(false);
	const [isLoadOpen, setIsLoadOpen] = useState(false);
	const [isEditingName, setIsEditingName] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// --- HANDLE IMPORT ---
	const handleImportClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const json = event.target?.result as string;
				const data = JSON.parse(json) as WorkflowData;

				// Basic validation (could use Zod here too if we wanted client-side val)
				if (Array.isArray(data.nodes) && Array.isArray(data.edges)) {
					// Ask for confirmation if canvas is not empty
					if (nodes.length > 0) {
						if (!confirm("Start new? This will overwrite your current canvas.")) {
							return;
						}
					}

					setNodes(data.nodes as any);
					setEdges(data.edges);
					if (data.name) setWorkflowName(data.name);
					// Reset ID since it's a new import (or keep it if we want to overwrite? usually import = new)
					setWorkflowId("");
					alert("Workflow imported successfully!");
				} else {
					alert("Invalid workflow file format.");
				}
			} catch (err) {
				console.error(err);
				alert("Failed to parse JSON file.");
			}
			// Reset input
			if (fileInputRef.current) fileInputRef.current.value = "";
		};
		reader.readAsText(file);
	};

	// --- HANDLE SAVE ---
	const handleSave = async () => {
		if (nodes.length === 0) {
			alert("Canvas is empty!");
			return null;
		}

		setIsSaving(true);

		try {
			const res = await saveWorkflowAction({
				id: workflowId,
				name: workflowName,
				nodes,
				edges,
			});

			if (res.success && res.id) {
				setWorkflowId(res.id);
				// Optional: Toast notification here
				return res.id;
			} else if (res.success) {
				alert("Saved, but no ID returned.");
				return null;
			} else {
				alert(`Error: ${res.error}`);
				return null;
			}
		} catch (error) {
			console.error(error);
			return null;
		} finally {
			setIsSaving(false);
		}
	};

	// --- HANDLE RUN ---
	const handleRun = async () => {
		setIsRunning(true);
		let currentId = workflowId;

		// 1. Force Save First to ensure DB has latest graph
		const savedId = await handleSave();

		// If save failed, abort run
		if (!savedId) {
			setIsRunning(false);
			return;
		}
		currentId = savedId;

		// 2. Run the workflow on the server
		console.log("Running workflow with ID:", currentId);

		try {
			const res = await runWorkflowAction(currentId);
			if (res.success) {
				console.log(`Workflow run started! Run ID: ${res.runId}`);
				setLastRunTimestamp(Date.now());

				if (typeof res.runId === "string") {
					localStorage.setItem("lastRunId", res.runId);
				}

			} else {
				alert("Run Failed: " + res.error);
			}
		} catch (err) {
			console.error(err);
			alert("Error starting run");
		} finally {
			setIsRunning(false);
		}
	};

	// --- HANDLE SHARE ---
	const handleShare = useCallback(() => {
		if (nodes.length === 0) {
			alert("Nothing to share! The canvas is empty.");
			return;
		}

		const workflowData = {
			name: workflowName,
			nodes: nodes,
			edges: edges,
			version: "1.0.0",
			exportedAt: new Date().toISOString(),
		};

		const jsonString = JSON.stringify(workflowData, null, 2);
		const blob = new Blob([jsonString], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		const filename = workflowName.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "workflow";
		link.download = `${filename}.json`;

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}, [nodes, edges, workflowName]);

	// Compute disabled state
	const isRunButtonDisabled = isSaving || isRunning || isGlobalRunning;

	return (
		<>
			<header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#111]">
				{/* --- LEFT SIDE (Logo + Name Input) --- */}
				<div className="flex items-center gap-3">
					<div className="w-6 h-6 rounded bg-gradient-to-tr from-pink-500 to-purple-500"></div>

					{/* Editable Workflow Name */}
					{isEditingName ? (
						<input
							type="text"
							value={workflowName}
							onChange={(e) => setWorkflowName(e.target.value)}
							onBlur={() => setIsEditingName(false)}
							onKeyDown={(e) => {
								if (e.key === "Enter") setIsEditingName(false);
								if (e.key === "Escape") {
									setIsEditingName(false);
								}
							}}
							autoFocus
							className="bg-[#222] text-sm font-bold text-white px-2 py-1 rounded border border-[#dfff4f] focus:outline-none"
						/>
					) : (
						<h1
							onClick={() => setIsEditingName(true)}
							className="text-sm font-bold text-white tracking-wider cursor-text hover:bg-white/10 px-2 py-1 rounded transition-colors flex items-center gap-2">
							{workflowName}
							{workflowId && <span className="opacity-50 font-normal text-xs">#{workflowId}</span>}
						</h1>
					)}
				</div>

				{/* --- RIGHT SIDE (Buttons) --- */}
				<div className="flex gap-2">
					{/* Open Button */}
					<button
						onClick={() => setIsLoadOpen(true)}
						className="flex items-center gap-2 px-3 py-2 bg-[#222] border border-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-all">
						<FolderOpen size={14} />
						OPEN
					</button>

					{/* Import Button */}
					<button
						onClick={handleImportClick}
						className="flex items-center gap-2 px-3 py-2 bg-[#222] border border-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-all">
						<Upload size={14} />
						IMPORT
					</button>
					<input
						type="file"
						ref={fileInputRef}
						onChange={handleFileChange}
						accept=".json"
						className="hidden"
					/>

					{/* Share Button */}
					<button
						onClick={handleShare}
						className="flex items-center gap-2 px-3 py-2 bg-[#222] border border-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-all group">
						<Share2 size={14} className="group-hover:text-[#dfff4f] transition-colors" />
						SHARE
					</button>

					{/* Save Button */}
					<button
						onClick={handleSave}
						disabled={isSaving || isRunning}
						className="flex items-center gap-2 px-4 py-2 bg-[#222] border border-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-all disabled:opacity-50">
						{isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
						SAVE
					</button>

					{/* 👇 RUN BUTTON RESTORED */}
					<button
						onClick={handleRun}
						disabled={isRunButtonDisabled}
						className="flex items-center gap-2 px-4 py-2 bg-[#dfff4f] text-black text-xs font-bold rounded-lg hover:bg-white transition-all disabled:opacity-50 hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(223,255,79,0.2)]">
						{isRunButtonDisabled ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
						{isRunButtonDisabled ? "RUNNING..." : "RUN"}
					</button>
				</div>
			</header>

			<LoadWorkflowModal isOpen={isLoadOpen} onClose={() => setIsLoadOpen(false)} />
		</>
	);
}
