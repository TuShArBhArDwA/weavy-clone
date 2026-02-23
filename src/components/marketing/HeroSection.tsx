import HeroWorkflow from "@/components/marketing/HeroWorkflow";
import MobileHeroCards from "@/components/marketing/MobileHeroCards";

export default function HeroSection() {
	return (
		<section className="relative w-full bg-gradient-to-b from-[#DDE1E3] to-[##dce3e9]">
			{/* Background Grid Pattern */}
			<div
				className="absolute inset-0"
				style={{
					backgroundSize: "20px 20px",
					backgroundImage: `
            linear-gradient(to right, hsl(0 0% 90%) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(0 0% 90%) 1px, transparent 1px)
          `,
				}}
				aria-hidden="true"
			/>

			{/* Top gradient fade */}
			<div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#DDE1E3] to-transparent z-[1]" aria-hidden="true" />

			{/* Content Container */}
			<div className="relative z-10 pt-20 md:pt-32 px-4 md:px-12 lg:px-20">
				{/* Typography Section - Mobile: stacked, Desktop: side by side */}
				<div className="max-w-[1400px] mx-auto mb-6 md:mb-8">
					<div className="flex flex-col md:flex-row md:items-start md:gap-16 lg:gap-24">
						{/* Left: Brand Name */}
						<div className="shrink-0">
							<h1 className="text-[clamp(3rem,15vw,8rem)] font-normal leading-[0.9] tracking-tight text-foreground">Weaave</h1>
						</div>

						{/* Right: Tagline + Description */}
						<div className="mt-6 md:mt-2">
							<h2 className="text-[clamp(2.5rem,10vw,5rem)] font-normal leading-none tracking-tight text-foreground mb-4 text-center md:text-left">
								Artistic
								<br className="md:hidden" /> Intelligence
							</h2>
							<p className="text-sm md:text-base leading-relaxed max-w-md text-muted-foreground">
								Turn your creative vision into scalable workflows. Access all AI models and professional editing tools in one node based
								platform.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* --- INTERACTIVE WORKFLOW CONTAINER --- */}
			<div className="relative w-full overflow-visible z-10">
				{/* Desktop: ReactFlow canvas */}
				<div className="hidden md:block">
					<div className="relative mx-4 md:mx-8 lg:mx-16 p-0 rounded-b-[40px] overflow-visible bg-gradient-to-b from-[#dce3e9] to-[#c9d8cc] -mb-10">
						<div
							className="absolute inset-0 pointer-events-none"
							style={{
								background: "radial-gradient(ellipse, hsla(0, 0%, 100%, 0.4) 0%, transparent 60%)",
							}}
							aria-hidden="true"
						/>
						<div className="relative h-[650px] w-full">
							<HeroWorkflow />
						</div>
					</div>
				</div>

				{/* Mobile: Vertical card layout */}
				<div className="md:hidden rounded-b-[40px] ">
					<MobileHeroCards />
				</div>
			</div>
		</section>
	);
}
