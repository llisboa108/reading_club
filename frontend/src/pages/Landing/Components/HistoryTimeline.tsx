import { useEffect, useRef, useState } from "react";
import DistortImage from "../../../components/landing/DistortImage";
import { apiRequest } from "../../../api/client";
import { loadGsap, prefersReducedMotion } from "../../../lib/landingMotion";

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  description: string;
  image: string;
  link?: string;
}

export default function HistoryTimeline() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useRef(prefersReducedMotion()).current;
  const [entries, setEntries] = useState<TimelineItem[] | null>(null);

  useEffect(() => {
    apiRequest<TimelineItem[]>("/club/timeline-entries/", "GET", undefined, { silent: true })
      .then(setEntries)
      .catch(() => setEntries([]));
  }, []);

  useEffect(() => {
    if (reducedMotion || !sectionRef.current || !entries?.length) return;
    let cancelled = false;
    let revert: (() => void) | undefined;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled || !sectionRef.current) return;
      const ctx = gsap.context(() => {
        const items = gsap.utils.toArray<HTMLElement>(".timeline-entry");

        // One shared batched reveal instead of a per-entry IntersectionObserver.
        ScrollTrigger.batch(items, {
          start: "top 88%",
          onEnter: (batch) =>
            gsap.to(batch, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power2.out" }),
        });

        if (lineRef.current) {
          gsap.fromTo(
            lineRef.current,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              transformOrigin: "top",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 70%",
                end: "bottom 60%",
                scrub: true,
              },
            }
          );
        }
      }, sectionRef);
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [reducedMotion, entries]);

  if (!entries || entries.length === 0) return null;

  return (
    <section id="historia" ref={sectionRef} className="bg-stone-50 py-20 dark:bg-gray-900/40 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Da imaginação à realização.
          </p>
          <h2 className="font-heading text-3xl font-medium text-stone-900 dark:text-white sm:text-4xl">
            Nossa história
          </h2>
        </div>

        <div className="relative">
          <div
            ref={lineRef}
            className="absolute left-4 top-0 h-full w-0.5 bg-brand-200 dark:bg-brand-500/20 md:left-1/2 md:-translate-x-1/2"
          />

          <div className="space-y-5">
            {entries.map((item, i) => (
              <TimelineEntry key={item.id} item={item} index={i} reducedMotion={reducedMotion} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineEntry({
  item,
  index,
  reducedMotion,
}: {
  item: TimelineItem;
  index: number;
  reducedMotion: boolean;
}) {
  return (
    <div
      className={`timeline-entry relative flex flex-col md:flex-row md:items-center ${
        index % 2 === 1 ? "md:flex-row-reverse" : ""
      } ${reducedMotion ? "" : "opacity-0 translate-y-6"}`}
    >
      <span className="absolute left-4 top-6 z-10 h-3 w-3 -translate-x-1/2 rounded-full bg-brand-500 ring-4 ring-stone-50 dark:ring-gray-900 md:left-1/2" />

      <div className="w-full pl-10 md:w-1/2 md:px-10 md:pl-10">
        <TimelineCard item={item} />
      </div>
      <div className="hidden md:block md:w-1/2" />
    </div>
  );
}

function TimelineCard({ item }: { item: TimelineItem }) {
  const card = (
    <div className="group overflow-hidden rounded-xl border border-stone-200 bg-white shadow-theme-xs transition-shadow hover:shadow-stone-md dark:border-gray-800 dark:bg-gray-900">
      <div className="h-56 overflow-hidden">
        <DistortImage src={item.image} alt={item.title} className="h-full w-full" />
      </div>
      <div className="p-3.5">
        <p className="mb-1 text-xs font-medium text-brand-600 dark:text-brand-400">{item.date}</p>
        <h4 className="mb-1 font-heading font-semibold text-stone-900 dark:text-white">{item.title}</h4>
        <p className="line-clamp-3 text-sm text-stone-600 dark:text-gray-400">{item.description}</p>
      </div>
    </div>
  );

  if (item.link) {
    return (
      <a href={item.link} target="_blank" rel="noopener noreferrer" aria-label={`Ver publicação: ${item.title}`} title="Ver publicação">
        {card}
      </a>
    );
  }

  return card;
}
