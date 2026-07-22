import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { apiRequest } from "../../../api/client";
import { loadGsap, prefersReducedMotion } from "../../../lib/landingMotion";

interface Quote {
  id: number;
  text: string;
  attribution: string;
  order: number;
  is_active: boolean;
}

export default function VozesDoClube() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useRef(prefersReducedMotion()).current;
  const [quotes, setQuotes] = useState<Quote[] | null>(null);

  useEffect(() => {
    apiRequest<Quote[]>("/club/quotes/", "GET", undefined, { silent: true })
      .then(setQuotes)
      .catch(() => setQuotes([]));
  }, []);

  useEffect(() => {
    if (reducedMotion || !sectionRef.current || !quotes?.length) return;
    let cancelled = false;
    let revert: (() => void) | undefined;

    loadGsap().then(({ gsap }) => {
      if (cancelled || !sectionRef.current) return;
      const ctx = gsap.context(() => {
        gsap.to(".voice-block", {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        });
      }, sectionRef);
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [reducedMotion, quotes]);

  // Fetch not resolved yet, or resolved empty — nothing genuine to show, so
  // don't render a broken/empty carousel.
  if (!quotes || quotes.length === 0) return null;

  const pending = `voice-block ${reducedMotion ? "" : "opacity-0 translate-y-4"}`;

  return (
    // Larger padding than grid sections: an isolated quote reads better with extra vertical space.
    // Background is swapped from the stone-25/gray-950 pair (unlike neighboring sections) so it
    // doesn't sit flush against TeamSection's identical background right above it.
    <section
      id="vozes"
      ref={sectionRef}
      className="relative overflow-hidden bg-stone-50 py-24 dark:bg-gray-900/40 sm:py-32"
    >
      <div className={`mx-auto max-w-3xl px-4 text-center sm:px-6 ${pending}`}>
        <p className="mb-10 text-xs font-medium uppercase tracking-widest text-stone-400 dark:text-gray-500">
          Vozes do clube
        </p>

        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          navigation
          pagination={{ clickable: true }}
          autoplay={reducedMotion || quotes.length < 2 ? false : { delay: 6000, disableOnInteraction: false }}
          loop={quotes.length > 1}
          autoHeight
          effect="fade"
          fadeEffect={{ crossFade: true }}
          className="quotes-carousel"
        >
          {quotes.map((quote) => (
            <SwiperSlide key={quote.id}>
              <span
                aria-hidden="true"
                className="block font-heading text-6xl leading-none text-brand-300 dark:text-brand-500/50"
              >
                “
              </span>
              <p className="mt-2 font-heading text-2xl italic leading-relaxed text-stone-800 dark:text-white sm:text-3xl">
                {quote.text}
              </p>
              {quote.attribution && (
                <p className="mt-6 text-xs font-medium uppercase tracking-widest text-stone-400 dark:text-gray-500">
                  {quote.attribution}
                </p>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
