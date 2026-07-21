const PARAGRAPHS = [
  <>
    O{" "}
    <a
      href="https://www.instagram.com/clubedolivrosonhosliterarios/"
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand-600 underline decoration-brand-300 underline-offset-2 dark:text-brand-400"
    >
      Clube do Livro Sonhos Literários
    </a>{" "}
    nasceu em 2018 e, desde então, vem se reinventando a cada nova leitura, experiência e com cada
    sonhador literário que faz parte de nossa história. Assim como os livros que lemos, o clube se
    transforma e cresce com o tempo, buscando manter a essência de espaço acolhedor.
  </>,
  "Além dos nossos encontros de leitura, o Clube promove ocasionalmente eventos temáticos aos nossos membros, com música, comida, arte e literatura. Além das atividades de comemoração do aniversário do “Sonhos Literários” e nosso tradicional “Amigo Literário” durante o nosso encontro de encerramento anual.",
  <>
    A última leitura do ano é o nosso projeto, intitulado “Desbravamento Literário”, cujo objetivo
    é descobrir novas experiências literárias, conhecimentos e visões de mundo, permitindo que a
    literatura nos guie por diferentes culturas, continentes e países. O projeto foi adaptado do
    desafio da escritora britânica{" "}
    <a
      href="https://annmorgan.me/"
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand-600 underline decoration-brand-300 underline-offset-2 dark:text-brand-400"
    >
      Ann Morgan
    </a>
    .
  </>,
  "Encerramos nossas atividades sempre em novembro, para que cada um tenha dezembro livre para festas, família, compromissos e até leituras extras. Entramos em “férias literárias” até fevereiro, quando retornamos com novo calendário, novas histórias e novas oportunidades de aprender juntos.",
  "Cada livro escolhido, cada encontro realizado e cada projeto construído refletem nosso propósito: fazer da literatura um ponto de encontro entre mundos, histórias e pessoas. No Sonhos Literários, acreditamos que ler é desbravar o desconhecido, mas também é sonhar junto, compartilhar emoções e cultivar laços que vão muito além das páginas.",
  "Seja bem-vindo(a) ao nosso sonho partilhado! Que novos e maravilhosos mundos venham até você, pelas páginas dos livros.",
];

export default function LandingAbout() {
  return (
    <section id="sobre" className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <img
          src="/images/landing/about-section.jpg"
          alt="Encontro do Clube Sonhos Literários"
          className="w-full rounded-2xl object-cover shadow-theme-lg lg:order-2"
        />
        <div className="lg:order-1">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Do sonho à realidade
          </p>
          <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Sobre o clube
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            {PARAGRAPHS.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
