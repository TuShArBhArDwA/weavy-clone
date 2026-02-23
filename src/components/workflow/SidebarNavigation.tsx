"use client";

import React from "react";
import Link from "next/link";
import {Folder, Plus, Users, AppWindow, MessageCircle} from "lucide-react";
import {cn} from "@/lib/utils";
import UserMenu from "./UserMenu";

interface SidebarNavigationProps {
	isCollapsed?: boolean;
	onCreateNew?: () => void;
	creating?: boolean;
}

const SidebarNavigation = ({isCollapsed, onCreateNew, creating = false}: SidebarNavigationProps) => {
	return (
		<>
			{/* User / Workspace */}
			<div className="p-4 border-b border-white/10">
				<UserMenu isCollapsed={isCollapsed} />
			</div>

			{/* Create New Button */}
			{!isCollapsed && (
				<div className="px-4 pt-4">
					<button
						onClick={onCreateNew}
						disabled={creating}
						className="w-full flex items-center justify-center gap-2 bg-[#dfff4f] text-black px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
						{creating ? (
							<>
								<Loader2 size={16} className="animate-spin" />
								Creating...
							</>
						) : (
							<>
								<Plus size={16} />
								Create New File
							</>
						)}
					</button>
				</div>
			)}

			{/* Navigation */}
			<nav className="flex-1 flex flex-col gap-1 p-4">
				{!isCollapsed ? (
					<>
						<Link href="/workflows" className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 text-white font-medium text-sm">
							<div className="flex items-center gap-3">
								<Folder size={16} />
								My Files
							</div>
							<Plus size={14} className="text-white/50 hover:text-white" />
						</Link>
						<Link
							href="#"
							className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:bg-white/5 hover:text-white text-sm transition-colors">
							<Users size={16} />
							Shared with me
						</Link>
						<Link
							href="#"
							className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:bg-white/5 hover:text-white text-sm transition-colors">
							<AppWindow size={16} />
							Apps
						</Link>
					</>
				) : (
					<>
						<Link href="/workflows" className="flex justify-center p-2 rounded-lg bg-white/5 text-white">
							<Folder size={18} />
						</Link>
						<Link href="#" className="flex justify-center p-2 rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition-colors">
							<Users size={18} />
						</Link>
						<Link href="#" className="flex justify-center p-2 rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition-colors">
							<AppWindow size={18} />
						</Link>
					</>
				)}
			</nav>

			{/* Discord Link */}
			<div className="p-4 border-t border-white/10">
				{!isCollapsed ? (
					<Link
						href="#"
						className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:bg-white/5 hover:text-white text-sm transition-colors">
						<MessageCircle size={16} />
						Discord
					</Link>
				) : (
					<Link href="#" className="flex justify-center p-2 rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition-colors">
						<MessageCircle size={18} />
					</Link>
				)}
			</div>
		</>
	);
};

// Helper Components
function Loader2({size, className}: {size?: number; className?: string}) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size || 24}
			height={size || 24}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}>
			<path d="M21 12a9 9 0 1 1-6.219-8.56" />
		</svg>
	);
}

export default SidebarNavigation;
