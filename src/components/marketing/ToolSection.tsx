"use client";

import {useState, useEffect} from "react";
import {motion} from "framer-motion";
import Image from "next/image";

export default function ToolSection() {
	const [activeTool, setActiveTool] = useState(1); // Default to Inpaint

	const tools = [
		{name: "Crop", image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563af147b5d7c2496ff_Crop%402x.avif"},
		{name: "Inpaint", image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245639e16941f61edcc06_Inpaint%402x.avif"},
		{name: "Upscale", image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245638e6550c59d0bce8f_Upscale%402x.avif"},
		{name: "Outpaint", image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6822456436dd3ce4b39b6372_Outpaint%402x.avif"},
		{name: "Mask Extractor", image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563d5cb54c747f189ae_Mask%402x.avif"},
		{name: "Relight", image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563b4846eaa2d70f69e_Relight%402x.avif"},
		{name: "Invert", image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563d93b3ce65b54f07b_Invert%402x.avif"},
		{name: "Image Describer", image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825ab42a8f361a9518d5a7f_Image%20describer%402x.avif"},
		{name: "Channels", image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682245646909d06ed8a17f4d_Channels%402x.avif"},
		{name: "Painter", image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563d93b3ce65b54f07b_Invert%402x.avif"},
		{name: "Z Depth Extractor", image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68224563290cc77eba8f086a_z%20depth%402x.avif"},
	];

	const leftButtons = [
		{index: 0, name: "Crop", top: "15%"},
		{index: 6, name: "Invert", top: "30%"},
		{index: 3, name: "Outpaint", top: "45%"},
		{index: 1, name: "Inpaint", top: "60%"},
		{index: 4, name: "Mask Extractor", top: "75%"},
		{index: 2, name: "Upscale", top: "90%"},
	];

	const rightButtons = [
		{index: 9, name: "Painter", top: "15%"},
		{index: 8, name: "Channels", top: "35%"},
		{index: 7, name: "Image Describer", top: "55%"},
		{index: 5, name: "Relight", top: "75%"},
		{index: 10, name: "Z Depth Extractor", top: "90%"},
	];

	// Auto-cycle through tools
	useEffect(() => {
		const interval = setInterval(() => {
			setActiveTool((prev) => (prev + 1) % tools.length);
		}, 3000);
		return () => clearInterval(interval);
	}, []);

	return (
		<section className="py-20 md:py-32 px-6 bg-[#FBFBFB] overflow-hidden">
			{/* Header */}
			<div className="max-w-[1600px] mx-auto text-center mb-12 md:mb-20">
				<h2 className="text-[8vw] md:text-[5vw] lg:text-[4.5vw] font-medium tracking-[-0.03em] text-black leading-[1.1] mb-4 md:mb-6">
					With all the professional <br /> tools you rely on
				</h2>
				<p className="text-black/60 text-base md:text-lg lg:text-xl font-medium tracking-wide">In one seamless workflow</p>
			</div>

			{/* Main Container */}
			<div className="max-w-7xl mx-auto relative">
				{/* Desktop Layout - Three Column Grid */}
				<div className="hidden md:grid md:grid-cols-[200px_1fr_200px] gap-8 items-center">
					{/* Left Buttons */}
					<div className="flex flex-col gap-3 justify-center">
						{leftButtons.map((tool, idx) => (
							<motion.button
								key={tool.index}
								onMouseEnter={() => setActiveTool(tool.index)}
								onClick={() => setActiveTool(tool.index)}
								initial={{opacity: 0, x: -20}}
								whileInView={{opacity: 1, x: 0}}
								viewport={{once: true}}
								transition={{delay: idx * 0.05, duration: 0.3}}
								className={`
									px-5 py-2.5 rounded-full shadow-sm border text-[15px] font-medium
									whitespace-nowrap transition-all duration-200 cursor-pointer
									${
										activeTool === tool.index
											? "bg-[#D4FF00] border-[#D4FF00] text-black scale-105 shadow-md"
											: "bg-white/90 backdrop-blur-sm border-black/10 text-black/70 hover:bg-[#D4FF00]/20 hover:border-[#D4FF00]/30 hover:scale-[1.02]"
									}
								`}>
								{tool.name}
							</motion.button>
						))}
					</div>

					{/* Center Image */}
					<div className="relative w-full aspect-square max-w-[600px] mx-auto">
						<div className="absolute inset-0 bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-3xl shadow-2xl overflow-hidden border border-black/5">
							{tools.map((tool, idx) => (
								<motion.img
									key={idx}
									src={tool.image}
									alt={tool.name}
									initial={{opacity: 0}}
									animate={{opacity: activeTool === idx ? 1 : 0}}
									transition={{duration: 0.5, ease: "easeInOut"}}
									className="absolute inset-0 w-full h-full object-cover"
								/>
							))}
						</div>
					</div>

					{/* Right Buttons */}
					<div className="flex flex-col gap-3 justify-center">
						{rightButtons.map((tool, idx) => (
							<motion.button
								key={tool.index}
								onMouseEnter={() => setActiveTool(tool.index)}
								onClick={() => setActiveTool(tool.index)}
								initial={{opacity: 0, x: 20}}
								whileInView={{opacity: 1, x: 0}}
								viewport={{once: true}}
								transition={{delay: idx * 0.05, duration: 0.3}}
								className={`
									px-5 py-2.5 rounded-full shadow-sm border text-[15px] font-medium
									whitespace-nowrap transition-all duration-200 cursor-pointer
									${
										activeTool === tool.index
											? "bg-[#D4FF00] border-[#D4FF00] text-black scale-105 shadow-md"
											: "bg-white/90 backdrop-blur-sm border-black/10 text-black/70 hover:bg-[#D4FF00]/20 hover:border-[#D4FF00]/30 hover:scale-[1.02]"
									}
								`}>
								{tool.name}
							</motion.button>
						))}
					</div>
				</div>

				{/* Mobile Layout - Stacked */}
				<div className="md:hidden flex flex-col items-center gap-6">
					{/* Image */}
					<div className="relative w-full aspect-square max-w-[400px] mx-auto">
						<div className="absolute inset-0 bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-2xl shadow-xl overflow-hidden border border-black/5">
							{tools.map((tool, idx) => (
								<motion.img
									key={idx}
									src={tool.image}
									alt={tool.name}
									initial={{opacity: 0}}
									animate={{opacity: activeTool === idx ? 1 : 0}}
									transition={{duration: 0.5, ease: "easeInOut"}}
									className="absolute inset-0 w-full h-full object-cover"
								/>
							))}
						</div>
					</div>

					{/* All Buttons - Mobile Grid */}
					<div className="grid grid-cols-2 gap-2 w-full max-w-[400px]">
						{[...leftButtons, ...rightButtons].map((tool) => (
							<motion.button
								key={tool.index}
								onClick={() => setActiveTool(tool.index)}
								initial={{opacity: 0, scale: 0.9}}
								whileInView={{opacity: 1, scale: 1}}
								viewport={{once: true}}
								className={`
									px-4 py-2 rounded-full shadow-sm border text-sm font-medium
									whitespace-nowrap transition-all duration-200
									${activeTool === tool.index ? "bg-[#D4FF00] border-[#D4FF00] text-black" : "bg-white/90 backdrop-blur-sm border-black/10 text-black/70"}
								`}>
								{tool.name}
							</motion.button>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
