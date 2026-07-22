import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useLandingScrollContext } from "../../../context/LandingScrollContext";
import { loadGsap, prefersReducedMotion } from "../../../lib/landingMotion";
import { useAuth } from "../../../hooks/useAuth";
import { ThemeToggleButton } from "../../../components/common/ThemeToggleButton";

const NAV_LINKS = [
  { href: "#sobre", label: "Sobre" },
  { href: "#historia", label: "História" },
  { href: "#numeros", label: "Números" },
  { href: "#membros", label: "Membros" },
  { href: "#parceiros", label: "Parceiros" },
  { href: "#contato", label: "Contato" },
];

export default function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const { scrollTo } = useLandingScrollContext();
  const { user } = useAuth();
  const reducedMotion = useRef(prefersReducedMotion()).current;
  const pending = reducedMotion ? "" : "opacity-0 -translate-y-2";
  const memberCta = user
    ? { to: "/dashboard", label: "Ir para o Painel" }
    : { to: "/signin", label: "Área de Membros" };

  useEffect(() => {
    if (reducedMotion) return;
    let cancelled = false;
    let revert: (() => void) | undefined;

    loadGsap().then(({ gsap }) => {
      if (cancelled || !headerRef.current) return;
      const ctx = gsap.context(() => {
        gsap.to(".header-item", {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.05,
          ease: "power2.out",
          delay: 0.2,
        });
      }, headerRef);
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [reducedMotion]);

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    scrollTo(href);
    setMobileOpen(false);
  }

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-stone-200/70 bg-stone-25/90 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/90"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="#" className={`header-item flex items-center gap-2 ${pending}`}>
          <img src="/images/logo/logo.png" alt="Sonhos Literários" className="h-9 w-auto dark:hidden" />
          <img
            src="/images/logo/logo-dark.png"
            alt="Sonhos Literários"
            className="hidden h-9 w-auto dark:block"
          />
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className={`header-item relative font-body text-sm tracking-wide text-stone-600 transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-brand-600 after:transition-transform after:duration-300 hover:text-brand-600 hover:after:scale-x-100 focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand-500/20 focus-visible:rounded-sm dark:text-gray-300 dark:hover:text-brand-400 dark:after:bg-brand-400 dark:focus-visible:ring-brand-400/30 ${pending}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className={`header-item ${pending}`}>
            <ThemeToggleButton />
          </div>
          <Link
            to={memberCta.to}
            className={`header-item hidden rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-[background-color,transform] hover:bg-brand-700 active:scale-[0.98] sm:inline-flex ${pending}`}
          >
            {memberCta.label}
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`header-item inline-flex h-10 w-10 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand-500/20 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus-visible:ring-brand-400/30 lg:hidden ${pending}`}
            aria-label="Abrir menu"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-stone-200/70 px-4 py-3 dark:border-gray-800 lg:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand-500/20 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus-visible:ring-brand-400/30"
            >
              {link.label}
            </a>
          ))}
          <Link
            to={memberCta.to}
            className="mt-2 rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-medium text-white transition-transform hover:bg-brand-700 active:scale-[0.98]"
          >
            {memberCta.label}
          </Link>
          <div className="mt-3 flex items-center justify-center">
            <ThemeToggleButton />
          </div>
        </nav>
      )}
    </header>
  );
}

function MenuIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}
