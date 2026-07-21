interface TimelineItem {
  title: string;
  date: string;
  description: string;
  image: string;
  link?: string;
}

const TIMELINE: TimelineItem[] = [
  {
    title: "Fundação do Clube",
    date: "29 de agosto de 2018",
    description: "O clube Sonhos Literários se transforma em realidade.",
    image: "/images/landing/timeline/fundacao.png",
  },
  {
    title: "Primeiro Amigo Literário",
    date: "Dezembro de 2018",
    description:
      "Revelação do primeiro amigo literário do clube, o amigo secreto do Clube Sonhos Literários.",
    image: "/images/landing/timeline/amigo-literario.jpg",
  },
  {
    title: "Segundo Amigo Literário",
    date: "Novembro de 2019",
    description: "Realização do segundo amigo literário.",
    image: "/images/landing/timeline/segundo-amigo.jpeg",
  },
  {
    title: "Pandemia COVID",
    date: "Janeiro de 2020",
    description:
      "Com o início da pandemia de COVID os encontros passam a ser realizados de forma remota.",
    image: "/images/landing/timeline/COVID-final.jpg",
  },
  {
    title: "Primeiro evento literário",
    date: "15 de novembro de 2021",
    description:
      "Uma nova página é escrita na história do clube: o primeiro evento promovido pelo Clube Sonhos Literários, tendo como inspiração a série de livros Bridgerton.",
    image: "/images/landing/timeline/primeiro-evento.jpg",
    link: "https://www.instagram.com/p/Ccg5-zXMT3i/",
  },
  {
    title: "Encontros híbridos",
    date: "Janeiro de 2022",
    description:
      "Com o recuo das medidas de isolamento da pandemia de COVID, os encontros do clube passam a ser realizados de forma híbrida (online e presencial).",
    image: "/images/landing/timeline/encontros-hibridos.jpg",
  },
  {
    title: "Segundo Evento Literário",
    date: "18 de junho de 2022",
    description:
      "O Clube Sonhos Literários realiza seu segundo evento, tendo dessa vez como tema As Brumas de Avalon.",
    image: "/images/landing/timeline/segundo-evento.jpeg",
  },
  {
    title: "Terceiro Amigo Literário",
    date: "Novembro de 2022",
    description:
      "Concluímos o ano de leitura com a realização do terceiro amigo literário, aproveitando para realizar nosso primeiro piquenique.",
    image: "/images/landing/timeline/terceiro-amigo.jpg",
    link: "https://www.instagram.com/p/CmOuYCor85q/?img_index=1",
  },
  {
    title: "Terceiro Evento Literário",
    date: "25 de junho de 2023",
    description:
      "Pela terceira vez em sua história o Clube Sonhos Literários promove um evento, dessa vez inspirado no próprio clube: uma celebração de todo o esforço e amor dedicados durante seus 3 anos de existência.",
    image: "/images/landing/timeline/terceiro-evento.jpeg",
    link: "https://www.instagram.com/p/Cumpw0Jg0Jt/",
  },
  {
    title: "Quarto Amigo Literário",
    date: "Novembro de 2022",
    description: "Mais um ano de leituras e encontros se encerra, com a realização de mais um amigo literário.",
    image: "/images/landing/timeline/quarto-amigo.jpg",
  },
  {
    title: "Início da gravação das leituras",
    date: "20 de fevereiro de 2024",
    description:
      "Uma nova forma de disponibilização das leituras: visando a comodidade dos membros, a idealizadora decide gravar as leituras e disponibilizá-las ao clube.",
    image: "/images/landing/timeline/gravacoes.jpeg",
  },
  {
    title: "Sonhos Literários em Portugal",
    date: "11 de junho de 2024",
    description: "Apresentação do trabalho realizado com o Sonhos Literários na Universidade do Minho (Portugal).",
    image: "/images/landing/timeline/portugal.jpeg",
  },
  {
    title: "Desbravamento Literário",
    date: "1 de outubro de 2024",
    description:
      "Mais um marco importante: o início de uma nova dinâmica de leitura, dedicando a última leitura do ano a obras que levem os membros a conhecer diferentes culturas, países e continentes.",
    image: "/images/landing/timeline/desbravamento.jpg",
    link: "https://www.instagram.com/p/DFfqezwOM2h/",
  },
  {
    title: "Convidada Especial",
    date: "12 de outubro de 2024",
    description:
      "No âmbito do Desbravamento Literário, o clube recebe pela primeira vez uma convidada especial, Tathiana Cassiano, doutoranda em História pela UDESC.",
    image: "/images/landing/timeline/convidada.jpg",
  },
  {
    title: "Quinto Amigo Literário",
    date: "9 de novembro de 2024",
    description: "Mantendo o já tradicional Amigo Literário para encerrar a temporada 2024 de leituras do clube.",
    image: "/images/landing/timeline/quinto-amigo.jpg",
    link: "https://www.instagram.com/p/DCLImAmRXyJ/?img_index=1",
  },
  {
    title: "Aniversário de 7 anos",
    date: "29 de agosto de 2025",
    description: "Em 2025 o Clube Sonhos Literários completa 7 anos.",
    image: "/images/landing/timeline/sete-anos.jpeg",
  },
  {
    title: "Primeiro Natal Literário",
    date: "Dezembro de 2025",
    description:
      "Projeto que nasceu para levar a literatura a crianças, viabilizado por doações de padrinhos literários e entregue em parceria com o grupo Andarilhos. Ao todo, 218 crianças foram atendidas.",
    image: "/images/landing/timeline/natalliterario.jpg",
  },
];

export default function HistoryTimeline() {
  return (
    <section id="historia" className="bg-gray-50 py-20 dark:bg-gray-900/40 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Nossa história
          </p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">História</h2>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-0 h-full w-0.5 bg-brand-200 dark:bg-brand-500/20 md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-10">
            {TIMELINE.map((item, i) => (
              <div
                key={item.title}
                className={`relative flex flex-col md:flex-row md:items-center ${
                  i % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <span className="absolute left-4 top-6 z-10 h-3 w-3 -translate-x-1/2 rounded-full bg-brand-500 ring-4 ring-gray-50 dark:ring-gray-900 md:left-1/2" />

                <div className="w-full pl-10 md:w-1/2 md:px-10 md:pl-10">
                  <TimelineCard item={item} />
                </div>
                <div className="hidden md:block md:w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineCard({ item }: { item: TimelineItem }) {
  const card = (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-xs transition-shadow hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900">
      <img src={item.image} alt={item.title} className="h-40 w-full object-cover" />
      <div className="p-4">
        <p className="mb-1 text-xs font-medium text-brand-600 dark:text-brand-400">{item.date}</p>
        <h4 className="mb-1 font-semibold text-gray-900 dark:text-white">{item.title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
      </div>
    </div>
  );

  if (item.link) {
    return (
      <a href={item.link} target="_blank" rel="noopener noreferrer" title="Ver publicação">
        {card}
      </a>
    );
  }

  return card;
}
