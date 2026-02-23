import React from "react";
import {Type, Image as ImageIcon, Hash, ChevronDown} from "lucide-react";

const EditorSection = () => {
	return (
		<section className="relative w-full py-12 md:py-24 overflow-hidden bg-[#FBFBFB]">
			{/* --- BACKGROUND GRID LAYER --- */}
			{/* Positioned absolutely to cover only this section, pushed behind content */}
			<div className="absolute inset-0 z-0 pointer-events-none">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
						backgroundSize: "40px 40px",
					}}
				/>
				{/* Vignette/Fade effect */}
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(251,251,251,0.8)_100%)]" />
			</div>

			{/* --- CONTENT LAYER --- */}
			<div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col items-center">
				{/* Header */}
				<div className="text-center mb-8 md:mb-16 max-w-3xl">
					<h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-gray-900 mb-4 md:mb-6 leading-tight">
						Control the <br /> Outcome
					</h2>
					<p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto px-4">
						Layers, type, and blends — all the tools to bring your wildest ideas to life. Your creativity, our compositing power.
					</p>
				</div>

				{/* EDITOR INTERFACE - Scaled container for mobile */}
				<div className="w-full max-w-4xl mx-auto">
					<div className="w-full bg-[#1a1a1a] rounded-xl overflow-hidden shadow-2xl border border-gray-800 text-gray-300 font-sans">
						{/* Mobile: Stacked layout, Desktop: Side by side */}
						<div className="flex flex-col md:flex-row h-auto md:h-[650px]">
							{/* Left Sidebar: Layers - Hidden on mobile, shown on md+ */}
							<div className="hidden md:flex w-64 flex-shrink-0 border-r border-gray-800 flex-col bg-[#111111]">
								<div className="p-4 border-b border-gray-800">
									<h3 className="text-white font-medium text-sm">Title sequence</h3>
								</div>
								<div className="p-4">
									<div className="text-xs font-bold text-gray-500 mb-3 tracking-wider">LAYERS</div>
									<div className="space-y-1">
										<LayerItem icon={<Hash size={14} />} label="CANVAS" />
										<LayerItem icon={<ImageIcon size={14} />} label="WALKIE TALKIE" />
										<LayerItem icon={<Type size={14} />} label="TEXT LAYER" active />
										<LayerItem icon={<Type size={14} />} label="TEXT LAYER" />
										<LayerItem icon={<ImageIcon size={14} />} label="ASTRONAUT" />
										<LayerItem icon={<ImageIcon size={14} />} label="SPACESHIP" />
									</div>
								</div>
							</div>

							{/* Mobile Layers Bar - Compact horizontal */}
							<div className="md:hidden flex items-center gap-2 p-3 border-b border-gray-800 bg-[#111111] overflow-x-auto">
								<span className="text-[10px] font-bold text-gray-500 whitespace-nowrap">LAYERS</span>
								<div className="flex gap-1">
									<MobileLayerChip icon={<Hash size={10} />} label="CANVAS" />
									<MobileLayerChip icon={<ImageIcon size={10} />} label="WALKIE" />
									<MobileLayerChip icon={<Type size={10} />} label="TEXT" active />
									<MobileLayerChip icon={<ImageIcon size={10} />} label="ASTRO" />
								</div>
							</div>

							{/* Center Canvas */}
							<div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden aspect-[4/3] md:aspect-auto">
								<div className="relative w-full h-full flex items-center justify-center">
									{/* Placeholder Image */}
									<img
										src="https://images.unsplash.com/photo-1541873676-a18131494184?q=80&w=2518&auto=format&fit=crop"
										alt="Astronaut"
										className="w-full h-full object-cover opacity-80"
									/>

									{/* Selection Overlay */}
									<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-blue-500 p-4 sm:p-6 md:p-8 min-w-[200px] sm:min-w-[280px] md:min-w-[340px] text-center">
										<ResizeHandle position="-top-1 -left-1" />
										<ResizeHandle position="-top-1 -right-1" />
										<ResizeHandle position="-bottom-1 -left-1" />
										<ResizeHandle position="-bottom-1 -right-1" />

										<div className="font-mono text-white text-[10px] sm:text-xs md:text-sm mb-1 sm:mb-2 mix-blend-difference">
											Directed by
										</div>
										<div className="font-mono text-white text-lg sm:text-2xl md:text-3xl font-bold mix-blend-difference tracking-tight">
											Michael Abernathy
										</div>
									</div>
								</div>
							</div>

							{/* Right Sidebar: Properties - Hidden on mobile, shown on md+ */}
							<div className="hidden md:flex w-72 flex-shrink-0 border-l border-gray-800 bg-[#111111] flex-col overflow-y-auto">
								<div className="p-4 border-b border-gray-800 flex items-center gap-2">
									<Type size={16} className="text-white" />
									<h3 className="text-white font-medium text-sm">TEXT LAYER</h3>
								</div>
								<div className="p-5 space-y-6">
									<PropertySection label="DIMENSIONS">
										<div className="grid grid-cols-2 gap-3">
											<InputBox label="W" value="1024" />
											<InputBox label="H" value="1240" />
										</div>
									</PropertySection>

									<PropertySection label="POSITION">
										<div className="grid grid-cols-2 gap-3">
											<InputBox label="X" value="240" />
											<InputBox label="Y" value="724" />
										</div>
									</PropertySection>

									<PropertySection label="ROTATION">
										<InputBox label="↳" value="90" suffix="°" />
									</PropertySection>

									<div className="grid grid-cols-2 gap-3">
										<PropertySection label="OPACITY">
											<div className="bg-[#1a1a1a] rounded p-2 border border-gray-700">
												<span className="text-sm text-gray-300 font-mono">100%</span>
											</div>
										</PropertySection>
										<PropertySection label="BLEND MODE">
											<Dropdown value="NORMAL" />
										</PropertySection>
									</div>

									<div className="h-px bg-gray-800 w-full my-2"></div>

									<PropertySection label="FONT">
										<Dropdown value="JETBRAINS MONO" />
									</PropertySection>

									<div className="grid grid-cols-2 gap-3">
										<PropertySection label="STYLE">
											<Dropdown value="MEDIUM" />
										</PropertySection>
										<PropertySection label="SIZE">
											<div className="bg-[#1a1a1a] rounded p-2 border border-gray-700">
												<span className="text-sm text-gray-300 font-mono">12</span>
											</div>
										</PropertySection>
									</div>

									<PropertySection label="FILL">
										<div className="bg-[#1a1a1a] rounded p-2 border border-gray-700 flex items-center gap-3">
											<div className="w-4 h-4 rounded bg-white border border-gray-500"></div>
											<span className="text-sm text-gray-300 font-mono uppercase">#FFFFFF</span>
										</div>
									</PropertySection>
								</div>
							</div>

							{/* Mobile Properties Bar - Compact grid */}
							<div className="md:hidden p-3 border-t border-gray-800 bg-[#111111]">
								<div className="flex items-center gap-2 mb-3">
									<Type size={12} className="text-white" />
									<span className="text-white font-medium text-[10px]">TEXT LAYER</span>
								</div>
								<div className="grid grid-cols-4 gap-2 text-[9px]">
									<MobilePropertyBox label="W" value="1024" />
									<MobilePropertyBox label="H" value="1240" />
									<MobilePropertyBox label="X" value="240" />
									<MobilePropertyBox label="Y" value="724" />
								</div>
								<div className="grid grid-cols-3 gap-2 mt-2 text-[9px]">
									<MobilePropertyBox label="ROT" value="90°" />
									<MobilePropertyBox label="OPACITY" value="100%" />
									<MobilePropertyBox label="BLEND" value="NORMAL" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

// --- Subcomponents for cleaner code ---

const LayerItem = ({icon, label, active = false}: {icon: React.ReactNode; label: string; active?: boolean}) => (
	<div
		className={`flex items-center gap-3 px-3 py-2 text-sm rounded cursor-pointer transition-colors ${
			active ? "bg-white/10 text-white" : "hover:bg-white/5 text-gray-400"
		}`}>
		<span className={active ? "text-white" : "text-gray-500"}>{icon}</span>
		<span>{label}</span>
	</div>
);

const MobileLayerChip = ({icon, label, active = false}: {icon: React.ReactNode; label: string; active?: boolean}) => (
	<div className={`flex items-center gap-1 px-2 py-1 text-[9px] rounded whitespace-nowrap ${active ? "bg-white/10 text-white" : "text-gray-400"}`}>
		<span className={active ? "text-white" : "text-gray-500"}>{icon}</span>
		<span>{label}</span>
	</div>
);

const ResizeHandle = ({position}: {position: string}) => <div className={`absolute ${position} w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500`}></div>;

const PropertySection = ({label, children}: {label: string; children: React.ReactNode}) => (
	<div className="space-y-2">
		<label className="text-[10px] text-gray-500 font-bold tracking-widest">{label}</label>
		{children}
	</div>
);

const InputBox = ({label, value, suffix}: {label: string; value: string; suffix?: string}) => (
	<div className="bg-[#1a1a1a] rounded p-2 flex items-center justify-between border border-gray-700">
		<span className="text-xs text-gray-500">{label}</span>
		<div className="flex items-center gap-1">
			<span className="text-sm text-gray-300 font-mono">{value}</span>
			{suffix && <span className="text-xs text-gray-500">{suffix}</span>}
		</div>
	</div>
);

const MobilePropertyBox = ({label, value}: {label: string; value: string}) => (
	<div className="bg-[#1a1a1a] rounded p-1.5 border border-gray-700 text-center">
		<div className="text-[8px] text-gray-500 mb-0.5">{label}</div>
		<div className="text-gray-300 font-mono">{value}</div>
	</div>
);

const Dropdown = ({value}: {value: string}) => (
	<div className="bg-[#1a1a1a] rounded p-2 border border-gray-700 flex justify-between items-center cursor-pointer hover:border-gray-600 transition-colors">
		<span className="text-xs text-gray-300 uppercase truncate pr-2">{value}</span>
		<ChevronDown size={12} className="text-gray-500" />
	</div>
);

export default EditorSection;
