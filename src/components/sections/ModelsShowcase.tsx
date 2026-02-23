"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollProgress } from "./hooks";
import { MODELS } from "./data";
import { GradientOverlay } from "./primitives";

// Scroll-driven AI models showcase with audio
export default function ModelsShowcase() {
  const { sectionRef, progress } = useScrollProgress();
  const soundRef = useRef<HTMLAudioElement | null>(null);
  const [isViewportFull, setIsViewportFull] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  const currentModelIndex = Math.min(
    MODELS.length - 1,
    Math.floor(progress * MODELS.length)
  );

  useEffect(() => {
    if (!viewportRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsViewportFull(
            entry.isIntersecting && entry.intersectionRatio >= 0.9
          );
        });
      },
      {
        threshold: [0, 0.5, 0.9, 1],
      }
    );

    observer.observe(viewportRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!soundRef.current) return;

    let pauseTimer: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      if (isViewportFull && soundRef.current) {
        if (soundRef.current.paused) {
          soundRef.current.play().catch((error) => {
            console.log("Audio play failed:", error);
          });
        }

        if (pauseTimer) {
          clearTimeout(pauseTimer);
        }

        pauseTimer = setTimeout(() => {
          if (soundRef.current && !soundRef.current.paused) {
            soundRef.current.pause();
          }
        }, 300);
      } else if (
        !isViewportFull &&
        soundRef.current &&
        !soundRef.current.paused
      ) {
        soundRef.current.pause();
        if (pauseTimer) {
          clearTimeout(pauseTimer);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (pauseTimer) {
        clearTimeout(pauseTimer);
      }
      if (soundRef.current && !soundRef.current.paused) {
        soundRef.current.pause();
      }
    };
  }, [isViewportFull]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      soundRef.current = new Audio("/sound.mp3");
      soundRef.current.loop = true;
      soundRef.current.volume = 0.5;
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.pause();
        soundRef.current = null;
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: "400vh" }}
    >
      <div
        ref={viewportRef}
        className="sticky top-0 h-screen w-full overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/30 z-10" />
          {MODELS.map((model, idx) => (
            <div
              key={idx}
              className={`absolute inset-0  ${
                currentModelIndex === idx ? "opacity-100" : "opacity-0"
              }`}
            >
              {model.src ? (
                model.type === "video" ? (
                  <video
                    src={model.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={model.src}
                    alt={model.name}
                    className="h-full w-full object-cover"
                    loading={idx === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                )
              ) : (
                <div className="h-full w-full bg-neutral-900 flex items-center justify-center">
                  <span className="text-neutral-700 font-mono text-sm uppercase">
                    Asset Placeholder
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <GradientOverlay position="top" fromColor="#0a1a1a" />
        <GradientOverlay position="bottom" fromColor="#4a7c7c" />

        <div className="relative z-30 h-full w-full flex flex-col md:flex-row">
          <div className="w-full md:w-[30%] h-auto md:h-full flex flex-col justify-start md:justify-center pt-16 md:pt-0 px-6 md:px-0 md:pl-12 lg:pl-20">
            <h2 className="text-white leading-none tracking-[-0.03em] mb-4 md:mb-6 md:text-[5rem] text-[4rem] ">
              Use all AI models, together at last
            </h2>
            <p className="text-[#c7c4c4] tracking-wider text-sm md:text-base leading-snug max-w-[90%]">
              AI models and professional editing tools in one node-based
              platform. Turn creative vision into scalable workflows without
              compromising quality.
            </p>
          </div>

          <div className="w-full md:w-[55%] flex-1 md:h-full flex items-start md:items-center justify-start overflow-hidden px-4 md:px-0 mt-8 md:mt-0">
            <div className="relative h-auto w-full">
              <div
                className="transition-transform duration-700 ease-out flex flex-col ml-10 mt-2 md:mt-10"
                style={{
                  transform: `translateY(calc(${
                    typeof window !== "undefined" && window.innerWidth < 768
                      ? "12vh"
                      : "42vh"
                  } - ${
                    currentModelIndex *
                    (typeof window !== "undefined" && window.innerWidth < 768
                      ? 36
                      : 48)
                  }px))`,
                }}
              >
                {MODELS.map((model, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center  ${
                      currentModelIndex === idx
                        ? "text-[#f7ff9e]"
                        : "text-white"
                    }`}
                  >
                    <span
                      className="text-[2.6rem] sm:text-[3.2rem] md:text-[5rem] tracking-tight"
                      style={{
                        lineHeight: 1,
                        color:
                          currentModelIndex === idx ? "#f7ff9e" : "#ffffff",
                      }}
                    >
                      {model.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" />
    </section>
  );
}
