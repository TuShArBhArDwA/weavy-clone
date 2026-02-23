"use client";

import React, {useState} from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {cn} from "@/lib/utils";
import type {SidebarProps} from "@/lib/types";

const Sidebar = ({children, defaultCollapsed = false}: SidebarProps) => {
	const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

	return (
		<aside className={cn("bg-[#111111] border-r border-white/10 transition-all duration-300 relative flex flex-col z-20", isCollapsed ? "w-16" : "w-64")}>
			{/* Toggle Button */}
			<button
				onClick={() => setIsCollapsed(!isCollapsed)}
				className="absolute -right-3 top-6 bg-[#1a1a1a] border border-white/10 rounded-full p-1 text-white/60 hover:text-white z-50">
				{isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
			</button>

			{/* Content passed as children */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{React.Children.map(children, (child) => {
					if (React.isValidElement(child)) {
						return React.cloneElement(child as React.ReactElement<{isCollapsed?: boolean}>, {isCollapsed});
					}
					return child;
				})}
			</div>
		</aside>
	);
};

export default Sidebar;
