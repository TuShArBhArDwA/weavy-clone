"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Clock, ChevronRight, ChevronDown, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { getWorkflowHistoryAction } from "@/app/actions/historyActions";
import { useWorkflowStore } from "@/store/workflowStore";
import { cn } from "@/lib/utils";

interface HistorySidebarProps {
	workflowId: string;
	isOpen: boolean;
	onClose: () => void;
}

export default function HistorySidebar({ workflowId, isOpen, onClose }: HistorySidebarProps) {
	const [runs, setRuns] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
	const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
	const lastRunTimestamp = useWorkflowStore((state) => state.lastRunTimestamp);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		// 1. Don't poll if closed or no ID
		if (!isOpen || !workflowId) return;

		let isMounted = true; // Prevent setting state on unmounted component

		const fetchHistory = async () => {
			const res = await getWorkflowHistoryAction(workflowId);

			if (!isMounted) return;

			if (res.success && res.runs) {
				setRuns(res.runs);

				const latestRun = res.runs[0];
				if (latestRun) {
					latestRun.nodes.forEach((execNode: any) => {
						if (execNode.status === "SUCCESS" && execNode.output) {
							updateNodeData(execNode.nodeId, {
								status: "success",
								outputs: [
									{
										id: execNode.id,
										type: "text",
										content: execNode.output.text || JSON.stringify(execNode.output),
										timestamp: Date.now(),
									},
								],
							});
						} else if (execNode.status === "FAILED") {
							updateNodeData(execNode.nodeId, { status: "error", errorMessage: execNode.error });
						} else if (execNode.status === "RUNNING") {
							updateNodeData(execNode.nodeId, { status: "loading" });
						}
					});

					// Removed: Logic that stops polling if run is finished.
					// We want to KEEP polling to see NEW runs if user clicks "Run" again.
					// if (latestRun.status === "COMPLETED" || latestRun.status === "FAILED") {
					// 	if (intervalRef.current) {
					// 		clearInterval(intervalRef.current);
					// 		intervalRef.current = null;
					// 	}
					// }
				}
			}
		};

		setLoading(true);
		fetchHistory().finally(() => {
			if (isMounted) setLoading(false);
		}); // Initial fetch

		// 2. Increase poll time to 3 seconds to reduce "Compiling" log spam
		intervalRef.current = setInterval(fetchHistory, 3000); // Poll every 3s for faster updates

		return () => {
			isMounted = false;
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [workflowId, isOpen, updateNodeData, lastRunTimestamp]);

	if (!isOpen) return null;

	return (
		<div className="absolute right-0 top-0 h-full w-80 bg-[#111] border-l border-white/10 shadow-2xl z-20 flex flex-col">
			{/* Header */}
			<div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#161616]">
				<h2 className="text-sm font-bold text-white flex items-center gap-2">
					<Clock size={16} className="text-[#dfff4f]" /> Run History
				</h2>
				<button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
					<X size={18} />
				</button>
			</div>

			{/* List */}
			<div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
				{loading && runs.length === 0 && (
					<div className="flex justify-center py-10">
						<Loader2 size={24} className="animate-spin text-white/30" />
					</div>
				)}

				{!loading && runs.length === 0 && (
					<div className="text-white/30 text-xs text-center py-10 border border-dashed border-white/10 rounded-lg">
						No runs yet.
						<br />
						Click "Run" to start!
					</div>
				)}

				{runs.map((run) => (
					<div
						key={run.id}
						className={cn(
							"border rounded-lg overflow-hidden transition-all",
							run.status === "RUNNING" ? "border-[#dfff4f]/50 bg-[#dfff4f]/5" : "border-white/10 bg-[#1a1a1a]",
						)}>
						{/* Run Summary Card */}
						<div
							className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
							onClick={() => setExpandedRunId(expandedRunId === run.id ? null : run.id)}>
							<div className="flex items-center gap-3">
								<StatusIcon status={run.status} />
								<div>
									<div className="text-xs font-bold text-white flex items-center gap-2">
										Run #{run.id.slice(0, 4)}
										{run.status === "RUNNING" && <span className="text-[10px] text-[#dfff4f] animate-pulse">● Live</span>}
									</div>
									<div className="text-[10px] text-white/50 font-mono mt-0.5">{new Date(run.startedAt).toLocaleTimeString()}</div>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-[10px] text-white/30 font-mono bg-black/20 px-1.5 py-0.5 rounded">{run.duration}</span>
								{expandedRunId === run.id ? (
									<ChevronDown size={14} className="text-white/50" />
								) : (
									<ChevronRight size={14} className="text-white/50" />
								)}
							</div>
						</div>

						{/* Expanded Details (Node List) */}
						{expandedRunId === run.id && (
							<div className="bg-black/40 border-t border-white/5 p-2 space-y-1">
								{run.nodes.length === 0 ? (
									<div className="text-[10px] text-white/30 text-center py-2 italic">Initializing nodes...</div>
								) : (
									run.nodes.map((node: any) => (
										<div key={node.id} className="relative pl-3 py-1.5 border-l border-white/10 ml-1">
											<div className="flex items-center gap-2 mb-1">
												<StatusIcon status={node.status} size={10} />
												<span className="text-[11px] text-white/90 font-medium">{node.type}</span>
												<span className="text-[10px] text-white/30 ml-auto font-mono">{node.duration}</span>
											</div>

											{/* Output Preview */}
											{node.status === "SUCCESS" && node.output?.text && (
												<div className="bg-white/5 p-1.5 rounded text-[10px] text-emerald-400 font-mono truncate border border-white/5">
													{node.output.text}
												</div>
											)}

											{/* Error Message */}
											{node.status === "FAILED" && (
												<div className="bg-red-500/10 p-1.5 rounded text-[10px] text-red-400 border border-red-500/20 break-words">
													{node.error || "Error"}
												</div>
											)}
										</div>
									))
								)}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

// --- Icons ---
function StatusIcon({ status, size = 16 }: { status: string; size?: number }) {
	if (status === "SUCCESS" || status === "COMPLETED") return <CheckCircle2 size={size} className="text-emerald-500" />;
	if (status === "FAILED") return <XCircle size={size} className="text-red-500" />;
	if (status === "RUNNING") return <Loader2 size={size} className="text-[#dfff4f] animate-spin" />;
	return <div className={`w-${size / 4} h-${size / 4} rounded-full bg-white/20`} />;
}
