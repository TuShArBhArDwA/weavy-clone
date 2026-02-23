"use client";

import AIMode from "@/components/sections/AIMode";
import Footer from "@/components/sections/Footer";
import HeroSection from "@/components/sections/HeroSection";
import ModelsShowcase from "@/components/sections/ModelsShowcase";
import ParallaxShowcase from "@/components/sections/ParallaxShowcase";
import ToolsGallery from "@/components/sections/ToolsGallery";
import WorkflowsCarousel from "@/components/sections/WorkflowsCarousel";
import { useEffect } from "react";
import Lenis from "lenis";

export default function LandingPage() {
	useEffect(() => {
		const lenis = new Lenis();

		function raf(time: number) {
			lenis.raf(time);
			requestAnimationFrame(raf);
		}

		requestAnimationFrame(raf);
	}, []);

	return (
		<div className="font-sans bg-background min-h-screen">
			{/* Header is likely in layout or we can add it here if needed, but keeping it clean for now */}
			<HeroSection />
			<ModelsShowcase />
			<ToolsGallery />
			<ParallaxShowcase />
			<AIMode />
			<WorkflowsCarousel />
			<Footer />
		</div>
	);
}
