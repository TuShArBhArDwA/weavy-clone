"use client";

import React, {useRef, useState, useMemo} from "react";
import {motion, useScroll, useMotionValueEvent, useTransform, AnimatePresence} from "framer-motion";
import Image from "next/image";

// --- DATA SOURCE ---
export const workflowAppModeData = {
	heading: {
		part1: "From Workflow",
		part2: "to App Mode",
		subtitle: "Maximize your team ability, by automatically generating a simplified UI",
	},

	// Workflow Mode (Left Side / Initial State)
	workflowMode: {
		title: "Workflow Mode",
		nodes: [
			{
				id: 1,
				type: "PROMPT",
				label: "PROMPT",
				position: {top: "8%", left: "5%"},
				size: {width: "280px", height: "auto"},
				content: {
					text: "A transparent, green-tinted mechanical weave machine. It has a cylindrical component on the left, which seems to be rotating, producing thin, white strands that flow downwards. The device is mounted on a triangular stand, and there's a circular component on the right side. The entire setup is placed on a flat surface with a gradient background, transitioning from white at the top to a deeper shade at the bottom. Cinematic",
				},
				bgColor: "#F4FF99",
			},
			{
				id: 2,
				type: "IMAGE",
				label: "IMAGE REFERENCE",
				position: {top: "55%", left: "25%"},
				size: {width: "140px", height: "auto"},
				image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68262b7678811e48ff42f7db_Frame%20427321160.avif",
				bgColor: "#2A2A2A",
			},
			{
				id: 3,
				type: "IMAGE",
				label: "IMAGE",
				sublabel: "BRIA",
				position: {top: "12%", left: "42%"},
				size: {width: "180px", height: "auto"},
				image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68262b76a834003529b7f5d7_Group%207798.avif",
			},
			{
				id: 4,
				type: "IMAGE",
				label: "IMAGE",
				sublabel: "GEMINI V2",
				position: {top: "48%", left: "48%"},
				size: {width: "160px", height: "auto"},
				image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68262b761ffbb948a3e6f9e0_Frame%20427321155.avif",
			},
			{
				id: 5,
				type: "IMAGE",
				label: "IMAGE",
				position: {top: "62%", left: "68%"},
				size: {width: "140px", height: "auto"},
				image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68262b7668cc066c00b3d2a2_Frame%20427321159.avif",
			},
		],
		connections: [
			{from: 1, to: 3},
			{from: 2, to: 3},
			{from: 3, to: 4},
			{from: 4, to: 5},
		],
	},

	// App Mode (Right Side / Target Elements)
	appMode: {
		title: "App Mode",
		simplified: true,
		nodes: [
			{
				id: 1,
				type: "COLOR STYLE REF",
				label: "COLOR STYLE REF",
				position: {top: "18%", left: "62%"},
				size: {width: "120px", height: "auto"},
				image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68262b764367eac325e77daa_Frame%20427321158.avif",
			},
			{
				id: 2,
				type: "OUTPUT",
				label: "OUTPUT",
				position: {top: "12%", right: "8%"},
				size: {width: "320px", height: "auto"},
				image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68262b76e100d9cf8cc06b34_Frame%20427321157.avif",
				bgColor: "#F4FF99",
				featured: true,
			},
			{
				id: 3,
				type: "COMPOSITOR",
				label: "COMPOSITOR",
				position: {top: "58%", right: "28%"},
				size: {width: "120px", height: "auto"},
				image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68262b763488bd282a6e4f3f_Frame%20427321156.avif",
				bgColor: "#B8B8B8",
			},
		],
		connections: [
			{from: 1, to: 2},
			{from: 3, to: 2},
		],
	},
};

// --- COMPONENT ---

export default function WorkflowTransition() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [isAppMode, setIsAppMode] = useState(false);

	// Identify Key Nodes
	// 1. The Prompt (Source: Workflow Node 1)
	const promptNode = workflowAppModeData.workflowMode.nodes.find((n) => n.type === "PROMPT");

	// 2. The Output (Source: App Mode Node 2)
	const outputNode = workflowAppModeData.appMode.nodes.find((n) => n.featured === true);

	// 3. Floating Nodes (Everything else)
	// We combine the rest of workflow nodes and the rest of appMode nodes to serve as background elements
	const floatingWorkflowNodes = workflowAppModeData.workflowMode.nodes.filter((n) => n.type !== "PROMPT");
	const floatingAppNodes = workflowAppModeData.appMode.nodes.filter((n) => !n.featured);

	const allFloatingNodes = [...floatingWorkflowNodes, ...floatingAppNodes];

	// Scroll Logic
	const {scrollYProgress} = useScroll({
		target: containerRef,
		offset: ["start start", "end end"],
	});

	// Trigger State Change at 30% scroll
	useMotionValueEvent(scrollYProgress, "change", (latest) => {
		setIsAppMode(latest > 0.3);
	});

	// Header & Background Animations
	const toggleX = useTransform(scrollYProgress, [0.25, 0.35], [0, 24]);
	const bgOpacity = useTransform(scrollYProgress, [0.25, 0.35], [0, 1]);

	// Parallax Values for Floating Nodes
	const y1 = useTransform(scrollYProgress, [0, 0.5], [0, -40]);
	const y2 = useTransform(scrollYProgress, [0, 0.5], [0, 40]);

	return (
		<section ref={containerRef} className="h-[300vh] relative bg-[#FBFBFB]">
			{/* Sticky Viewport */}
			<div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col pt-16">
				{/* --- 1. HEADER --- */}
				<div className="text-center relative z-30 mb-8 px-4">
					<p className="text-gray-500 mb-6 text-sm font-medium max-w-lg mx-auto leading-relaxed">{workflowAppModeData.heading.subtitle}</p>
					<div className="flex items-center justify-center gap-4 md:gap-6">
						<h2
							className={`text-4xl md:text-6xl font-medium tracking-tight transition-colors duration-500 ${
								isAppMode ? "text-gray-300" : "text-black"
							}`}>
							{workflowAppModeData.heading.part1}
						</h2>

						{/* Toggle Switch */}
						<div className="relative w-14 h-8 rounded-full bg-black/10 p-1">
							<motion.div style={{opacity: bgOpacity}} className="absolute inset-0 bg-[#dfff4f] rounded-full" />
							<motion.div style={{x: toggleX}} className="relative z-10 w-6 h-6 bg-black rounded-full shadow-sm" />
						</div>

						<h2
							className={`text-4xl md:text-6xl font-medium tracking-tight transition-colors duration-500 ${
								isAppMode ? "text-black" : "text-gray-300"
							}`}>
							{workflowAppModeData.heading.part2}
						</h2>
					</div>
				</div>

				{/* --- 2. CANVAS AREA --- */}
				<div className="relative w-full max-w-[1400px] mx-auto flex-1 flex items-center justify-center">
					{/* The Layout Container: Morphs from Relative (Scattered) to Flex (Organized) */}
					<motion.div
						layout
						className={`w-full h-[600px] transition-all duration-700 ease-[0.22,1,0.36,1] ${
							isAppMode ? "flex flex-row items-stretch justify-center gap-6 px-4 md:px-10" : "relative"
						}`}>
						{/* === KEY ELEMENT 1: PROMPT === */}
						{promptNode && (
							<motion.div
								layout
								initial={false}
								className={`shadow-sm rounded-2xl flex flex-col z-20 overflow-hidden
                            ${
								isAppMode
									? "w-full md:w-[40%] order-1 h-auto relative" // App Mode
									: "absolute" // Workflow Mode
							}
                        `}
								style={{
									backgroundColor: promptNode.bgColor || "#F4FF99",
									// In Workflow mode, use data positions. In App mode, these are ignored due to Flexbox
									...(!isAppMode && {
										top: promptNode.position.top,
										left: promptNode.position.left,
										width: promptNode.size.width,
									}),
								}}
								transition={{type: "spring", bounce: 0.1, duration: 0.8}}>
								<motion.div layout="position" className="p-6 md:p-8 flex flex-col h-full">
									<div className="mb-4">
										<span className="text-xs font-bold tracking-wider text-black/60 uppercase">{promptNode.label}</span>
									</div>
									<motion.p layout="position" className="text-sm md:text-base leading-relaxed font-medium text-black/80">
										{promptNode.content?.text}
									</motion.p>

									{/* Run Button (Appears only in App Mode) */}
									<motion.button
										initial={{opacity: 0}}
										animate={{opacity: isAppMode ? 1 : 0}}
										transition={{delay: 0.4}}
										className={`mt-auto pt-6 pb-2 px-0 bg-transparent text-left font-bold text-sm tracking-wide text-black hover:opacity-70 transition-opacity uppercase ${
											!isAppMode && "pointer-events-none"
										}`}>
										Run
									</motion.button>
								</motion.div>
							</motion.div>
						)}

						{/* === KEY ELEMENT 2: OUTPUT === */}
						{outputNode && (
							<motion.div
								layout
								initial={false}
								className={`bg-white rounded-2xl shadow-sm z-20 overflow-hidden
                            ${isAppMode ? "w-full md:w-[60%] order-2 h-auto relative" : "absolute"}
                        `}
								style={{
									// In Workflow mode, use data positions
									...(!isAppMode && {
										top: outputNode.position.top,
										right: outputNode.position.right || "auto",
										left: outputNode.position.left || "auto",
										width: outputNode.size.width,
									}),
								}}
								transition={{type: "spring", bounce: 0.1, duration: 0.8}}>
								{/* Header Bar using bgColor from data */}
								<div className="px-6 py-4 border-b border-gray-100" style={{backgroundColor: outputNode.bgColor || "#fff"}}>
									<span className="text-xs font-bold tracking-wider text-black/60 uppercase">{outputNode.label}</span>
								</div>

								{/* Image Content */}
								<div className="relative w-full h-full min-h-[300px] flex items-center justify-center bg-gray-50/50 p-4">
									<div className="relative w-full h-full">
										<Image src={outputNode.image || ""} alt="Output" fill className="object-contain" />
									</div>
								</div>
							</motion.div>
						)}

						{/* === FLOATING NODES (Background Elements) === */}
						<AnimatePresence>
							{!isAppMode && allFloatingNodes.map((node, i) => <FloatingNode key={`float-${i}`} node={node} y={i % 2 === 0 ? y1 : y2} />)}
						</AnimatePresence>
					</motion.div>
				</div>
			</div>
		</section>
	);
}

// --- SUBCOMPONENT: Floating Node ---
import type { MotionValue } from "framer-motion";

interface FloatingNodeProps {
	node: {
		id: number;
		type: string;
		label?: string;
		sublabel?: string;
		position: {
			top?: string;
			left?: string;
			right?: string;
		};
		size: {
			width: string;
			height: string;
		};
		image?: string;
		bgColor?: string;
	};
	y: MotionValue<number>;
}

function FloatingNode({node, y}: FloatingNodeProps) {
	const {position, size, image, label, sublabel, bgColor} = node;

	return (
		<motion.div
			style={{
				top: position.top,
				left: position.left,
				right: position.right,
				width: size.width,
				y,
			}}
			initial={{opacity: 0, scale: 0.8}}
			animate={{opacity: 1, scale: 1}}
			exit={{opacity: 0, scale: 0.9, filter: "blur(10px)", transition: {duration: 0.4}}}
			className="absolute rounded-xl overflow-hidden shadow-[0_8px_20px_rgb(0,0,0,0.08)] bg-white pointer-events-none z-10">
			{/* If node has a label, show header */}
			{(label || sublabel) && (
				<div className="px-3 py-2 flex flex-col justify-center" style={{backgroundColor: bgColor || "#ffffff"}}>
					{label && <span className="text-[9px] font-bold tracking-widest text-black/40 uppercase">{label}</span>}
					{sublabel && <span className="text-[9px] font-bold tracking-widest text-black uppercase mt-0.5">{sublabel}</span>}
				</div>
			)}

			{/* Node Image */}
			{image && (
				<div className="relative w-full aspect-[4/5] bg-gray-50">
					<Image src={image} alt={label || "Node"} width={200} height={300} className="w-full h-full object-cover" />
				</div>
			)}
		</motion.div>
	);
}
