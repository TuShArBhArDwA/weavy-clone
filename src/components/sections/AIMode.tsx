"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  useTransform,
  AnimatePresence,
} from "framer-motion";

// --- DATA SOURCE ---
export const workflowAppModeData = {
  heading: {
    part1: "From Workflow",
    part2: "to App Mode",
    subtitle:
      "Maximize your team ability, by automatically generating a simplified UI",
  },
  workflowMode: {
    title: "Workflow Mode",
    nodes: [
      {
        id: 1,
        type: "PROMPT",
        label: "PROMPT",
        // Desktop Workflow Position
        position: { top: "15%", left: "5%" },
        size: { width: "260px" },
        content: {
          text: "A transparent, green-tinted mechanical weave machine. It has a cylindrical component on the left, which seems to be rotating, producing thin, white strands that flow downwards. The device is mounted or a triangular stand, and there's a circular component on the right side. The entire setup is placed on a flat surface with a gradient background, transitioning from white at the top to a deeper shade at the bottom. Cinematic",
        },
        bgColor: "#F4FF99",
      },
      {
        id: 2,
        type: "IMAGE",
        label: "IMAGE REFERENCE",
        position: { top: "50%", left: "15%" },
        size: { width: "160px" },
        image:
          "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68262b7678811e48ff42f7db_Frame%20427321160.avif",
        bgColor: "#2A2A2A",
      },
      {
        id: 3,
        type: "IMAGE",
        label: "IMAGE",
        sublabel: "BRIA",
        position: { top: "5%", left: "40%" },
        size: { width: "180px" },
        image:
          "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68262b76a834003529b7f5d7_Group%207798.avif",
      },
      {
        id: 4,
        type: "IMAGE",
        label: "IMAGE",
        sublabel: "GEMINI V2",
        position: { top: "45%", left: "45%" },
        size: { width: "160px" },
        image:
          "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68262b761ffbb948a3e6f9e0_Frame%20427321155.avif",
      },
      {
        id: 5,
        type: "IMAGE",
        label: "STYLE REF",
        position: { top: "65%", left: "65%" },
        size: { width: "140px" },
        image:
          "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68262b7668cc066c00b3d2a2_Frame%20427321159.avif",
      },
    ],
  },
  appMode: {
    nodes: [
      {
        id: 1,
        type: "COLOR STYLE REF",
        label: "COLOR STYLE REF",
        position: { top: "15%", left: "65%" },
        size: { width: "120px" },
        image:
          "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68262b764367eac325e77daa_Frame%20427321158.avif",
      },
      {
        id: 2,
        type: "OUTPUT",
        label: "OUTPUT",
        position: { top: "10%", right: "5%" },
        size: { width: "340px" },
        image:
          "https://res.cloudinary.com/drgvse4xb/image/upload/v1768369308/qxlquoxjdjfb6l6gkvt7.avif",
        bgColor: "#F4FF99",
        featured: true,
      },
      {
        id: 3,
        type: "COMPOSITOR",
        label: "COMPOSITOR",
        position: { top: "55%", right: "25%" },
        size: { width: "130px" },
        image:
          "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68262b763488bd282a6e4f3f_Frame%20427321156.avif",
        bgColor: "#B8B8B8",
      },
    ],
  },
};

export default function WorkflowTransition() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAppMode, setIsAppMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // --- RESPONSIVE CHECK ---
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // --- DATA PREP ---
  const promptNodeData = workflowAppModeData.workflowMode.nodes.find(
    (n) => n.type === "PROMPT"
  );
  const outputNodeData = workflowAppModeData.appMode.nodes.find(
    (n) => n.featured === true
  );

  const floatingWorkflowNodes = workflowAppModeData.workflowMode.nodes.filter(
    (n) => n.type !== "PROMPT"
  );
  const floatingAppNodes = workflowAppModeData.appMode.nodes.filter(
    (n) => !n.featured
  );
  const allFloatingNodes = [...floatingWorkflowNodes, ...floatingAppNodes];

  // --- SCROLL LOGIC ---
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0.25 && !isAppMode) setIsAppMode(true);
    if (latest <= 0.25 && isAppMode) setIsAppMode(false);
  });

  const toggleX = useTransform(scrollYProgress, [0.2, 0.3], [0, 24]);
  const bgOpacity = useTransform(scrollYProgress, [0.2, 0.3], [0, 1]);

  // --- 1. Background Nodes Logic (Kept EXACTLY as in your code) ---
  const yFloating = useTransform(scrollYProgress, [0, 0.4], [0, -150]);

  // --- 2. Prompt & Output Logic (Updated for High Speed Parallax) ---
  const mainEntryY = useTransform(scrollYProgress, [0, 0.25], [200, 0]);

  const smoothSpring = { type: "spring", stiffness: 45, damping: 18 } as const;

  return (
    <section ref={containerRef} className="h-[250vh] relative bg-[#FBFBFB]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col pt-8 md:pt-16">
        {/* --- HEADER --- */}
        <div className="relative z-40 max-w-[1600px] mx-auto px-6 md:px-16 w-full mb-4 md:mb-8">
          <p className="text-[13px] md:text-sm text-[#1c1b1b] mb-4 md:mb-6 max-w-[420px]">
            {workflowAppModeData.heading.subtitle}
          </p>

          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
            <h2
              className={`text-[42px] md:text-[60px] lg:text-[96px] leading-[0.95] font-normal tracking-[-0.03em] transition-colors duration-500 ${
                isAppMode ? "text-gray-200" : "text-black"
              }`}
            >
              {workflowAppModeData.heading.part1}
            </h2>

            <div className="flex items-center gap-4">
              <div className="relative w-[56px] h-[32px] md:w-[60px] md:h-[36px] lg:w-[72px] lg:h-[40px] rounded-full bg-black/10 p-1 flex items-center flex-shrink-0">
                <motion.div
                  style={{ opacity: bgOpacity }}
                  className="absolute inset-0 bg-[#dfff4f] rounded-full"
                />
                <motion.div
                  style={{ x: toggleX }}
                  className="relative z-10 w-[24px] h-[24px] md:w-[28px] md:h-[28px] lg:w-[32px] lg:h-[32px] bg-black rounded-full"
                />
              </div>

              <h2
                className={`text-[42px] md:text-[60px] lg:text-[96px] leading-[0.95] font-normal tracking-[-0.03em] transition-colors duration-500 ${
                  isAppMode ? "text-black" : "text-gray-200"
                }`}
              >
                {workflowAppModeData.heading.part2}
              </h2>
            </div>
          </div>
        </div>

        {/* --- CANVAS AREA --- */}
        <div className="relative w-full max-w-[1400px] mx-auto flex-1 p-4">
          <div className="relative w-full h-[600px] md:h-[700px]">
            
            {/* === 1. PROMPT NODE (Updated Animation) === */}
            {promptNodeData && (
              <motion.div
                layout
                // Added High Speed Parallax style
                style={{ y: mainEntryY }}
                initial={false}
                animate={
                  isMobile
                    ? {
                        // MOBILE LOGIC: Side-by-Side Layout
                        top: isAppMode ? "20%" : "5%",
                        left: isAppMode ? "0%" : "2%",
                        width: isAppMode ? "35%" : "46%",
                        height: isAppMode ? "250px" : "auto",
                        zIndex: 30,
                      }
                    : {
                        // DESKTOP LOGIC
                        top: isAppMode ? "0%" : promptNodeData.position.top,
                        left: isAppMode ? "16%" : promptNodeData.position.left,
                        width: isAppMode ? "26%" : promptNodeData.size.width,
                        height: isAppMode ? "440px" : "auto",
                        zIndex: 30,
                      }
                }
                transition={smoothSpring}
                className="absolute flex flex-col"
              >
                <motion.div
                  layout
                  className={`
                    flex flex-col flex-1 rounded-xl shadow-sm overflow-hidden
                    ${isAppMode ? "mb-2 md:mb-4" : ""}
                  `}
                  animate={{
                    backgroundColor: isAppMode ? "#EFEFDC" : "#EFEFDC",
                  }}
                >
                  <div
                    className="px-4 py-3 md:px-6 md:py-4 flex-shrink-0"
                    style={{ backgroundColor: "#F4FF99" }}
                  >
                    <span className="text-[10px] md:text-xs font-bold tracking-wider text-black/60 uppercase">
                      {promptNodeData.label}
                    </span>
                  </div>

                  <div className="p-4 pt-0 md:p-6 md:pt-0 flex-1 mt-2 md:mt-4">
                    <p className="text-[11px] md:text-sm leading-relaxed font-medium text-black/80 line-clamp-6 md:line-clamp-none">
                      {promptNodeData.content?.text}
                    </p>
                  </div>
                </motion.div>

                {/* RUN BUTTON */}
                <motion.div
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: isAppMode ? 1 : 0,
                    height: isAppMode ? (isMobile ? "50px" : "93px") : "0px",
                  }}
                  className="bg-white rounded-xl flex items-center justify-center shadow-sm cursor-pointer hover:scale-[1.02] transition-transform overflow-hidden"
                >
                  <span className="text-[10px] md:text-sm font-bold tracking-widest text-black uppercase">
                    RUN
                  </span>
                </motion.div>
              </motion.div>
            )}

            {/* === 2. OUTPUT NODE === */}
            {outputNodeData && (
              <motion.div
                layout
                // Added High Speed Parallax style
                style={{ y: mainEntryY }}
                initial={false}
                animate={
                  isMobile
                    ? {
                        // MOBILE LOGIC:
                        top: isAppMode ? "20%" : "5%",
                        left: isAppMode ? "auto" : "50%",
                        right: isAppMode ? "0%" : "auto",
                        width: isAppMode ? "63%" : "46%",
                        height: isAppMode ? "250px" : "auto",
                        zIndex: 30,
                      }
                    : {
                        // DESKTOP LOGIC
                        top: isAppMode ? "0%" : outputNodeData.position.top,
                        left: isAppMode ? "44%" : "auto",
                        right: isAppMode
                          ? "0%"
                          : outputNodeData.position.right || "auto",
                        width: isAppMode ? "39%" : outputNodeData.size.width,
                        height: isAppMode ? "390px" : "auto",
                        zIndex: 30,
                      }
                }
                transition={smoothSpring}
                className="absolute bg-white rounded-xl shadow-sm overflow-hidden flex flex-col"
              >
                <div
                  className="px-4 py-3 md:px-6 md:py-4 flex-shrink-0 relative z-20"
                  style={{ backgroundColor: outputNodeData.bgColor }}
                >
                  <span className="text-[10px] md:text-xs font-bold tracking-wider text-black/60 uppercase">
                    {outputNodeData.label}
                  </span>
                </div>

                <div className="relative flex-1 bg-white overflow-hidden">
                  <img
                    src={outputNodeData.image}
                    alt="Output"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            )}

            {/* === 3. FLOATING NODES === */}
            <AnimatePresence>
              {!isAppMode &&
                allFloatingNodes.map((node, i) => (
                  <FloatingNode
                    key={`float-${i}`}
                    node={node}
                    y={yFloating} // Using original yFloating
                    isMobile={isMobile}
                    index={i}
                  />
                ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- FLOATING NODE COMPONENT  ---
function FloatingNode({
  node,
  y,
  isMobile,
  index,
}: {
  node: any;
  y: any;
  isMobile: boolean;
  index: number;
}) {
  const { position, size, image, label, sublabel, bgColor } = node;

  const mobileStyle = isMobile
    ? {
        top: `${55 + index * 20}%`,
        left: index % 2 === 0 ? "5%" : "50%",
        width: "45%",
        zIndex: 10,
      }
    : {
        top: position.top,
        left: position.left,
        right: position.right,
        width: size.width,
        zIndex: 10,
      };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{
        opacity: 0,
        y: -100,
        scale: 0.95,
        filter: "blur(4px)",
        transition: { duration: 0.6, ease: "easeInOut" },
      }}
      style={{
        ...mobileStyle,
        y,
      }}
      className="absolute rounded-xl overflow-hidden shadow-[0_8px_20px_rgb(0,0,0,0.06)] bg-white pointer-events-none"
    >
      {(label || sublabel) && (
        <div
          className="px-3 py-2 flex flex-col justify-center"
          style={{ backgroundColor: bgColor || "#ffffff" }}
        >
          {label && (
            <span className="text-[9px] font-bold tracking-widest text-black/40 uppercase">
              {label}
            </span>
          )}
          {sublabel && (
            <span className="text-[9px] font-bold tracking-widest text-black uppercase mt-0.5">
              {sublabel}
            </span>
          )}
        </div>
      )}
      {image && (
        <div className="w-full aspect-[4/5] bg-gray-50">
          <img
            src={image}
            alt="Node"
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>
      )}
    </motion.div>
  );
}