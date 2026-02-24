"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Clock } from "lucide-react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/workflow/Sidebar";
import SidebarNodeList from "@/components/workflow/SidebarNodeList";
import Header from "@/components/workflow/Header";
import { useWorkflowStore } from "@/store/workflowStore";
import { loadWorkflowAction } from "@/app/actions/workflowActions";
import { DEMO_WORKFLOWS } from "@/lib/demoWorkflows";
import HistorySidebar from "@/components/workflow/HistorySidebar"; // Ensure this import exists

// 1. DYNAMIC IMPORT: Disables SSR for the Canvas
// This replaces the need for useState/useEffect isMounted checks
const FlowEditor = dynamic(() => import("@/components/workflow/FlowEditor"), {
	ssr: false,
});

export default function EditorPage() {
	const params = useParams();
	const workflowId = params.id as string;

	const [loading, setLoading] = useState(true);
	const { setWorkflowId } = useWorkflowStore();
	const [isHistoryOpen, setIsHistoryOpen] = useState(false);


	const [isSidebarOpen, setSidebarOpen] = useState(true);

	useEffect(() => {
		async function initializeWorkflow() {
			if (!workflowId) {
				setLoading(false);
				return;
			}

			setLoading(true);

			// Check for Demo Template
			const demo = DEMO_WORKFLOWS.find((d) => d.id === workflowId);
			if (demo) {
				console.log("Loading Demo Template:", demo.name);

				// Get the graph data from the function
				const { nodes, edges } = demo.getGraph();

				useWorkflowStore.setState({
					nodes: nodes,
					edges: edges,
					// Set ID to null so hitting "Save" creates a NEW entry
					workflowId: null,
					workflowName: demo.name, // Set the initial name from demo
					isGlobalRunning: false, // Reset run lock from previous workflow
				});

				setLoading(false);
				return; // Stop here, don't check DB
			}

			// Existing Logic: Check "New" or Database

			// Check if it's "new" - create empty workflow
			if (workflowId === "new") {
				useWorkflowStore.setState({
					nodes: [],
					edges: [],
					workflowId: null,
					workflowName: "Untitled Workflow", // Reset name for new workflow
					isGlobalRunning: false,
				});
				setLoading(false);
				return;
			}

			// Try loading from the Database
			try {
				const res = await loadWorkflowAction(workflowId);

				// Cast 'res' to any to bypass the "Property does not exist on type never" error
				// This is necessary because TS struggles with the Discriminated Union from the Server Action
				if ((res as any).success) {
					const rawData = (res as any).data;

					if (rawData) {
						const flowData = typeof rawData === "string" ? JSON.parse(rawData) : rawData;

						useWorkflowStore.setState({
							nodes: flowData.nodes || [],
							edges: flowData.edges || [],
							workflowId: workflowId,
							workflowName: (res as any).name || "Untitled Workflow",
							isGlobalRunning: false,
						});
					}
				} else {
					// Workflow not found, start with empty state
					console.log("Workflow not found, starting fresh.");
					useWorkflowStore.setState({
						nodes: [],
						edges: [],
						workflowId: null,
						workflowName: "Untitled Workflow",
						isGlobalRunning: false,
					});
				}
			} catch (error) {
				console.error("Failed to load workflow:", error);
				// Fallback to empty state on error
				useWorkflowStore.setState({
					nodes: [],
					edges: [],
					workflowId: null,
					workflowName: "Untitled Workflow",
					isGlobalRunning: false,
				});
			} finally {
				setLoading(false);
			}
		}

		initializeWorkflow();
	}, [workflowId, setWorkflowId]);

	if (loading) {
		return (
			<div className="flex h-screen w-full items-center justify-center bg-black text-white">
				<Loader2 className="animate-spin mb-2" size={32} />
				<span className="text-sm text-white/50 ml-2">Loading workflow...</span>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-screen w-full bg-black text-white overflow-hidden">
			{/* 1. Header at the top */}
			<Header />

			<div className="flex flex-1 h-full overflow-hidden relative">
				{/* ^ Add 'relative' to the container so the absolute sidebar works */}

				<Sidebar>
					<SidebarNodeList />
				</Sidebar>

				<main className="flex h-screen w-full bg-[#0a0a0a] relative overflow-hidden">
					<FlowEditor isSidebarOpen={isSidebarOpen} />

					{/* Sidebar Toggle Button */}
					<button
						onClick={() => setSidebarOpen((open) => !open)}
						className="absolute top-4 right-4 z-10 bg-black/50 border border-white/20 text-white p-2 rounded hover:bg-white/10 transition-colors"
						title={isSidebarOpen ? "Hide History" : "Show History"}>
						<Clock size={20} />
					</button>

					{/* Render Sidebar */}
					{isSidebarOpen && <HistorySidebar workflowId={workflowId} isOpen={true} onClose={() => setSidebarOpen(false)} />}
				</main>
			</div>
		</div>
	);
}
