"use client";

import {useClerk, useUser} from "@clerk/nextjs";
import {LogOut, Settings, ChevronDown} from "lucide-react";
import {useState, useRef, useEffect} from "react";
import {useWorkflowStore} from "@/store/workflowStore";
import {useRouter} from "next/navigation";
import {cn} from "@/lib/utils";

interface UserMenuProps {
	isCollapsed?: boolean;
}

export default function UserMenu({isCollapsed}: UserMenuProps) {
	const {user} = useUser();
	const {signOut} = useClerk();
	const router = useRouter();
	const clearUserData = useWorkflowStore((state) => state.clearUserData);

	const [isOpen, setIsOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	const handleSignOut = async () => {
		// Clear user workflow data
		clearUserData();

		// Sign out from Clerk
		await signOut();

		// Redirect to home page
		router.push("/sign-in");
	};

	if (!user) {
		return (
			<div className="flex items-center justify-center py-4">
				<div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
			</div>
		);
	}

	// Get user initials
	const getInitials = () => {
		if (user.firstName) return user.firstName[0].toUpperCase();
		if (user.username) return user.username[0].toUpperCase();
		if (user.primaryEmailAddress?.emailAddress) {
			return user.primaryEmailAddress.emailAddress[0].toUpperCase();
		}
		return "U";
	};

	// Get display name
	const getDisplayName = () => {
		if (user.firstName && user.lastName) {
			return `${user.firstName} ${user.lastName}`;
		}
		if (user.firstName) return user.firstName;
		if (user.username) return user.username;
		return "User";
	};

	return (
		<div className="relative" ref={menuRef}>
			{/* User Button */}
			{!isCollapsed ? (
				<button
					onClick={() => setIsOpen(!isOpen)}
					className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group">
					<div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
						{getInitials()}
					</div>
					<span className="font-semibold text-sm text-white truncate flex-1 text-left">{getDisplayName()}</span>
					<ChevronDown size={14} className={cn("text-white/50 transition-transform", isOpen && "rotate-180")} />
				</button>
			) : (
				<button onClick={() => setIsOpen(!isOpen)} className="flex justify-center py-2 hover:opacity-80 transition-opacity">
					<div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
						{getInitials()}
					</div>
				</button>
			)}

			{/* Dropdown Menu - Now appears BELOW the button */}
			{isOpen && (
				<div
					className={cn(
						"absolute top-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50",
						isCollapsed ? "left-0 min-w-[200px]" : "left-0 right-0"
					)}>
					{/* User Info Header */}
					<div className="px-4 py-3 border-b border-white/10">
						<p className="text-sm font-medium text-white/90 truncate">{getDisplayName()}</p>
						<p className="text-xs text-white/50 mt-0.5 truncate">{user.primaryEmailAddress?.emailAddress}</p>
					</div>

					{/* Menu Items */}
					<div className="py-2">
						{/* Settings */}
						<button
							onClick={() => {
								router.push("/settings");
								setIsOpen(false);
							}}
							className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-left">
							<Settings className="w-4 h-4 text-white/70" />
							<span className="text-sm text-white/90">Settings</span>
						</button>

						{/* Sign Out */}
						<button
							onClick={handleSignOut}
							className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-500/10 transition-colors text-left group">
							<LogOut className="w-4 h-4 text-red-400" />
							<span className="text-sm text-red-400 group-hover:text-red-300">Sign out</span>
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
