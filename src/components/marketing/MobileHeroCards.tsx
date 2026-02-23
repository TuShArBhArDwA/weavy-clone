const cards = [
	{
		id: "color",
		type: "Color Reference",
		label: "",
		gradient: "bg-gradient-to-r from-blue-900 via-purple-800 to-orange-300",
		size: "small",
	},
	{
		id: "3d",
		type: "3D",
		label: "Rodin 2.0",
		image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681cd65ba87c69df161752e5_3d_card.avif",
		size: "medium",
	},
	{
		id: "stable",
		type: "Image",
		label: "Stable Diffusion",
		image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681cd7cbc22419b32bb9d8d8_hcard%20-%20STABLE%20DIFFUSION.avif",
		size: "large",
	},
	{
		id: "flux",
		type: "Image",
		label: "Flux Pro 1.1",
		image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6837510acbe777269734b387_bird_desktop.avif",
		size: "medium",
	},
	{
		id: "minimax",
		type: "Video",
		label: "Minimax Video",
		image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825887e82ac8a8bb8139ebd_GPT%20img%201.avif",
		size: "large",
	},
];

export default function MobileHeroCards() {
	return (
		<div className="relative px-4 pb-8">
			{/* Background container with gradient */}
			<div className="relative rounded-tl-[30px] overflow-hidden pt-6 pb-8 bg-gradient-to-b from-[#DDE1E3] to-[#F6F7F8]">
				{/* Radial gradient overlay */}
				<div
					className="absolute inset-0 pointer-events-none"
					style={{
						background: "radial-gradient(ellipse at top left, hsla(0, 0%, 100%, 0.4) 0%, transparent 60%)",
					}}
					aria-hidden="true"
				/>

				{/* Cards grid - alternating layout */}
				<div className="relative space-y-4 px-4">
					{/* Row 1: Color Reference (left small) */}
					<div className="flex justify-start">
						<div className="w-[45%]">
							<CardItem card={cards[0]} />
						</div>
					</div>

					{/* Row 2: 3D Rodin (right medium) */}
					<div className="flex justify-end">
						<div className="w-[55%]">
							<CardItem card={cards[1]} />
						</div>
					</div>

					{/* Connection line visual */}
					<svg className="absolute top-[15%] left-[40%] w-20 h-24 overflow-visible" aria-hidden="true">
						<path d="M 0 0 Q 40 30, 60 60" fill="none" stroke="hsl(0 0% 0% / 0.15)" strokeWidth="1.5" />
					</svg>

					{/* Row 3: Stable Diffusion (left large) */}
					<div className="flex justify-start">
						<div className="w-[70%]">
							<CardItem card={cards[2]} />
						</div>
					</div>

					{/* Row 4: Flux Pro (right medium) */}
					<div className="flex justify-end">
						<div className="w-[55%]">
							<CardItem card={cards[3]} />
						</div>
					</div>

					{/* Row 5: Minimax Video (left large) */}
					<div className="flex justify-start">
						<div className="w-[75%]">
							<CardItem card={cards[4]} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

interface CardProps {
	card: {
		id: string;
		type: string;
		label: string;
		image?: string;
		gradient?: string;
		size: string;
	};
}

function CardItem({card}: CardProps) {
	const heightClass = card.size === "large" ? "aspect-[3/4]" : card.size === "medium" ? "aspect-square" : "h-20";

	return (
		<div className="flex flex-col gap-1.5">
			{/* Label */}
			<div className="flex items-center gap-2 text-[9px] font-medium tracking-[0.12em] uppercase text-foreground/70">
				<span>{card.type}</span>
				{card.label && <span className="text-foreground font-semibold">{card.label}</span>}
			</div>

			{/* Content */}
			<div className={`${heightClass} w-full rounded-lg overflow-hidden bg-muted/50 relative`}>
				{card.image ? (
					<img src={card.image} alt={card.label || card.type} className="w-full h-full object-cover" />
				) : card.gradient ? (
					<div className={`w-full h-full ${card.gradient}`} />
				) : null}

				{/* Connection dot */}
				<div className="absolute top-1/2 -right-1.5 w-2.5 h-2.5 rounded-full bg-foreground/30 transform -translate-y-1/2" />
				<div className="absolute top-1/2 -left-1.5 w-2.5 h-2.5 rounded-full bg-foreground/30 transform -translate-y-1/2" />
			</div>
		</div>
	);
}
