"use client";

import React from "react";
import {BaseEdge, EdgeProps, getBezierPath} from "@xyflow/react";

export default function AnimatedEdge({id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd}: EdgeProps) {
	const [edgePath] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});

	return (
		<>
			{/* 1. Define the Gradient specific to this edge ID */}
			<defs>
				<linearGradient id={`gradient-${id}`} gradientUnits="userSpaceOnUse" x1={sourceX} y1={sourceY} x2={targetX} y2={targetY}>
					<stop offset="0%" stopColor="#ec4899" /> {/* Pink-500 (Source) */}
					<stop offset="100%" stopColor="#dfff4f" /> {/* Lime/Green (Target) - Matches your theme */}
				</linearGradient>
			</defs>

			{/* 2. Invisible thick path for easier clicking/hovering */}
			<path d={edgePath} strokeWidth={20} stroke="transparent" fill="none" className="react-flow__edge-interaction" />

			{/* 3. The Visible Gradient Path */}
			<path
				id={id}
				style={{
					...style,
					stroke: `url(#gradient-${id})`,
					strokeWidth: 3,
					strokeDasharray: 10, // Add dash array for dashes
					animation: "dashdraw 0.5s linear infinite", // Apply the animation
				}}
				className="react-flow__edge-path"
				d={edgePath}
				markerEnd={markerEnd}
			/>

			{/* 4. Define the animation for the dashes */}
			<style>
				{`
          @keyframes dashdraw {
            from { stroke-dashoffset: 20; }
            to { stroke-dashoffset: 0; }
          }
        `}
			</style>
		</>
	);
}
