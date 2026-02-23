"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Search, Clock, Trash2, ChevronRight } from "lucide-react";
import { getAllWorkflowsAction, deleteWorkflowAction, saveWorkflowAction } from "@/app/actions/workflowActions";
import { DEMO_WORKFLOWS } from "@/lib/demoWorkflows";
import Sidebar from "@/components/workflow/Sidebar";
import SidebarNavigation from "@/components/workflow/SidebarNavigation";
import type { Workflow } from "@/lib/types";
import { useUser } from "@clerk/nextjs";

import { PRODUCT_MARKETING_KIT_WORKFLOW } from "@/lib/sampleWorkflowData";

export default function DashboardPage() {
    const router = useRouter();
    const { user } = useUser();
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function fetchWorkflows() {
            try {
                const result = await getAllWorkflowsAction();
                if (result.success) {
                    setWorkflows(result.workflows as Workflow[]);
                } else {
                    console.error("Failed to fetch workflows:", result.error);
                }
            } catch (error) {
                console.error("Error fetching workflows:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchWorkflows();
    }, []);

    const handleCreateNew = async () => {
        setCreating(true);
        try {
            const result = await saveWorkflowAction({
                name: "Untitled Workflow",
                nodes: [],
                edges: [],
            });
            if (result.success && result.id) {
                router.push(`/workflows/${result.id}`);
            } else {
                alert(`Failed to create workflow: ${result.error}`);
                setCreating(false);
            }
        } catch (error) {
            console.error("Error creating workflow:", error);
            alert("Something went wrong.");
            setCreating(false);
        }
    };

    const handleCreateSample = async () => {
        setCreating(true);
        try {
            const result = await saveWorkflowAction({
                name: "Product Marketing Kit (Sample)",
                nodes: PRODUCT_MARKETING_KIT_WORKFLOW.nodes,
                edges: PRODUCT_MARKETING_KIT_WORKFLOW.edges,
            });
            if (result.success && result.id) {
                router.push(`/workflows/${result.id}`);
            } else {
                alert(`Failed to create sample: ${result.error}`);
                setCreating(false);
            }
        } catch (error) {
            console.error("Error creating sample:", error);
            alert("Something went wrong.");
            setCreating(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm("Are you sure you want to delete this workflow?")) return;

        const res = await deleteWorkflowAction(id);
        if (res.success) {
            setWorkflows(workflows.filter((wf) => wf.id !== id));
        } else {
            alert(`Failed to delete: ${res.error}`);
        }
    };

    // Filter workflows by search
    const filteredWorkflows = workflows.filter((wf) => wf.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Format relative time
    const getRelativeTime = (date: string) => {
        const now = new Date();
        const past = new Date(date);
        const diffMs = now.getTime() - past.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return past.toLocaleDateString();
    };

    // Get user display name for header
    const getUserDisplayName = () => {
        if (!user) return "Your";
        // Check fullName first (from OAuth providers like Google)
        if (user.fullName) return `${user.fullName}'s`;
        if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}'s`;
        if (user.firstName) return `${user.firstName}'s`;
        if (user.username) return `${user.username}'s`;
        return "Your";
    };

    return (
        <div className="flex h-screen w-full bg-[#0a0a0a] text-white font-sans">
            {/* --- SIDEBAR --- */}
            <Sidebar>
                <SidebarNavigation onCreateNew={handleCreateNew} creating={creating} />
            </Sidebar>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-14 border-b border-white/5 flex items-center justify-between px-8">
                    <h1 className="text-sm font-semibold text-white/80">{getUserDisplayName()} Workspace</h1>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCreateSample}
                            disabled={creating}
                            className="flex items-center gap-2 border border-white/20 text-white/70 px-4 py-1.5 rounded-lg font-medium text-xs hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                            {creating ? "Creating..." : "Create Sample Kit"}
                        </button>
                        <button
                            onClick={handleCreateNew}
                            disabled={creating}
                            className="flex items-center gap-2 border border-[#dfff4f] text-[#dfff4f] px-4 py-1.5 rounded-lg font-bold text-xs hover:bg-[#dfff4f] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                            {creating ? "Creating..." : "Create New File"}
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    {/* --- WORKFLOW LIBRARY SECTION --- */}
                    <section className="mb-10">
                        <div className="flex items-center gap-6 mb-6 border-b border-white/5">
                            <button className="pb-3 text-sm font-medium text-white border-b-2 border-white/60">
                                Workflow library
                            </button>
                            <button className="pb-3 text-sm font-medium text-white/40 hover:text-white/60 transition-colors">
                                Tutorials
                            </button>
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                            {DEMO_WORKFLOWS.map((demo) => (
                                <Link
                                    key={demo.id}
                                    href={`/workflows/${demo.id}`}
                                    className="group relative min-w-[200px] md:min-w-[240px] aspect-[16/10] rounded-xl overflow-hidden border border-white/5 bg-[#111] transition-all hover:border-white/20"
                                >
                                    {/* Image Background */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

                                    <div className="absolute inset-0 bg-[#1a1a1a]">
                                        {(demo as any).image ? (
                                            <img
                                                src={(demo as any).image}
                                                alt={demo.name}
                                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                                                <div className="text-4xl">{demo.thumbnail}</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Overlay */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 z-20 bg-gradient-to-t from-black/90 to-transparent">
                                        <h3 className="text-sm font-bold text-white mb-0.5 group-hover:text-[#F7FFA8] transition-colors">
                                            {demo.name}
                                        </h3>
                                        <p className="text-[11px] text-white/50 line-clamp-1">
                                            {demo.description}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* --- MY FILES --- */}
                    <section className="overflow-hidden">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-semibold">My files</h2>

                            {/* Search Bar */}
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                <input
                                    type="text"
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors w-48"
                                />
                            </div>
                        </div>

                        {/* Files Grid */}
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <Loader2 className="animate-spin text-white/30" size={32} />
                            </div>
                        ) : filteredWorkflows.length === 0 ? (
                            <div className="text-center p-12 border border-dashed border-white/10 rounded-xl">
                                <p className="text-white/50">{searchQuery ? "No workflows found." : "No files yet. Create one to get started!"}</p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {filteredWorkflows.map((wf) => (
                                    <Link
                                        key={wf.id}
                                        href={`/workflows/${wf.id}`}
                                        className="group rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition-all w-[200px]">
                                        <div>
                                            {/* Thumbnail Section - Fixed height */}
                                            <div className="h-32 bg-[#1a1a1a] flex items-center justify-center">
                                                {/* Workflow Icon */}
                                                <div className="text-white/20 group-hover:text-white/30 transition-colors">
                                                    <WorkflowIcon size={40} />
                                                </div>
                                            </div>

                                            <div className="flex justify-between mx-4 my-4">
                                                {/* Info Section */}
                                                <div className="">
                                                    <h3 className="font-medium text-xs text-white truncate mb-0.5">{wf.name}</h3>
                                                    <p className="text-[9px] text-white/40 flex items-center gap-1">
                                                        <Clock size={8} />
                                                        Last edited {getRelativeTime(wf.updated_at)}
                                                    </p>
                                                </div>
                                                {/* Delete Button */}
                                                <button
                                                    onClick={(e) => handleDelete(wf.id, e)}
                                                    className="p-1 rounded-md bg-black/50 backdrop-blur-sm hover:bg-red-500/90 text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Delete workflow">
                                                    <Trash2 size={11} />
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}

// Workflow Icon
function WorkflowIcon({ size }: { size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size || 24}
            height={size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round">
            <rect x="3" y="3" width="6" height="6" rx="1" />
            <rect x="15" y="3" width="6" height="6" rx="1" />
            <rect x="9" y="15" width="6" height="6" rx="1" />
            <path d="M6 9v3a1 1 0 0 0 1 1h4" />
            <path d="M18 9v3a1 1 0 0 1-1 1h-4" />
            <path d="M12 13v2" />
        </svg>
    );
}
