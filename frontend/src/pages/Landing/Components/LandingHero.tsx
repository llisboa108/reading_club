import { useEffect, useRef } from "react";
import { useLandingScrollContext } from "../../../context/LandingScrollContext";
import { loadGsap, prefersReducedMotion } from "../../../lib/landingMotion";
import { useAuth } from "../../../hooks/useAuth";

const HERO_FRAMES = [
  "/images/landing/hero-bg.jpg",
  "/images/landing/about-section.jpg",
  "/images/landing/cta-bg.jpg",
];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/clubedolivrosonhosliterarios/",
    icon: <InstagramIcon />,
  },
  {
    label: "Playlist",
    href: "https://open.spotify.com/playlist/3H73EVYQjQzCi9glaoozOU?si=exDKuNIrSd2ayQkNY7CI7Q&pi=BKS3bXLATMuKm",
    icon: <SpotifyIcon />,
  },
  {
    label: "Canal",
    href: "https://youtube.com/@clubedolivrosonhosliterarios?si=tINmWbRSBj2A-Q4J",
    icon: <YoutubeIcon />,
  },
  {
    label: "Email",
    href: "mailto:clubedolivrosonhosliterarios@gmail.com",
    icon: <MailIcon />,
  },
];

export default function LandingHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const frameRefs = useRef<(HTMLImageElement | null)[]>([]);
  const bgLayerRef = useRef<HTMLDivElement | null>(null);
  const { scrollTo } = useLandingScrollContext();
  const { user } = useAuth();
  const memberCta = user
    ? { href: "/dashboard", label: "Ir para o Painel" }
    : { href: "/signin", label: "Área de Membros" };
  const reducedMotion = useRef(prefersReducedMotion()).current;
  // Pre-hide entrance-animated elements via CSS (not gsap.from()) so there's
  // no flash of fully-visible content while gsap loads asynchronously.
  const pending = reducedMotion ? "" : "opacity-0 translate-y-4";

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return;
    let cancelled = false;
    let revert: (() => void) | undefined;

    loadGsap().then(({ gsap }) => {
      if (cancelled || !sectionRef.current) return;

      const ctx = gsap.context(() => {
        const frames = frameRefs.current.filter(Boolean) as HTMLImageElement[];
        if (frames.length > 1) {
          const loop = gsap.timeline({ repeat: -1 });
          frames.forEach((frame, i) => {
            const next = frames[(i + 1) % frames.length];
            loop
              .to({}, { duration: 4.5 })
              .to(next, { opacity: 1, duration: 1.8, ease: "power1.inOut" }, "<")
              .to(frame, { opacity: 0, duration: 1.8, ease: "power1.inOut" }, "<");
          });
        }

        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .to(".hero-eyebrow", { y: 0, opacity: 1, duration: 0.6 })
          .to(".hero-title", { y: 0, opacity: 1, duration: 0.9 }, "-=0.35")
          .to(".hero-subhead", { y: 0, opacity: 1, duration: 0.6 }, "-=0.45")
          .to(".hero-ctas > *", { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 }, "-=0.3")
          .to(".hero-socials > *", { y: 0, opacity: 1, duration: 0.4, stagger: 0.06 }, "-=0.25");

        if (bgLayerRef.current) {
          gsap.to(bgLayerRef.current, {
            yPercent: 12,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      }, sectionRef);

      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [reducedMotion]);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative flex min-h-[92vh] items-center overflow-hidden bg-brand-600"
    >
      <div ref={bgLayerRef} className="absolute inset-0 scale-110">
        {HERO_FRAMES.map((src, i) => (
          <img
            key={src}
            ref={(el) => {
              frameRefs.current[i] = el;
            }}
            src={src}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover ${i === 0 ? "opacity-40" : "opacity-0"}`}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-brand-700/70 via-brand-600/80 to-brand-950/90" />
      <QuoteGlyph className="pointer-events-none absolute -left-6 top-16 h-32 w-32 text-white/[0.06] sm:left-8" />
      <QuoteGlyph className="pointer-events-none absolute -right-6 bottom-10 h-40 w-40 rotate-180 text-white/[0.06] sm:right-10" />

      <div className="relative mx-auto w-full max-w-3xl px-4 py-24 text-center sm:px-6">
        <p
          className={`hero-eyebrow mb-5 text-xs font-medium uppercase tracking-[0.35em] text-brand-200 ${pending}`}
        >
          Desde 2018
        </p>
        <h1
          className={`hero-title text-balance font-heading text-4xl font-medium tracking-tight text-white sm:text-5xl md:text-[3.75rem] md:leading-[1.05] ${pending}`}
        >
          Clube Sonhos Literários
        </h1>
        <p
          className={`hero-subhead mx-auto mt-6 max-w-xl text-balance font-body text-lg text-brand-100 ${pending}`}
        >
          Um espaço onde livros se transformam em encontros, e encontros em laços que atravessam
          páginas.
        </p>

        <div className="hero-ctas mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={memberCta.href}
            className={`w-full rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-brand-700 shadow-theme-lg transition-transform hover:scale-105 active:scale-[0.98] sm:w-auto ${pending}`}
          >
            {memberCta.label}
          </a>
          <button
            type="button"
            onClick={() => scrollTo("#sobre")}
            className={`w-full rounded-lg border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto ${pending}`}
          >
            Conhecer o clube
          </button>
        </div>

        <div className="hero-socials mt-14 flex items-center justify-center gap-6">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              title={link.label}
              className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10 ${pending}`}
            >
              {link.icon}
            </a>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollTo("#sobre")}
        aria-label="Rolar para a próxima secção"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-white/50 transition-colors hover:text-white/80 motion-safe:animate-bounce sm:block"
      >
        <ChevronDownIcon className="h-6 w-6" />
      </button>
    </section>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}

function QuoteGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 100 100" aria-hidden="true">
      <path d="M32 20C18 26 10 38 10 54c0 13 8 22 19 22 9 0 16-7 16-16 0-8-6-14-14-14-1 0-2 0-3 .2C30 34 38 26 48 22l-2-8c-4 1.5-9.5 4-14 6zm50 0c-14 6-22 18-22 34 0 13 8 22 19 22 9 0 16-7 16-16 0-8-6-14-14-14-1 0-2 0-3 .2C80 34 88 26 98 22l-2-8c-4 1.5-9.5 4-14 6z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SpotifyIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M7 10.5c3-1 7-.5 9.5 1M7.5 13.5c2.5-.8 5.5-.4 8 1M8 16.5c2-.6 4.5-.3 6.5.8" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="6" width="18" height="12" rx="4" />
      <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" />
    </svg>
  );
}
