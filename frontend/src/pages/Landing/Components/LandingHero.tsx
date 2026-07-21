import { Link } from "react-router";

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
  return (
    <section
      id="home"
      className="relative flex min-h-[85vh] items-center overflow-hidden bg-brand-600"
    >
      <img
        src="/images/landing/hero-bg.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-700/70 via-brand-600/80 to-brand-950/90" />

      <div className="relative mx-auto w-full max-w-4xl px-4 py-24 text-center sm:px-6">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-200">
          Desde 2018
        </p>
        <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
          Clube Sonhos Literários
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-brand-100">
          Um espaço onde livros se transformam em encontros, e encontros em laços que atravessam
          páginas.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/signin"
            className="w-full rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-brand-700 shadow-theme-lg transition-transform hover:scale-105 sm:w-auto"
          >
            Área de Membros
          </Link>
          <a
            href="#sobre"
            className="w-full rounded-lg border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
          >
            Conhecer o clube
          </a>
        </div>

        <div className="mt-14 flex items-center justify-center gap-6">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              title={link.label}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
            >
              {link.icon}
            </a>
          ))}
        </div>
      </div>
    </section>
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
