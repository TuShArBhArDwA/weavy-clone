"use client";

import {useEffect} from "react";
import Lenis from "lenis";

export default function SmoothScroll({children}: {children: React.ReactNode}) {
	useEffect(() => {
		// Initialize Lenis
		const lenis = new Lenis({
			duration: 1.2, // The "smoothness" intensity
			easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing curve
			orientation: "vertical",
			gestureOrientation: "vertical",
			smoothWheel: true,
			touchMultiplier: 2,
		});

		// Synchronize Lenis scroll with the browser's refresh rate
		function raf(time: number) {
			lenis.raf(time);
			requestAnimationFrame(raf);
		}

		requestAnimationFrame(raf);

		// Cleanup on unmount
		return () => {
			lenis.destroy();
		};
	}, []);

	return <>{children}</>;
}
