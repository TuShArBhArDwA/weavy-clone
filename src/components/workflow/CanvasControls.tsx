"use client";

import React, {useEffect, useState} from "react";
import {useReactFlow} from "@xyflow/react";
import {useStore} from "zustand";
import {MousePointer2, Hand, Undo2, Redo2, Minus, Plus} from "lucide-react";
import {useWorkflowStore} from "@/store/workflowStore";
import {cn} from "@/lib/utils";
import type {CanvasControlsProps} from "@/lib/types";

// This prevents the infinite loop caused by unstable object references.
const useTemporalStore = () => useStore(useWorkflowStore.temporal);

export default function CanvasControls({isHandMode, toggleMode}: CanvasControlsProps) {
	const {fitView, zoomIn, zoomOut, getZoom} = useReactFlow();
	const [zoomLevel, setZoomLevel] = useState(100);

	// Access properties directly from the returned state
	const {undo, redo, pastStates, futureStates} = useTemporalStore();

	useEffect(() => {
		const interval = setInterval(() => {
			const z = getZoom();
			setZoomLevel(Math.round(z * 100));
		}, 100);
		return () => clearInterval(interval);
	}, [getZoom]);

	return (
		<div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1.5 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl backdrop-blur-md">
			{/* --- INTERACTION MODES --- */}
			<div className="flex items-center bg-[#252525] rounded-lg p-0.5">
				<button
					onClick={() => toggleMode(false)}
					className={cn(
						"p-1.5 rounded-md transition-all",
						!isHandMode ? "bg-[#dfff4f] text-black shadow-sm" : "text-white/50 hover:text-white hover:bg-white/10",
					)}
					title="Selection Mode (V)">
					<MousePointer2 size={16} fill={!isHandMode ? "currentColor" : "none"} />
				</button>
				<button
					onClick={() => toggleMode(true)}
					className={cn(
						"p-1.5 rounded-md transition-all",
						isHandMode ? "bg-[#dfff4f] text-black shadow-sm" : "text-white/50 hover:text-white hover:bg-white/10",
					)}
					title="Pan Mode (H)">
					<Hand size={16} />
				</button>
			</div>

			{/* Divider */}
			<div className="w-px h-5 bg-white/10 mx-1" />

			{/* --- UNDO / REDO --- */}
			<div className="flex items-center gap-0.5">
				<button
					onClick={() => undo()}
					disabled={pastStates.length === 0}
					className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
					title="Undo (Ctrl+Z)">
					<Undo2 size={16} />
				</button>
				<button
					onClick={() => redo()}
					disabled={futureStates.length === 0}
					className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
					title="Redo (Ctrl+Y)">
					<Redo2 size={16} />
				</button>
			</div>

			{/* Divider */}
			<div className="w-px h-5 bg-white/10 mx-1" />

			{/* --- ZOOM CONTROLS --- */}
			<div className="flex items-center gap-0.5">
				<button onClick={() => zoomOut()} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md">
					<Minus size={14} />
				</button>

				<button
					onClick={() => fitView({duration: 400})}
					className="flex items-center gap-1 px-2 py-1.5 min-w-[60px] justify-center rounded-md hover:bg-white/10 text-xs font-mono font-medium text-white/80 transition-colors">
					{zoomLevel}%
				</button>

				<button onClick={() => zoomIn()} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md">
					<Plus size={14} />
				</button>
			</div>
		</div>
	);
}
