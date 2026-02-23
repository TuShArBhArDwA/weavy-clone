"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";

// --- DATA ---
const ORIGINAL_WORKFLOWS = [
	{
		id: 1,
		title: "Multiple Models",
		image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc15e_Workflow%2001.avif",
		tryLink: "https://app.weaave.ai/recipe/dIjHiwG4WWVtodBraoA2",
	},
	{
		id: 2,
		title: "Wan LoRa Inflate",
		image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc164_Workflow%2003.avif",
		tryLink: "https://app.weaave.ai/flow/ajkQsnEdST1Y9ymyTYaZ",
	},
	{
		id: 3,
		title: "ControlNet - Structure Reference",
		image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc16a_Workflow%2002.avif",
		tryLink: "https://app.weaave.ai/recipe/lmQ3o3xBQw336nCQx6ee",
	},
	{
		id: 4,
		title: "Camera Angle Control",
		image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc170_Workflow%2004.avif",
		tryLink: "https://app.weaave.ai/recipe/RnmpwkU1BWvR1d2xvDXS",
	},
	{
		id: 5,
		title: "Relight 2.0 human",
		image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0ac314fefe464791808_Relight%202.0%20human.avif",
		tryLink: "https://app.weaave.ai/recipe/YPXM99M6Wujufa0tNgXc",
	},
	{
		id: 6,
		title: "Weaave Logo",
		image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0acdb693fa2102f0af2_Weavy%20Logo.avif",
		tryLink: "https://app.weaave.ai/recipe/XvULalxaRR01K0RA1T0Kqx?view=workflow",
	},
	{
		id: 7,
		title: "Relight - Product",
		image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0ac04c55a803826a6e5_Relight%20-%20Product.avif",
		tryLink: "https://app.weaave.ai/recipe/oOuwYBIffBhSc2PKxJWL",
	},
	{
		id: 8,
		title: "Wan Lora - Rotate",
		image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0acc901ee5c718efc90_Wan%20Lora%20-%20Rotate.avif",
		tryLink: "https://app.weaave.ai/recipe/4IFNep5XnzgCzv84NN4R",
	},
];

// Duplicate data 3 times to create the "Infinite" illusion
const workflows = [
	...ORIGINAL_WORKFLOWS.map((item) => ({ ...item, uniqueId: `p-${item.id}` })),
	...ORIGINAL_WORKFLOWS.map((item) => ({ ...item, uniqueId: `c-${item.id}` })), // Center set (initial view)
	...ORIGINAL_WORKFLOWS.map((item) => ({ ...item, uniqueId: `n-${item.id}` })),
];

const ExploreWorkflows = () => {
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const [activeIndex, setActiveIndex] = useState<number>(0);

	// Constants
	const CARD_WIDTH = 400;
	const GAP = 24;
	const TOTAL_ITEM_WIDTH = CARD_WIDTH + GAP;
	const SINGLE_SET_WIDTH = ORIGINAL_WORKFLOWS.length * TOTAL_ITEM_WIDTH;

	// --- 1. INITIALIZE SCROLL POSITION ---
	useEffect(() => {
		if (scrollContainerRef.current) {
			const startPosition = SINGLE_SET_WIDTH + GAP / 2;
			scrollContainerRef.current.scrollLeft = startPosition;
		}
	}, [SINGLE_SET_WIDTH]);

	// --- 2. HANDLE SCROLL (Scaling & Infinite Loop) ---
	const handleScroll = useCallback(() => {
		if (!scrollContainerRef.current) return;

		const container = scrollContainerRef.current;
		const scrollLeft = container.scrollLeft;
		const containerCenter = scrollLeft + container.clientWidth / 2;

		// A. Calculate Active Index
		let closestIndex = 0;
		let minDistance = Number.MAX_VALUE;

		const cards = Array.from(container.children) as HTMLElement[];

		cards.forEach((card, index) => {
			const cardCenter = card.offsetLeft + card.clientWidth / 2;
			const distance = Math.abs(containerCenter - cardCenter);

			if (distance < minDistance) {
				minDistance = distance;
				closestIndex = index;
			}
		});

		setActiveIndex(closestIndex);

		// B. Infinite Scroll Teleportation
		if (scrollLeft >= SINGLE_SET_WIDTH * 2) {
			container.style.scrollBehavior = "auto";
			container.scrollLeft = scrollLeft - SINGLE_SET_WIDTH;
			container.style.scrollBehavior = "smooth";
		} else if (scrollLeft <= SINGLE_SET_WIDTH * 0.5) {
			container.style.scrollBehavior = "auto";
			container.scrollLeft = scrollLeft + SINGLE_SET_WIDTH;
			container.style.scrollBehavior = "smooth";
		}
	}, [SINGLE_SET_WIDTH]);

	// --- 3. ATTACH SCROLL LISTENER ---
	useEffect(() => {
		const container = scrollContainerRef.current;
		if (container) {
			// Add the standard listener for user scrolling
			container.addEventListener("scroll", handleScroll);

			// FIX: Wrap the initial call in requestAnimationFrame to avoid
			// "setState synchronously within an effect" warning.
			requestAnimationFrame(() => {
				handleScroll();
			});
		}
		return () => container?.removeEventListener("scroll", handleScroll);
	}, [handleScroll]);
	// --- BUTTON CONTROLS ---
	const scroll = (direction: "left" | "right") => {
		if (scrollContainerRef.current) {
			const { current } = scrollContainerRef;
			const scrollAmount = TOTAL_ITEM_WIDTH;

			if (direction === "left") {
				current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
			} else {
				current.scrollBy({ left: scrollAmount, behavior: "smooth" });
			}
		}
	};

	return (
		<section className="bg-[#111111] py-24 px-0 overflow-hidden text-white font-sans w-full">
			{/* HEADER */}
			<div className="max-w-[1600px] mx-auto px-6 md:px-10 mb-8">
				<h2 className="text-5xl md:text-7xl font-medium tracking-tight mb-6 leading-tight">Explore Our Workflows</h2>
				<p className="text-lg text-white/60 leading-relaxed max-w-2xl">
					From multi-layer compositing to matte manipulation, Weaave keeps up with your creativity with all the editing tools you recognize and rely
					on.
				</p>
			</div>

			{/* --- CAROUSEL TRACK --- */}
			<div
				ref={scrollContainerRef}
				className="flex gap-6 overflow-x-auto py-12 scrollbar-hide snap-x snap-mandatory px-6"
				style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
				{workflows.map((workflow, index) => {
					const isActive = index === activeIndex;

					return (
						<div
							key={workflow.uniqueId}
							className={`
                flex-shrink-0 relative transition-all duration-300 ease-out
                /* SUBTLE SCALING ONLY - NO OPACITY CHANGE */
                ${isActive ? "scale-105 z-10" : "scale-100"}
              `}
							style={{
								width: "400px",
								maxWidth: "85vw",
							}}>
							{/* Workflow Title */}
							<h3 className={`text-xl font-medium mb-4 transition-colors ${isActive ? "text-white" : "text-white/50"}`}>{workflow.title}</h3>

							{/* Card Container */}
							<div
								className={`
                  relative aspect-video w-full rounded-xl overflow-hidden bg-[#1a1a1a] 
                  border transition-all duration-300
                  ${isActive ? "border-white/30 shadow-[0_0_30px_rgba(0,0,0,0.5)]" : "border-white/5"}
                `}>
								{/* Background Image - Always Full Opacity */}
								<Image src={workflow.image} alt={workflow.title} fill className="object-cover" />

								{/* "Try" Button */}
								<a
									href={workflow.tryLink}
									target="_blank"
									rel="noopener noreferrer"
									className={`
                    absolute bottom-4 left-4 bg-[#dfff4f] text-black px-5 py-1.5 rounded-md font-bold text-xs md:text-sm 
                    transition-all duration-300 z-20 hover:bg-white
                    ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0"}
                  `}>
									Try
								</a>
							</div>
						</div>
					);
				})}
			</div>

			{/* --- NAVIGATION ARROWS --- */}
			<div className="max-w-[1600px] mx-auto px-6 md:px-10 flex gap-3 mt-4">
				<button
					onClick={() => scroll("left")}
					className="w-12 h-12 rounded-2xl border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all">
					<ArrowLeft size={20} />
				</button>
				<button
					onClick={() => scroll("right")}
					className="w-12 h-12 rounded-2xl border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all">
					<ArrowRight size={20} />
				</button>
			</div>
		</section>
	);
};

export default ExploreWorkflows;
