import Header from "@/components/sections/Header";
import LandingPage from "@/app/(marketing)/page";

export default function Home() {
	return (
		<div className="min-h-screen flex flex-col bg-[#FBFBFB] selection:bg-yellow-200">
			<Header />
			<main className="flex-1">
				<LandingPage />
			</main>
		</div>
	);
}
