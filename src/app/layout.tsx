import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {ClerkProvider} from "@clerk/nextjs";
import {AuthProvider} from "@/components/providers/AuthProvider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

// Removed invalid GeistSans import and usage

export const metadata: Metadata = {
	title: "Weaave",
	description: "Build, connect, and deploy AI workflows visually",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider>
			<html lang="en">
				<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
					<AuthProvider>{children}</AuthProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
