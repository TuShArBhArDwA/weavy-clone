import type { Node, Edge } from '@xyflow/react';

/**
 * Base interface for all hero node data
 */
export interface BaseNodeData {
    label: string;
    sublabel?: string;
    width: number;
    height?: number;
    [key: string]: string | number | undefined;
}

/**
 * Data for image nodes in the hero section
 */
export interface ImageNodeData extends BaseNodeData {
    image: string;
}

/**
 * Data for text nodes in the hero section
 */
export interface TextNodeData extends Omit<BaseNodeData, 'height'> {
    text: string;
}

/**
 * Data for video nodes in the hero section
 */
export interface VideoNodeData extends BaseNodeData {
    video: string;
}

/**
 * Union type for all hero node data types
 */
export type HeroNodeData = ImageNodeData | TextNodeData | VideoNodeData;

/**
 * Type for hero section nodes with proper data typing
 */
export type HeroNode = Node<HeroNodeData>;

/**
 * Type for hero section edges
 */
export type HeroEdge = Edge;

/**
 * Node extent configuration type
 */
export type NodeExtent = [[number, number], [number, number]];
