import { useEffect, useRef, useState } from "react";
import type { default as LenisType } from "lenis";
import { loadGsap, prefersReducedMotion } from "../lib/landingMotion";

export interface LandingScroll {
  /** Smooth-scrolls to a selector or element; falls back to native scrollIntoView
   * when Lenis isn't active (reduced motion, or not ready yet). */
  scrollTo: (target: string | HTMLElement, options?: { offset?: number }) => void;
  reducedMotion: boolean;
  ready: boolean;
}

/**
 * Mounts Lenis + ScrollTrigger for the duration the landing page is mounted
 * only. Everything is torn down on unmount so the authenticated app (native
 * scroll everywhere: tables, modals, FullCalendar, etc.) is never affected.
 * Under prefers-reduced-motion, Lenis/GSAP are never even imported — every
 * section falls back to the existing one-shot useScrollReveal behavior.
 */
export function useLandingScroll(): LandingScroll {
  const [ready, setReady] = useState(false);
  const reducedMotion = useRef(prefersReducedMotion()).current;
  const lenisRef = useRef<LenisType | null>(null);
  const tickerRef = useRef<((time: number) => void) | null>(null);
  const gsapRef = useRef<typeof import("gsap").gsap | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      setReady(true);
      return;
    }

    let cancelled = false;

    Promise.all([loadGsap(), import("lenis")]).then(([{ gsap, ScrollTrigger }, lenisModule]) => {
      if (cancelled) return;

      const Lenis = lenisModule.default;
      const lenis = new Lenis({ autoRaf: false });
      lenisRef.current = lenis;
      gsapRef.current = gsap;

      lenis.on("scroll", ScrollTrigger.update);

      const onTick = (time: number) => {
        lenis.raf(time * 1000);
      };
      tickerRef.current = onTick;
      gsap.ticker.add(onTick);
      gsap.ticker.lagSmoothing(0);

      setReady(true);
    });

    return () => {
      cancelled = true;
      if (gsapRef.current && tickerRef.current) {
        gsapRef.current.ticker.remove(tickerRef.current);
      }
      lenisRef.current?.destroy();
      lenisRef.current = null;
      loadGsap().then(({ ScrollTrigger }) => {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/unmount once for the route's lifetime
  }, []);

  function scrollTo(target: string | HTMLElement, options?: { offset?: number }) {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: options?.offset ?? 0 });
      return;
    }
    const el = typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  }

  return { scrollTo, reducedMotion, ready };
}
