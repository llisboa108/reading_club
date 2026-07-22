import { useScrollReveal } from "../../../hooks/useScrollReveal";

interface TeamMember {
  name: string;
  role: string;
  image: string;
  instagram: string;
}

const TEAM: TeamMember[] = [
  {
    name: "Daiane A. Hoffmann",
    role: "Idealizadora e Fundadora",
    image: "/images/landing/team/daiane.jpg",
    instagram: "https://www.instagram.com/daianehoffmann/",
  },
  {
    name: "Cirene A. L. Hoffmann",
    role: "Membro desde 2018",
    image: "/images/landing/team/cirene.jpg",
    instagram: "https://www.instagram.com/cirenelisboa/",
  },
  {
    name: "Larissa Zembruski",
    role: "Membro desde 2018",
    image: "/images/landing/team/larissa.jpg",
    instagram: "https://www.instagram.com/larizembruski/",
  },
  {
    name: "Simone Lisboa",
    role: "Membro desde 2021",
    image: "/images/landing/team/simone.jpg",
    instagram: "https://www.instagram.com/simone_lisboa15/",
  },
  {
    name: "Valéria Garcia",
    role: "Membro desde 2022",
    image: "/images/landing/team/valeria.jpg",
    instagram: "https://www.instagram.com/valeria_garcia1525/",
  },
  {
    name: "Ionete Santos",
    role: "Membro desde 2022",
    image: "/images/landing/team/ionete.jpg",
    instagram: "https://www.instagram.com/ionete_santoss/",
  },
  {
    name: "Franciele M. Freitas",
    role: "Membro desde 2025",
    image: "/images/landing/team/franciele.jpg",
    instagram: "https://www.instagram.com/leitorados30epoucos",
  },
];

export default function TeamSection() {
  const { ref, className: revealClass } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="membros" className="py-20 sm:py-28">
      <div ref={ref} className={`mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 ${revealClass}`}>
        <div className="mb-14 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Membros do clube
          </p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Membros</h2>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {TEAM.map((member) => (
            <a
              key={member.name}
              href={member.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group text-center"
            >
              <div className="relative mx-auto mb-4 h-28 w-28 overflow-hidden rounded-full ring-4 ring-transparent transition-all group-hover:ring-brand-200 dark:group-hover:ring-brand-500/30 sm:h-32 sm:w-32">
                <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{member.name}</h4>
              <span className="text-sm text-gray-500 dark:text-gray-400">{member.role}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
