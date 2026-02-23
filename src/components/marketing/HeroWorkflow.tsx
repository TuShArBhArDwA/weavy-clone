import {ReactFlow, useNodesState, useEdgesState, Handle, Position, BaseEdge, EdgeProps, getBezierPath, Node} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type {HeroNode, HeroNodeData} from "@/lib/types";

// --- 1. CUSTOM NODE ---
const MarketingCardNode = ({data}: {data: HeroNodeData}) => {
	const width = data.width || "w-64";
	const height = data.height || "aspect-[4/5]";

	return (
		<div className={`${width} flex flex-col gap-2`}>
			{/* Label */}
			{data.label && (
				<div className="flex items-center gap-3 text-[10px] font-medium tracking-[0.15em] uppercase text-foreground/70">
					<span>{data.type}</span>
					<span className="text-foreground">{data.label}</span>
				</div>
			)}
			{data.type && !data.label && <div className="text-[10px] font-medium tracking-[0.15em] uppercase text-foreground/70">{data.type}</div>}

			{/* Node Content */}
			<div className={`${height} w-full rounded-lg overflow-hidden bg-muted/50 relative`}>
				{data.image ? (
					<img src={data.image} alt={data.label || "workflow node"} className="w-full h-full object-cover" />
				) : data.text ? (
					<div className="p-4 h-full flex items-start bg-card border border-border rounded-lg">
						<p className="text-[11px] leading-relaxed text-foreground/80">{data.text}</p>
					</div>
				) : (
					<div className={`w-full h-full ${data.gradientClass || "bg-gradient-to-r from-blue-900 via-purple-800 to-orange-300"}`} />
				)}
			</div>

			{/* Connection Handles */}
			<Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-foreground/30 !border-0" />
			<Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-foreground/30 !border-0" />
		</div>
	);
};

// --- 2. CUSTOM EDGE ---
const CustomEdge = ({id, sourceX, sourceY, targetX, targetY}: EdgeProps) => {
	const [edgePath] = getBezierPath({
		sourceX,
		sourceY,
		targetX,
		targetY,
		curvature: 0.4,
	});
	return (
		<BaseEdge
			id={id}
			path={edgePath}
			style={{
				stroke: "#fff", // Use a solid, visible color
				strokeWidth: 1.5, // Make the edge thicker
				opacity: 1, // Increase opacity for visibility
			}}
		/>
	);
};

const nodeTypes = {marketingCard: MarketingCardNode};
const edgeTypes = {custom: CustomEdge};

// --- 3. NODE LAYOUT ---
const initialNodes: HeroNode[] = [
	// --- COLUMN 1 (Left) ---
	{
		id: "1",
		type: "marketingCard",
		position: {x: 50, y: 80},
		data: {
			type: "3D",
			label: "Rodin 2.0",
			image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681cd65ba87c69df161752e5_3d_card.avif",
			width: "w-[180px]",
			height: "aspect-square",
		},
	},
	{
		id: "2",
		type: "marketingCard",
		position: {x: 50, y: 380},
		data: {
			type: "Color Reference",
			label: "",
			gradientClass: "bg-gradient-to-r from-blue-900 via-purple-800 to-orange-300",
			width: "w-[220px]",
			height: "h-[100px]",
		},
	},

	// --- COLUMN 2 (Main Center Image) ---
	{
		id: "3",
		type: "marketingCard",
		position: {x: 380, y: 120},
		data: {
			type: "Image",
			label: "Stable Diffusion",
			image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681cd7cbc22419b32bb9d8d8_hcard%20-%20STABLE%20DIFFUSION.avif",
			width: "w-[280px]",
			height: "aspect-[3/4]",
		},
	},

	// --- COLUMN 3 (Input & Flux) ---
	{
		id: "4",
		type: "marketingCard",
		position: {x: 780, y: 120},
		data: {
			type: "Text",
			label: "",
			text: "a Great-Tailed Grackle bird is flying from the background and seating on the model's shoulder slowly and barely moves, the model looks at the camera, then bird flies away. cinematic.",
			width: "w-[180px]",
			height: "h-auto",
		},
	},
	{
		id: "5",
		type: "marketingCard",
		position: {x: 780, y: 280},
		data: {
			type: "Image",
			label: "Flux Pro 1.1",
			image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6837510acbe777269734b387_bird_desktop.avif",
			width: "w-[180px]",
			height: "aspect-square",
		},
	},

	// --- COLUMN 4 (Final Output) ---
	{
		id: "6",
		type: "marketingCard",
		position: {x: 1080, y: 80},
		data: {
			type: "Video",
			label: "Minimax Video",
			image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825887e82ac8a8bb8139ebd_GPT%20img%201.avif",
			width: "w-[300px]",
			height: "aspect-[3/4]",
		},
	},
];

const initialEdges = [
	{id: "e1-3", source: "1", target: "3", type: "custom"},
	{id: "e2-3", source: "2", target: "3", type: "custom"},
	{id: "e3-6", source: "3", target: "6", type: "custom"},
	{id: "e4-5", source: "4", target: "5", type: "custom"},
	{id: "e5-6", source: "5", target: "6", type: "custom"},
];

export default function HeroWorkflow() {
	const [nodes, , onNodesChange] = useNodesState(initialNodes);
	const [edges, , onEdgesChange] = useEdgesState(initialEdges);

	return (
		<div className="w-full h-full">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				fitView
				fitViewOptions={{padding: 0.1}}
				panOnDrag={false} // Prevent canvas dragging
				panOnScroll={false} // Prevent canvas dragging with scroll
				zoomOnScroll={false}
				zoomOnPinch={false}
				zoomOnDoubleClick={false}
				preventScrolling={false}
				nodesDraggable={true} // Allow nodes to be dragged
				nodesConnectable={false}
				elementsSelectable={true}
				proOptions={{hideAttribution: true}}
			/>
		</div>
	);
}
