"use client";

import React, {useSyncExternalStore} from "react";
import {Undo2, Redo2} from "lucide-react";
import {useWorkflowStore} from "@/store/workflowStore";
import {useStore} from "zustand";

export default function UndoRedoControls() {
	// Access the temporal store part of zundo
	const {undo, redo, pastStates, futureStates} = useStore(useWorkflowStore.temporal);

	// Hydration check to prevent UI mismatch
	const isMounted = useSyncExternalStore(
		() => () => {},
		() => true,
		() => false
	);

	if (!isMounted) return null;

	const canUndo = pastStates.length > 0;
	const canRedo = futureStates.length > 0;

	return (
		<div className="flex items-center gap-1 bg-[#1a1a1a] border border-white/10 p-1 rounded-lg shadow-xl">
			<button
				onClick={() => undo()}
				disabled={!canUndo}
				className={`p-1.5 rounded transition-all ${
					canUndo ? "text-white/70 hover:text-white hover:bg-white/10 active:scale-95" : "text-white/20 cursor-not-allowed"
				}`}
				title="Undo (Ctrl+Z)">
				<Undo2 size={16} />
			</button>

			<div className="w-px h-4 bg-white/10 mx-1" />

			<button
				onClick={() => redo()}
				disabled={!canRedo}
				className={`p-1.5 rounded transition-all ${
					canRedo ? "text-white/70 hover:text-white hover:bg-white/10 active:scale-95" : "text-white/20 cursor-not-allowed"
				}`}
				title="Redo (Ctrl+Y)">
				<Redo2 size={16} />
			</button>
		</div>
	);
}
