interface ClubStats {
  books_read: number;
  pages_read: number;
  reading_hours: number;
  meets_held: number;
}

export default function StatsSection({ stats }: { stats: ClubStats | null }) {
  const items = [
    { label: "Livros lidos", value: stats?.books_read, icon: <BookIcon /> },
    { label: "Páginas lidas", value: stats?.pages_read, icon: <PagesIcon /> },
    { label: "Horas de leitura", value: stats?.reading_hours, icon: <ClockIcon /> },
    { label: "Encontros realizados", value: stats?.meets_held, icon: <PeopleIcon /> },
  ];

  return (
    <section id="numeros" className="relative overflow-hidden bg-brand-600 py-20 sm:py-28">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/40 via-transparent to-brand-950/40" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-200">
            O clube em números
          </p>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Um pequeno resumo da nossa existência
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
                {item.icon}
              </div>
              <div className="text-3xl font-bold text-white sm:text-4xl">
                {item.value !== undefined ? item.value.toLocaleString("pt-BR") : "—"}
              </div>
              <p className="mt-1 text-sm text-brand-100">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BookIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function PagesIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M4 6h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zm16 0h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  );
}
