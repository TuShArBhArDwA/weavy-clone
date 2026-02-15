"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Github, Linkedin, Coffee, Youtube } from "lucide-react";
import { GoPlus } from "react-icons/go";
import { FOOTER_NAV, SOCIALS, FOOTER_IMAGES } from "./data";
import type { SocialLink } from "./types";

// X (Twitter) icon
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Medium Icon
const MediumIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
  </svg>
);

const Footer = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = sectionRef.current;
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        window.dispatchEvent(
          new CustomEvent("footer-visibility", {
            detail: { isVisible: entry.isIntersecting },
          })
        );
      },
      { threshold: 0.1 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={sectionRef}
      className="
    relative
    bg-transparent md:bg-[#252525]
    overflow-hidden
    font-sans
  "
    >
      {/* =========================
         EXACT WEAAVE SVG NODE (TOPMOST)
         ========================= */}
      {/* <img
  src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682231a73b5be7ff98f935ac_footer%20Node.svg"
  alt=""
  aria-hidden
  className="
    pointer-events-none
    absolute
    z-[49]
    w-[22.5rem]
    max-w-none
    right-[7rem]
    bottom-[5%]
    top-[45vh]
    h-[85vh]
    hidden md:block
  "
/> */}

      {/* ========================= */}

      <div
        className="
  relative
  bg-[#A8B1A5]
  max-w-[1290px]
  max-h-[900px]
  rounded-none md:rounded-tr-[60px]
  mt-0 md:mt-24
  mr-0 md:mr-16
  pt-6 md:pt-24
  pb-8 md:pb-12
  px-4 md:px-[5%]
"
      >
        <div className="max-w-[1440px] mx-auto relative z-10">
          <HeroStatement />

          <div className="flex items-center justify-between mb-8 md:hidden">
            <img
              src={FOOTER_IMAGES.logo}
              alt="Weaave Artistic Intelligence"
              className="h-[32px] w-auto"
            />
            <Link
              href="/workflows"
              className="bg-[#f7ff9e] text-black py-2.5 px-7 rounded-md text-[14px] transition-all hover:scale-[1.02] active:scale-95"
            >
              START NOW
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 mb-10 md:mb-14">
            <div className="flex flex-col md:flex-row md:max-w-[80%] gap-4 md:gap-10">
              <img
                src={FOOTER_IMAGES.logo}
                alt="Weaave Artistic Intelligence"
                className="h-[40px] w-auto hidden md:block"
              />
              <p className="text-white text-[13px] leading-[1.7] font-light">
                <span className="font-normal">Weaave</span> is a new way to
                create. We&apos;re bridging the gap between AI capabilities and
                human creativity, to continue the tradition of craft in artistic
                expression. We call it Artistic Intelligence.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 mb-10 md:mb-14">
            <div className="flex gap-6 pt-1">
              {[
                { icon: Github, href: "https://github.com/TuShArBhArDwA" },
                { icon: Linkedin, href: "https://www.linkedin.com/in/bhardwajtushar2004/" },
                { icon: Coffee, href: "https://buymeacoffee.com/tusharbhardwaj" },
                { icon: Youtube, href: "https://www.youtube.com/channel/UCqq8kNn9yKvsl95MeiFPIeg" },
                { icon: MediumIcon, href: "https://medium.com/@bhardwajtushar2004", isCustom: true },
                { icon: XIcon, href: "https://x.com/Tusharab2004", isCustom: true },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="text-white text-lg hover:opacity-60"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.isCustom ? <social.icon /> : <social.icon size={20} strokeWidth={1.5} />}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <img
              src={FOOTER_IMAGES.soc2Badge}
              alt="SOC2"
              className="w-[50px]"
            />
            <div>
              <p className="text-[#1A1A1A] text-[12px]">
                SOC 2 Type <strong>II</strong> Certified
              </p>
              <p className="text-[#1A1A1A]/70 text-[11px]">
                Your data is protected with industry-standard security controls.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 text-[12px] font-medium tracking-[0.05em] text-[#1A1A1A]/80">
            <span>Fuel the creativity</span>
            <a
              href="https://buymeacoffee.com/tusharbhardwaj"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[#111] transition-colors border-b border-black/20 hover:border-black/50"
            >
              <Coffee size={14} />
              <span>Buy Me A Coffee</span>
            </a>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/workflows"
        className="
    hidden md:flex
    group
    absolute bottom-0 right-0
    bg-[#f7ff9e]
    px-8 pr-8 pt-10 pb-7 pl-18
    rounded-tl-[40px]
    z-[55]
    transition-all duration-300
    hover:bg-white
    hover:scale-[1.02]
    active:scale-95
  "
      >
        <span
          className="
      text-[40px] md:text-[80px]
      font-light
      leading-none
      text-black
      transition-colors duration-300
    "
        >
          Start Now
        </span>
      </Link>
    </footer>
  );
};

const HeroStatement = () => (
  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10 mb-12 md:mb-32">
    <h2 className="text-white text-[clamp(3rem,12vw,6.5rem)] font-light leading-[0.95] tracking-[-0.03em]">
      Artificial
      <br />
      Intelligence
    </h2>

    <GoPlus className="text-white w-[70px] h-[70px] md:w-[100px] md:h-[100px]" />

    <h2 className="text-white text-[clamp(3rem,12vw,6.5rem)] font-light leading-[0.95] tracking-[-0.03em]">
      Human
      <br />
      Creativity
    </h2>
  </div>
);

export default Footer;
