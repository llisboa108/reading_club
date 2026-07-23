import type { gsap as GsapNamespace } from "gsap";
import type { ScrollTrigger as ScrollTriggerNamespace } from "gsap/ScrollTrigger";

interface GsapBundle {
  gsap: typeof GsapNamespace;
  ScrollTrigger: typeof ScrollTriggerNamespace;
}

let bundlePromise: Promise<GsapBundle> | null = null;

/**
 * Loads gsap + ScrollTrigger once (cached across every call site) and keeps
 * them out of the main app bundle — only the landing route ever calls this.
 */
export function loadGsap(): Promise<GsapBundle> {
  if (!bundlePromise) {
    bundlePromise = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([gsapModule, scrollTriggerModule]) => {
        const { gsap } = gsapModule;
        const { ScrollTrigger } = scrollTriggerModule;
        gsap.registerPlugin(ScrollTrigger);
        return { gsap, ScrollTrigger };
      }
    );
  }
  return bundlePromise;
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function supportsFineHover(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}
