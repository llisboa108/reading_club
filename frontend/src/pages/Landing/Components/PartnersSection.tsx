import { useEffect, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "../../../lib/landingMotion";

interface Partner {
  name: string;
  image: string;
  href?: string;
}

const PARTNERS: Partner[] = [
  {
    name: "Ilustrador",
    image: "/images/landing/partners/ovitzke2-trimmed.png",
    href: "https://joaoovitzkeilustrador.myportfolio.com/home",
  },
  {
    name: "Credisis Creserv",
    image: "/images/landing/partners/credisis-creserv.png",
    href: "https://credisis.com.br/cooperativas/credisis-creserv/",
  },
  {
    name: "ABS",
    image: "/images/landing/partners/abs.png",
  },
];

export default function PartnersSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useRef(prefersReducedMotion()).current;

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return;
    let cancelled = false;
    let revert: (() => void) | undefined;

    loadGsap().then(({ gsap }) => {
      if (cancelled || !sectionRef.current) return;
      const ctx = gsap.context(() => {
        gsap.to(".partner-logo", {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%" },
        });
      }, sectionRef);
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [reducedMotion]);

  const logoPending = `partner-logo ${reducedMotion ? "" : "opacity-0 translate-y-3"}`;

  return (
    <section id="parceiros" ref={sectionRef} className="bg-stone-50 py-20 dark:bg-gray-900/40 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Aliados que caminham ao nosso lado.
          </p>
          <h2 className="font-heading text-3xl font-medium text-stone-900 dark:text-white sm:text-4xl">
            Nossos parceiros
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-12">
          {PARTNERS.map((partner) => {
            const img = (
              <div className="flex h-16 w-32 items-center justify-center">
                <img
                  src={partner.image}
                  alt={partner.name}
                  className="max-h-16 max-w-32 grayscale opacity-70 transition-all hover:grayscale-0 hover:opacity-100"
                />
              </div>
            );
            return partner.href ? (
              <a key={partner.name} href={partner.href} target="_blank" rel="noopener noreferrer" className={logoPending}>
                {img}
              </a>
            ) : (
              <span key={partner.name} className={logoPending}>
                {img}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
