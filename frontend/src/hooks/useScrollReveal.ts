import { useEffect, useRef, useState } from "react";

/**
 * Adds the "reveal" class immediately and "reveal-visible" once the element
 * enters the viewport (see the `reveal`/`reveal-visible` utilities in
 * index.css). Skips the observer and reveals immediately when the user
 * prefers reduced motion, or once the element has already been revealed -
 * it never re-hides on scrolling back up.
 */
export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, className: `reveal ${visible ? "reveal-visible" : ""}` };
}
