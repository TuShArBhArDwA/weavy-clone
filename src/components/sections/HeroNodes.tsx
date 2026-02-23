"use client";

import { Position } from "@xyflow/react";
import { NodeHandle } from "./primitives";
import type { ImageNodeData, TextNodeData, VideoNodeData } from "./types";

/**
 * Props interface for image nodes
 */
interface ImageNodeProps {
  data: ImageNodeData;
}

/**
 * Props interface for text nodes
 */
interface TextNodeProps {
  data: TextNodeData;
}

/**
 * Props interface for video nodes
 */
interface VideoNodeProps {
  data: VideoNodeData;
}

/**
 * Image node component for displaying images with labels in React Flow
 *
 * @example
 * ```tsx
 * const node = {
 *   type: 'imageNode',
 *   data: {
 *     label: 'STABLE DIFFUSION',
 *     sublabel: 'IMAGE',
 *     image: 'https://example.com/image.avif',
 *     width: 300,
 *     height: 420,
 *   }
 * };
 * ```
 */
export const ImageNode = ({ data }: ImageNodeProps) => {
  return (
    <div className="group select-none">
      <div className="flex items-center gap-3 mb-2 px-1">
        {data.sublabel && (
          <span
            className="text-[11px] font-light tracking-wider text-black/50 uppercase"
            style={{ fontFamily: "'Helvetica Neue', 'Arial', sans-serif" }}
          >
            {data.sublabel}
          </span>
        )}
        <span
          className="text-[11px] font-normal tracking-wider text-black uppercase"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        >
          {data.label}
        </span>
      </div>
      <div
        className="relative rounded-[16px] overflow-hidden bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-black/10 transition-all duration-300 group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.15)] group-hover:border-black/20"
        style={{ width: data.width, height: data.height }}
      >
        <img
          src={data.image}
          alt={data.label}
          className="w-full h-full object-cover"
          style={{ transform: "scale(1.2)" }}
          draggable={false}
        />
        <NodeHandle type="target" position={Position.Left} />
        <NodeHandle type="source" position={Position.Right} />
      </div>
    </div>
  );
};

/**
 * Text node component for displaying text content in React Flow
 *
 * @example
 * ```tsx
 * const node = {
 *   type: 'textNode',
 *   data: {
 *     label: 'TEXT',
 *     text: 'A description of the content...',
 *     width: 220,
 *   }
 * };
 * ```
 */
export const TextNode = ({ data }: TextNodeProps) => {
  return (
    <div className="group select-none">
      <div className="flex items-center gap-3 mb-2 px-1">
        <span
          className="text-[11px] font-normal tracking-wider text-black uppercase"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        >
          {data.label}
        </span>
      </div>
      <div
        className="relative p-5 rounded-xl bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-black/10 transition-all duration-300 group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.15)] group-hover:border-black/20"
        style={{ width: data.width }}
      >
        <p
          className="text-[12px] leading-[1.7] text-black/70 font-light"
          style={{ fontFamily: "'Helvetica Neue', 'Arial', sans-serif" }}
        >
          {data.text}
        </p>
        <NodeHandle type="target" position={Position.Left} />
        <NodeHandle type="source" position={Position.Right} />
      </div>
    </div>
  );
};

/**
 * Video node component for displaying autoplaying videos in React Flow
 *
 * @example
 * ```tsx
 * const node = {
 *   type: 'videoNode',
 *   data: {
 *     label: 'MINIMAX VIDEO',
 *     sublabel: 'VIDEO',
 *     video: 'https://example.com/video.mp4',
 *     width: 280,
 *     height: 420,
 *   }
 * };
 * ```
 */
export const VideoNode = ({ data }: VideoNodeProps) => {
  return (
    <div className="group select-none">
      <div className="flex items-center gap-3 mb-2 px-1">
        {data.sublabel && (
          <span
            className="text-[11px] font-light tracking-wider text-black/50 uppercase"
            style={{ fontFamily: "'Helvetica Neue', 'Arial', sans-serif" }}
          >
            {data.sublabel}
          </span>
        )}
        <span
          className="text-[11px] font-normal tracking-wider text-black uppercase"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        >
          {data.label}
        </span>
      </div>
      <div
        className="relative rounded-[16px] overflow-hidden bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-black/10 transition-all duration-300 group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.15)] group-hover:border-black/20"
        style={{ width: data.width, height: data.height }}
      >
        <video
          src={data.video}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ transform: "scale(1.15)" }}
        />
        <NodeHandle type="target" position={Position.Left} />
        <NodeHandle type="source" position={Position.Right} />
      </div>
    </div>
  );
};