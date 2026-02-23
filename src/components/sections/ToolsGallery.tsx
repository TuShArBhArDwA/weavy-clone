'use client';

import { useState } from 'react';
import { TOOLS, TOOL_DEFAULT } from './data';
import { ToolChip } from './primitives';

const TOOL_DESCRIPTIONS: Record<string, string> = {
  describer: "A unique ceramic or clay artifact, possibly a vase or a decorative piece, with a speckled black and white pattern. It is displayed on a rectangular pedestal against a muted beige background. The artifact has an asymmetrical shape, with one side appearing more voluminous and the other more slender. The pedestal itself is of a solid beige color and is placed on a white platform. soft dramatic gradient warm flare. dramatic",
  default: "",
};

const CLOUD_POSITIONS = [
  // Left Side
  { top: '20%', left: '-8%' },
  { top: '31%', left: '19%' },
  { top: '46%', left: '3%' },
  { top: '75%', left: '1%' },
  { top: '61%', left: '14%' },
  { top: '10%', left: '14%' },
  // Right Side
  { top: '10%', right: '0%' },
  { top: '25%', right: '19%' },
  { top: '40%', right: '1%' },
  { top: '50%', right: '22%' },
  { top: '56%', right: '7%' },
];

const ToolsGallery = () => {
  const [selectedTool, setSelectedTool] = useState<string>('default');

  const previewImage =
    TOOLS.find((t) => t.id === selectedTool)?.asset || TOOL_DEFAULT;
  
  const toolDescription = TOOL_DESCRIPTIONS[selectedTool] || TOOL_DESCRIPTIONS.default;

  return (
    <section
      className="relative w-full overflow-hidden py-8 md:py-[1rem] flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-[#f5f5f5]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
          zIndex: 0,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.4) 30%, transparent 70%),
            linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(209,217,226,0.5) 100%)
          `,
          zIndex: 1,
        }}
      />
      <div className="container relative z-10 px-4 md:px-[5%]" style={{ zIndex: 2 }}>
        <div className="flex flex-col items-center">
          <div className="text-center max-w-[1200px] px-2 pt-20">
            <h3 className="text-[32px] md:text-[60px] lg:text-[6rem] leading-[1.1] tracking-[-0.03em] text-[#333333] mb-4 md:mb-[24px]">
              With all the professional <br /> tools you rely on
            </h3>
            <p className="text-[14px] md:text-[16px] lg:text-[1.5rem] text-[#666666] font-normal pt-4">
              In one seamless workflow
            </p>
          </div>

          <div className="relative w-full max-w-[1400px] mx-auto">
            {toolDescription && (
              <div className="md:hidden px-4 py-6 text-center">
                <p className="text-[14px] leading-relaxed text-black/80 font-serif italic">
                  {toolDescription}
                </p>
              </div>
            )}

            {/* Exact image container size and logic */}
            <div className="relative w-full aspect-[16/8] rounded-[12px] md:rounded-[20px] overflow-hidden -translate-y-[30%] md:-translate-y-[30%] mx-auto max-w-[400px] md:max-w-none">
              <img
                src={previewImage}
                alt="Professional Tool Demonstration"
                className="absolute inset-0 h-full w-full object-cover transition-all duration-500"
                loading="eager"
                decoding="async"
              />
            </div>

            <div className="md:hidden relative -mt-4 pb-4">
              <div className="flex gap-3 overflow-x-auto px-4 py-2 scrollbar-hide snap-x snap-mandatory">
                {TOOLS.map((tool) => (
                  <ToolChip
                    key={tool.id}
                    label={tool.label}
                    isActive={selectedTool === tool.id}
                    onHover={() => setSelectedTool(tool.id)}
                    onLeave={() => {}}
                    onClick={() => setSelectedTool(selectedTool === tool.id ? 'default' : tool.id)}
                    className="flex-shrink-0 snap-center"
                  />
                ))}
              </div>
            </div>

            {/* Floating chips using CLOUD_POSITIONS to place them properly */}
            <div className="hidden md:block">
              {TOOLS.slice(0, CLOUD_POSITIONS.length).map((tool, index) => {
                const pos = CLOUD_POSITIONS[index];
                
                return (
                  <ToolChip
                    key={tool.id}
                    label={tool.label}
                    isActive={selectedTool === tool.id}
                    onHover={() => setSelectedTool(tool.id)}
                    onLeave={() => setSelectedTool('default')}
                    className="absolute px-8 md:px-6 py-2 md:py-3 rounded-xl border bg-white/90 hover:bg-[#FDFFA8] backdrop-blur-sm text-[14px] md:text-[18px] font-normal z-20 shadow-sm"
                    style={{
                      top: pos.top,
                      left: pos.left,
                      right: pos.right,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToolsGallery;