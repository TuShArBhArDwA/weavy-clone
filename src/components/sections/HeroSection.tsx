'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ImageNode, TextNode, VideoNode } from './HeroNodes';
import { NODES_DESKTOP, EDGES, EXTENT_DESKTOP, NODES_MOBILE, EXTENT_MOBILE } from './data';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const nodeTypes = {
  imageNode: ImageNode,
  textNode: TextNode,
  videoNode: VideoNode,
};

// Hero section with interactive React Flow diagram
const HeroSection = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const nodesData = useMemo(() => isMobile ? NODES_MOBILE : NODES_DESKTOP, [isMobile]);
  const bounds = useMemo(() => isMobile ? EXTENT_MOBILE : EXTENT_DESKTOP, [isMobile]);

  const [nodes, , onNodesChange] = useNodesState(nodesData);

  const styledEdges = useMemo(() => {
    // 2. Explicitly type the 'edge' parameter here
    return EDGES.map((edge: Edge) => ({
      ...edge,
      style: {
        stroke: '#4a7c7c',
        strokeWidth: 2,
        opacity: 0.6,
      },
    }));
  }, []);

  const [edges, setEdges, onEdgesChange] = useEdgesState(styledEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <section
      className="relative w-full min-h-screen overflow-visible z-50"
    >
      <div
        className="absolute inset-0 bg-[#e7f0f8]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(to bottom, transparent 50%, #ffffff 100%)',
        }}
      />
      <div className="absolute mr-2 top-24 md:top-32 left-4 md:left-16 z-10 pointer-events-none select-none max-w-7xl">
        <div className="flex flex-col gap-6 md:gap-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-25">
            <h1 className=" text-6xl lg:text-8xl leading-none tracking-tight text-black font-normal">
              Weaave
            </h1>
            <div className="flex flex-col md:items-start items-end">
              <h2 className="text-6xl lg:text-8xl leading-none tracking-tight text-black font-normal pl-10">
                Artistic Intelligence
              </h2>
            </div>
          </div>

          <div className="md:pl-80  ">
            <p className="max-w-md md:max-w-lg text-base tracking-wide md:text-lg text-black/90 pl-24 font-light leading-none">
              Turn your creative vision into scalable workflows. Access all AI models and professional editing tools in one node based platform.
            </p>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 md:bottom-[-30px] left-0 md:left-[5%] w-full md:w-[90%] h-[60%] h-[calc(20%+200px)] md:h-[calc(50%+100px)] rounded-b-lg z-1 overflow-hidden bg-gradient-to-b from-transparent to-[#D0D9D2] to-92%"
      >
        <div className="w-full h-full overflow-hidden">
          <ReactFlow
            key={isMobile ? 'mobile' : 'desktop'}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: isMobile ? 0.1 : 0.2 }}
            zoomOnScroll={false}
            panOnScroll={false}
            panOnDrag={true}
            selectionOnDrag={false}
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
            className="bg-transparent"
            nodeExtent={bounds}
            translateExtent={bounds}
            minZoom={isMobile ? 0.3 : 0.5}
            maxZoom={isMobile ? 0.8 : 1.5}
            preventScrolling={false}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;