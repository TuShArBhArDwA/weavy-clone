import { Linkedin, Instagram, Youtube, Github, Coffee } from "lucide-react";

// X (Twitter) icon
const XIcon = () => (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
		<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
	</svg>
);

// Discord icon
const DiscordIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
		<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
	</svg>
);

// Medium Icon
const MediumIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
		<path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
	</svg>
);

// Weaave Logo
const WeaaveLogo = () => (
	<svg width="80" height="20" viewBox="0 0 130 32" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M16.4 0H9.8L6.6 12.3L3.4 0H0L5 19.2H8.2L11.4 6.9L14.6 19.2H17.8L22.8 0H19.4L16.4 12.3L16.4 0Z" fill="currentColor" />
		<path d="M33.2 19.2H43.6V16.4H36.6V11.1H42.8V8.3H36.6V2.8H43.6V0H33.2V19.2Z" fill="currentColor" />
		<path d="M58.8 19.2L57.2 15.4H50.6L49 19.2H45.4L52.2 0H55.6L62.4 19.2H58.8ZM53.9 7.6L51.8 12.7H56.1L53.9 7.6Z" fill="currentColor" />
		<path d="M68.2 19.2L73.8 0H70.2L64.6 19.2H68.2Z" fill="currentColor" />
		<path d="M81.4 11.6L87.4 0H83.6L77.6 11.6L81.4 11.6Z" fill="currentColor" />
		<path d="M92.4 0L86.4 11.6L82.6 19.2H86.2L96.2 0H92.4Z" fill="currentColor" />
	</svg>
);

// W Logo icon
const WLogoIcon = () => (
	<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M8 6L12 26H14L16 14L18 26H20L24 6H22L19 22L17 10H15L13 22L10 6H8Z" fill="currentColor" />
	</svg>
);

const Footer = () => {
	const socialLinks = [
		{ icon: Github, href: "https://github.com/TuShArBhArDwA" },
		{ icon: Linkedin, href: "https://www.linkedin.com/in/bhardwajtushar2004/" },
		{ icon: Coffee, href: "https://buymeacoffee.com/tusharbhardwaj" }, // Buy Me A Coffee
		{ icon: Youtube, href: "https://www.youtube.com/channel/UCqq8kNn9yKvsl95MeiFPIeg" },
		{ icon: MediumIcon, href: "https://medium.com/@bhardwajtushar2004", isCustom: true },
		{ icon: XIcon, href: "https://x.com/Tusharab2004", isCustom: true },
	];

	const footerLinks = {
		getStarted: [
			{ label: "REQUEST A DEMO", href: "#" },
			{ label: "PRICING", href: "#" },
			{ label: "ENTERPRISE", href: "#" },
		],
		company: [
			{ label: "ABOUT", href: "#" },
			{ label: "CAREERS", href: "#" },
			{ label: "TRUST", href: "#" },
			{ label: "TERMS", href: "#" },
			{ label: "PRIVACY", href: "#" },
		],
		connect: [{ label: "COLLECTIVE", href: "#" }],
		resources: [{ label: "KNOWLEDGE CENTER", href: "#" }],
	};

	return (
		<footer className="bg-[#111111] pt-16 md:pt-24 overflow-hidden relative z-10">
			{/* Main sage-colored container */}
			<div className="bg-[#A8B3A4] rounded-tr-[60px] md:rounded-tr-[100px] px-6 md:px-16 lg:px-24 pt-20 md:pt-28 pb-8 text-white relative">
				{/* Content wrapper */}
				<div className="max-w-[1400px] mx-auto w-full">
					{/* Headline Section */}
					<div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 mb-28 md:mb-40">
						<h2 className="text-[clamp(3rem,8vw,5.5rem)] font-normal leading-[0.95] tracking-[-0.02em] text-white">
							Artificial
							<br />
							Intelligence
						</h2>
						<span className="text-[clamp(2rem,5vw,4rem)] font-extralight text-white/70 hidden md:block">+</span>
						<h2 className="text-[clamp(3rem,8vw,5.5rem)] font-normal leading-[0.95] tracking-[-0.02em] text-white">
							Human
							<br />
							Creativity
						</h2>
					</div>

					{/* Logo & Description Row */}
					<div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-16 mb-14 pb-14 border-b border-white/20">
						{/* Logo Lockup */}
						<div className="flex items-center gap-4 shrink-0">
							<WLogoIcon />
							<WeaaveLogo />
							<div className="h-8 w-px bg-white/40 mx-2" />
							<span className="text-[10px] font-semibold tracking-[0.2em] leading-tight uppercase text-white/90">
								ARTISTIC
								<br />
								INTELLIGENCE
							</span>
						</div>

						{/* Description */}
						<p className="text-sm leading-relaxed max-w-md text-white/80">
							Weaave is a new way to create. We&apos;re bridging the gap between AI capabilities and human creativity, to continue the tradition of
							craft in artistic expression. We call it Artistic Intelligence.
						</p>
					</div>

					{/* Links Grid */}
					<div className="flex flex-col gap-6 mb-16">
						{/* Social Icons (Moved here as main focus since links are removed) */}
						<div className="flex gap-5 items-start justify-start">
							{socialLinks.map((social, i) => (
								<a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">
									{social.isCustom ? <social.icon /> : <social.icon size={16} strokeWidth={2} />}
								</a>
							))}
						</div>
					</div>

					{/* Horizontal line before SOC section */}
					<div className="w-40 h-px bg-white/30 mb-10" />

					{/* SOC Badge & Copyright */}
					<div className="flex flex-col gap-4">
						{/* SOC Badge */}
						<div className="flex items-center gap-3">
							<div className="w-9 h-9 rounded-md bg-white/10 flex items-center justify-center shrink-0">
								<span className="text-[8px] font-bold text-white leading-none">
									AICPA
									<br />
									SOC
								</span>
							</div>
							<div className="text-xs leading-tight">
								<p className="font-semibold text-[#111]">SOC 2 Type II Certified</p>
								<p className="text-[#111]/60 text-[11px]">Your data is protected with industry-standard security controls.</p>
							</div>
						</div>

						{/* Footer Credits */}
						<div className="flex items-center gap-2 mt-4 text-[12px] font-medium tracking-[0.05em] text-[#111]/70">
							<span>Fuel the creativity</span>
							<a
								href="https://buymeacoffee.com/tusharbhardwaj"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1 hover:text-[#111] transition-colors border-b border-black/20 hover:border-black/50"
							>
								<Coffee size={14} />
								<span>Buy Me A Coffee</span>
							</a>
						</div>
					</div>
				</div>

				{/* Decorative curve */}
				<div className="absolute bottom-24 right-0 w-48 h-48 md:w-72 md:h-72 pointer-events-none hidden lg:block">
					<svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
						<path d="M200 0 C200 110, 110 200, 0 200" stroke="white" strokeWidth="1" fill="none" opacity="0.4" />
					</svg>
				</div>

				{/* Start Now Button */}
				<div className="absolute bottom-0 right-0 z-20">
					<button className="bg-accent text-accent-foreground text-3xl md:text-5xl lg:text-6xl font-normal px-10 md:px-16 py-6 md:py-8 rounded-tl-[40px] md:rounded-tl-[60px] hover:brightness-110 transition-all leading-none">
						Start Now
					</button>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
