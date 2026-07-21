interface Partner {
  name: string;
  image: string;
  href?: string;
}

const PARTNERS: Partner[] = [
  {
    name: "Ilustrador",
    image: "/images/landing/partners/ovitzke2.png",
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
  return (
    <section id="parceiros" className="bg-gray-50 py-20 dark:bg-gray-900/40 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Nossos parceiros
          </p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Parceiros</h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-12">
          {PARTNERS.map((partner) => {
            const img = (
              <img
                src={partner.image}
                alt={partner.name}
                className="h-16 w-auto grayscale opacity-70 transition-all hover:grayscale-0 hover:opacity-100"
              />
            );
            return partner.href ? (
              <a key={partner.name} href={partner.href} target="_blank" rel="noopener noreferrer">
                {img}
              </a>
            ) : (
              <span key={partner.name}>{img}</span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
