'use client';

import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useHorizontalScroll } from './hooks';
import { WORKFLOWS } from './data';
import type { NavigationButtonProps, WorkflowCard } from './types';

// Horizontal carousel with infinite scroll
export default function WorkflowsCarousel() {
  const { scrollRef, canScrollLeft, canScrollRight, scrollLeft, scrollRight } =
    useHorizontalScroll({ scrollAmount: 400 });
  const isResettingRef = useRef(false);

  // DRAG STATE
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  const loopedCards = [...WORKFLOWS, ...WORKFLOWS, ...WORKFLOWS];


  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const calcCardWidth = () => {
      const firstCard = container.querySelector('.workflow-card');
      if (firstCard) {
        return firstCard.getBoundingClientRect().width + 18;
      }
      if (window.innerWidth >= 1024) return 420 + 18;
      if (window.innerWidth >= 768) return 400 + 18;
      return 320 + 18;
    };

    const handleScroll = () => {
      if (isResettingRef.current) return;

      const { scrollLeft, clientWidth } = container;
      const cardWidth = calcCardWidth();
      const setWidth = WORKFLOWS.length * cardWidth;
      const loopStart = setWidth;

      if (scrollLeft >= setWidth * 2 - clientWidth) {
        isResettingRef.current = true;
        const offset = scrollLeft - setWidth * 2;
        container.scrollLeft = loopStart + offset;
        setTimeout(() => (isResettingRef.current = false), 50);
      } else if (scrollLeft < setWidth) {
        isResettingRef.current = true;
        const offset = scrollLeft;
        container.scrollLeft = loopStart + offset;
        setTimeout(() => (isResettingRef.current = false), 50);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    setTimeout(() => {
      const cardWidth = calcCardWidth();
      const setWidth = WORKFLOWS.length * cardWidth;
      container.scrollLeft = setWidth;
    }, 100);

    return () => container.removeEventListener('scroll', handleScroll);
  }, [scrollRef]);

  // 👉 DRAG HANDLERS (ADDED)
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX;
    scrollStart.current = scrollRef.current.scrollLeft;
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.pageX - startX.current;
    scrollRef.current.scrollLeft = scrollStart.current - dx;
  };

  const stopDragging = () => {
    isDragging.current = false;
  };

  return (
    <section className="hidden md:block bg-[#252525] text-white pt-[40px] pb-[8px] md:pb-[40px] overflow-hidden">
      <div className="container px-[5%] max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-[48px]">
          <div className="max-w-[500px]">
            <h2 className="text-[6rem] font-medium leading-[1.05] tracking-[-0.03em] mb-[25px]">
              Explore Our<br />Workflows
            </h2>
            <p className="text-white text-[15px] md:text-[16px] tracking-wider">
              From multi-layer compositing to matte manipulation, Weaave keeps up
              with your creativity with all the editing tools you recognize and
              rely on.
            </p>
          </div>
        </div>
      </div>

      {/* CAROUSEL */}
      <div className="w-full pt-[16px] md:pt-[40px]">
        <div
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
          className="flex gap-[18px] overflow-x-auto scrollbar-hide px-[5%] cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loopedCards.map((workflow, index) => (
            <WorkflowCardComponent
              key={`${workflow.id}-${index}`}
              workflow={workflow}
            />
          ))}
        </div>
      </div>

      {/* NAVIGATION — BELOW CAROUSEL (LEFT ALIGNED, WEAAVE STYLE) */}
      <div className="container px-[5%] max-w-[1440px] mx-auto mt-[16px] md:mt-[24px]">
        <div className="flex justify-start gap-[10px]">
          <NavigationButton
            direction="left"
            onClick={() => scrollLeft()}
            disabled={!canScrollLeft}
          />
          <NavigationButton
            direction="right"
            onClick={() => scrollRight()}
            disabled={!canScrollRight}
          />
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

/* =========================
   NAVIGATION BUTTON — FINAL
   ========================= */
const NavigationButton = ({
  direction,
  onClick,
  disabled,
}: NavigationButtonProps) => {
  const Icon = direction === 'left' ? ArrowLeft : ArrowRight;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-[39px] h-[39px]
        rounded-[10px]
        border border-white/99
        bg-transparent
        flex items-center justify-center
        transition-all duration-300
      `}
    >
      <Icon size={30} strokeWidth={1.2} />
    </button>
  );
};


interface WorkflowCardComponentProps {
  workflow: WorkflowCard;
}

/* =========================
   WORKFLOW CARD
   ========================= */
const WorkflowCardComponent = ({ workflow }: WorkflowCardComponentProps) => {
  return (
    <div className="workflow-card flex-shrink-0 w-[320px] md:w-[400px] lg:w-[420px] group/card">
      <div className="mb-[16px]">
        <p
          className="
    text-[1.5rem]
    text-white
    pb-2
    transition-colors duration-300
    group-hover/card:text-[#f7ff9e]
  "
        >
          {workflow.title}
        </p>

      </div>

      <div className="relative aspect-[5/3] rounded-[16px] overflow-hidden bg-[#1f1f1f] border border-white/5 transition-all duration-300 group-hover/card:border-white/15">
        <img
          src={workflow.image}
          alt={workflow.title}
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
          loading="lazy"
          decoding="async"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* TRY BUTTON */}
        <div className="absolute bottom-0 left-0">
          <button
            className="
              bg-[#f7ff9e]
              text-black
              px-[30px] py-[6px]
              rounded-tr-[16px]
              text-[16px]
              font-medium
              transition-all duration-300 ease-out
              hover:bg-black
              hover:text-[#f7ff9e]
              hover:shadow-xl
              active:scale-95
            "
          >
            Try
          </button>
        </div>
      </div>
    </div>
  );
};
