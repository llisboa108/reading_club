import { createContext, useContext } from "react";
import type { LandingScroll } from "../hooks/useLandingScroll";

const LandingScrollContext = createContext<LandingScroll | null>(null);

export const LandingScrollProvider = LandingScrollContext.Provider;

/** Falls back to native smooth-scroll if used outside the landing page's provider. */
export function useLandingScrollContext(): LandingScroll {
  const ctx = useContext(LandingScrollContext);
  if (ctx) return ctx;

  return {
    scrollTo: (target) => {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      el?.scrollIntoView({ behavior: "smooth" });
    },
    reducedMotion: false,
    ready: false,
  };
}
