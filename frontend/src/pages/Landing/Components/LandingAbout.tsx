import { useEffect, useRef } from "react";
import { useScrollReveal } from "../../../hooks/useScrollReveal";
import { loadGsap, prefersReducedMotion } from "../../../lib/landingMotion";

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
];

export const ABOUT_CLOSING_LINE =
  "Seja bem-vindo(a) ao nosso sonho partilhado! Que novos e maravilhosos mundos venham até você, pelas páginas dos livros.";

export default function LandingAbout() {
  const { ref: fallbackRef, className: revealClass } = useScrollReveal<HTMLDivElement>();
  const gridRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const reducedMotion = useRef(prefersReducedMotion()).current;

  useEffect(() => {
    if (reducedMotion) return;
    let cancelled = false;
    let revert: (() => void) | undefined;

    loadGsap().then(({ gsap }) => {
      if (cancelled || !gridRef.current) return;
      const ctx = gsap.context(() => {
        if (imageRef.current) {
          gsap.fromTo(
            imageRef.current,
            { clipPath: "inset(0 100% 0 0)" },
            {
              clipPath: "inset(0 0% 0 0)",
              duration: 1.1,
              ease: "power3.inOut",
              scrollTrigger: { trigger: gridRef.current, start: "top 75%" },
            }
          );
        }
        gsap.to(".about-para", {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 70%" },
        });
      }, gridRef);
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [reducedMotion]);

  const paraPending = reducedMotion ? "" : "opacity-0 translate-y-3 about-para";

  return (
    <section id="sobre" className="bg-stone-25 py-20 dark:bg-gray-950 sm:py-28">
      <div
        ref={(el) => {
          gridRef.current = el;
          fallbackRef.current = el;
        }}
        className={`mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 ${
          reducedMotion ? revealClass : ""
        }`}
      >
        <img
          ref={imageRef}
          src="/images/landing/about-section.jpg"
          alt="Retrato pintado de uma mulher lendo um livro, em tons quentes"
          className="w-full rounded-2xl object-cover shadow-stone-lg lg:order-2"
        />
        <div className="lg:order-1">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Do sonho à realidade
          </p>
          <h2 className="mb-6 font-heading text-3xl font-medium text-stone-900 dark:text-white sm:text-4xl">
            Sobre o clube
          </h2>
          <div className="space-y-4 text-stone-600 dark:text-gray-300">
            {PARAGRAPHS.map((p, i) => (
              <p
                key={i}
                className={`${paraPending} ${
                  i === 0
                    ? "first-letter:float-left first-letter:mr-2 first-letter:font-heading first-letter:text-6xl first-letter:font-bold first-letter:leading-[0.8] first-letter:text-brand-600 dark:first-letter:text-brand-400"
                    : ""
                }`}
              >
                {p}
              </p>
            ))}
          </div>

          <blockquote className="relative mt-8 border-l-2 border-brand-300 pl-6 dark:border-brand-500/40">
            <span
              aria-hidden="true"
              className="absolute -left-1 -top-3 font-heading text-5xl leading-none text-brand-300 dark:text-brand-500/50"
            >
              “
            </span>
            <p className="font-heading text-lg italic text-stone-700 dark:text-gray-300">
              {ABOUT_CLOSING_LINE}
            </p>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
