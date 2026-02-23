'use client';

import { Handle, Position } from '@xyflow/react';

interface NodeHandleProps {
  type: 'source' | 'target';
  position: Position;
}

/**
 * Reusable node handle component for React Flow nodes
 * Provides consistent styling across all hero section nodes
 * 
 * @example
 * ```tsx
 * <NodeHandle type="target" position={Position.Left} />
 * <NodeHandle type="source" position={Position.Right} />
 * ```
 */
export const NodeHandle = ({ type, position }: NodeHandleProps) => {
  const positionClass = {
    [Position.Left]: '!-left-[5px]',
    [Position.Right]: '!-right-[5px]',
    [Position.Top]: '!-top-[5px]',
    [Position.Bottom]: '!-bottom-[5px]',
  }[position];

  return (
    <Handle
      type={type}
      position={position}
      className={`!w-[10px] !h-[10px] !bg-white !border-[2px] !border-black/20 ${positionClass}`}
    />
  );
};
