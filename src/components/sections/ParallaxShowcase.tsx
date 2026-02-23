'use client';

import { useRef } from 'react';
import { useScrollProgress, useMousePosition } from './hooks';
import { PARALLAX } from './data';
import type { ParallaxImage } from './types';
import useMediaQuery from '@/hooks/useMediaQuery';

const ParallaxShowcase = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScrollProgress();
  const { mousePos, handleMouseMove, handleMouseLeave } = useMousePosition(sectionRef);

  // 1. Detect Mobile
  const isMobile = useMediaQuery('(max-width: 768px)');

  const calcTransform = (image: ParallaxImage) => {
    // 2. Mobile Logic: Force "Dead Center" alignment
    if (isMobile) {
      return 'translate(-50%, -50%)';
    }

    // Desktop Logic: Standard Parallax
    const xOffset = image.baseX + scrollY * image.scrollMultiplier[0];
    const yOffset = image.baseY + scrollY * image.scrollMultiplier[1];
    const mouseX = mousePos.x * image.mouseMultiplier;
    const mouseY = mousePos.y * image.mouseMultiplier;

    let transform = `translate3d(calc(${xOffset}% + ${mouseX}px), calc(${yOffset}% + ${mouseY}px), 0)`;
    if (image.additionalTransform) {
      transform += ` ${image.additionalTransform}`;
    }
    return transform;
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden pb-8 md:pb-12 pt-16 md:pt-0"
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
            linear-gradient(to bottom, transparent 0%, transparent 80%, rgba(255,255,255,0.6) 90%, rgba(255,255,255,0.8) 100%),
            linear-gradient(to bottom, rgba(232,236,239,0.3) 0%, rgba(255,255,255,0.5) 100%)
          `,
          zIndex: 1,
        }}
      />
      <div className="container mx-auto px-4 md:px-[5%] text-center mb-8 md:mb-16 relative z-10 pt-14" style={{ zIndex: 2 }}>
        <h2 className="text-[clamp(2.5rem,8vw,5.5rem)] leading-[0.95] tracking-tight text-[#333333] mb-4 md:mb-6">
          Control the<br />Outcome
        </h2>
        <p className="max-w-[360px] md:max-w-[600px] mx-auto text-base md:text-lg text-[#000000] leading-relaxed px-2">
          Layers, type, and blends—all the tools to bring your wildest ideas
          to life. Your creativity, our compositing power.
        </p>
      </div>

      <div className="container mx-auto px-2 md:px-[5%] relative z-10 min-h-[100px] md:min-h-[400px] flex items-center justify-center perspective-1000" style={{ zIndex: 2 }}>
        <div className="relative w-full max-w-[1200px] h-[360px] sm:h-[420px] md:h-auto md:aspect-[16/9]">

          <img
            src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682ee0eea4106dbd4133065d_Weavy%20UI.avif"
            alt="Weaave UI Interface"
            className="absolute inset-0 w-full h-auto object-contain z-10 pointer-events-none"
          />

          <img
            src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682ee1e4abc8a6ba31b611d5_spaceship.avif"
            alt="Spaceship"
            className="absolute w-[68%] h-auto object-contain z-10"
            // If you want the spaceship centered on mobile too, add similar logic here:
            style={{
              left: isMobile ? '50%' : '16%',
              top: isMobile ? '22.8%' : '1%',
              transform: isMobile ? 'translate(-50%, -50%)' : 'none'
            }}
          />

          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            {PARALLAX.map((image, idx) => (
              <img
                key={idx}
                src={image.src}
                alt={image.alt}
                className={image.className}
                style={{
                  transform: calcTransform(image),
                  // 4. Mobile Overrides: Force position to absolute center
                  left: isMobile ? '50%' : undefined,
                  top: isMobile ? '33%' : undefined,
                  // Reset any desktop-specific offsets
                  right: isMobile ? 'auto' : undefined,
                  bottom: isMobile ? 'auto' : undefined,
                  // Optional: Scale down slightly on mobile if they are huge
                  maxWidth: isMobile ? '80%' : undefined
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParallaxShowcase;